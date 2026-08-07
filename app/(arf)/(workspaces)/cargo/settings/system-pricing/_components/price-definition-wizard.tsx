"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import { validatePricingRules, type UpsertPriceDefinitionInput } from "../_api/price-definitions-api"
import type {
  PriceDefinitionDetail,
  PriceRuleRow,
  PriceSurcharge,
} from "../_types"
import { RulesMatrixEditor } from "./rules-matrix-editor"
import { SurchargeEditor } from "./surcharge-editor"

const ruleSchema = z.object({
  id: z.string().min(1),
  unitType: z.enum(["desi", "kg"]),
  shipmentType: z.enum(["koli", "zarf", "palet"]),
  regionType: z.enum(["city_inner", "city_outer", "all_turkey", "line_based"]),
  regionLabel: z.string().min(1),
  rangeStart: z.number().min(0),
  rangeEnd: z.number().min(0),
  basePrice: z.number().min(0),
  incrementalPrice: z.number().min(0),
  sortOrder: z.number().min(1),
})

const surchargeSchema = z.object({
  smsNotificationFee: z.number().min(0),
  codCommissionType: z.enum(["fixed", "percent"]),
  codCommissionValue: z.number().min(0),
  pickupFee: z.number().min(0),
  remoteAreaDeliveryFee: z.number().min(0),
  customServices: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      fee: z.number().min(0),
    }),
  ).default([]),
})

const formSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Tarife adı zorunludur."),
    code: z.string().optional(),
    type: z.enum(["b2b", "b2c"]),
    isDefault: z.boolean(),
    validFrom: z.string().min(1, "Başlangıç tarihi zorunludur."),
    validTo: z.string().min(1, "Bitiş tarihi zorunludur."),
    status: z.enum(["active", "passive"]),
    rules: z.array(ruleSchema).min(1, "En az bir Tanım satırı gerekir."),
    surcharges: surchargeSchema,
  })
  .superRefine((value, context) => {
    if (value.validFrom > value.validTo) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validTo"],
        message: "Geçerlilik bitiş tarihi başlangıç tarihinden önce olamaz.",
      })
    }
  })

type WizardFormValues = z.infer<typeof formSchema>

interface Props {
  title: string
  submitLabel: string
  submittingLabel: string
  initialValue?: PriceDefinitionDetail
  onCancel: () => void
  onSubmit: (payload: UpsertPriceDefinitionInput & { id?: string }) => Promise<void>
}

const WIZARD_STEPS = [
  { key: 1 as const, title: "Fiyatlandırma Kimliği" },
  { key: 2 as const, title: "Fiyat Matrisi" },
  { key: 3 as const, title: "Ek Hizmetler" },
]

function createDefaultRule(index: number): PriceRuleRow {
  return {
    id: `rule-${Date.now()}-${index}`,
    unitType: "desi",
    shipmentType: "koli",
    regionType: "city_inner",
    regionLabel: "Şehir İçi (0-50 km)",
    rangeStart: 0,
    rangeEnd: 5,
    basePrice: 0,
    incrementalPrice: 0,
    sortOrder: index + 1,
  }
}

function createDefaultSurcharges(): PriceSurcharge {
  return {
    smsNotificationFee: 2.5,
    codCommissionType: "fixed",
    codCommissionValue: 40,
    pickupFee: 20,
    remoteAreaDeliveryFee: 65,
    customServices: [],
  }
}

export function PriceDefinitionWizard({
  title: _title,
  submitLabel,
  submittingLabel,
  initialValue,
  onCancel,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overlapErrors, setOverlapErrors] = useState<string[]>([])
  const [gapWarnings, setGapWarnings] = useState<string[]>([])

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: initialValue
      ? {
          id: initialValue.id,
          name: initialValue.name,
          code: initialValue.code,
          type: initialValue.type,
          isDefault: initialValue.isDefault,
          validFrom: initialValue.validFrom,
          validTo: initialValue.validTo,
          status: initialValue.status,
          rules: initialValue.rules,
          // Keep compatibility for old records that do not include custom services yet.
          surcharges: {
            ...initialValue.surcharges,
            customServices: initialValue.surcharges.customServices ?? [],
          },
        }
      : {
          id: undefined,
          name: "",
          code: "",
          type: "b2c",
          isDefault: false,
          validFrom: "",
          validTo: "",
          status: "active",
          rules: [createDefaultRule(0)],
          surcharges: createDefaultSurcharges(),
        },
  })

  const rules = form.watch("rules")
  const surcharges = form.watch("surcharges")

  const setRuleField = <K extends keyof PriceRuleRow>(index: number, key: K, value: PriceRuleRow[K]) => {
    const nextRules = [...rules]
    nextRules[index] = {
      ...nextRules[index],
      [key]: value,
      sortOrder: index + 1,
    }
    form.setValue("rules", nextRules, { shouldDirty: true, shouldValidate: true })
  }

  const addRule = () => {
    form.setValue("rules", [...rules, createDefaultRule(rules.length)], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const duplicateRule = (index: number) => {
    const source = rules[index]
    const next = {
      ...source,
      id: `rule-${Date.now()}-${index}`,
      sortOrder: rules.length + 1,
    }
    form.setValue("rules", [...rules, next], { shouldDirty: true, shouldValidate: true })
  }

  const removeRule = (index: number) => {
    if (rules.length <= 1) {
      return
    }
    const next = rules.filter((_, rowIndex) => rowIndex !== index).map((row, rowIndex) => ({
      ...row,
      sortOrder: rowIndex + 1,
    }))
    form.setValue("rules", next, { shouldDirty: true, shouldValidate: true })
  }

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger(["name", "validFrom", "validTo"])
      if (!valid) {
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const valid = await form.trigger("rules")
      if (!valid) {
        return
      }
      setStep(3)
    }
  }

  const prevStep = () => {
    if (step === 2) {
      setStep(1)
      return
    }
    if (step === 3) {
      setStep(2)
    }
  }

  const submitHandler = form.handleSubmit(async (values) => {
    const validation = await validatePricingRules(values.rules)
    setOverlapErrors(validation.overlapErrors)
    setGapWarnings(validation.gapWarnings)

    if (validation.overlapErrors.length > 0) {
      setStep(2)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        id: values.id,
        code: values.code?.trim() || initialValue?.code || `TRF-${Date.now().toString().slice(-6)}`,
        name: values.name.trim(),
        type: values.type ?? initialValue?.type ?? "b2c",
        isDefault: values.isDefault ?? initialValue?.isDefault ?? false,
        validFrom: values.validFrom,
        validTo: values.validTo,
        status: values.status ?? initialValue?.status ?? "active",
        rules: values.rules,
        surcharges: values.surcharges,
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Form {...form}>
      <form className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]" onSubmit={submitHandler}>
        <aside className="space-y-2">
          {WIZARD_STEPS.map((wizardStep, index) => {
            const isActive = wizardStep.key === step
            const isCompleted = wizardStep.key < step

            return (
              <button
                key={wizardStep.key}
                type="button"
                onClick={() => setStep(wizardStep.key)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : isCompleted
                      ? "border-lime-200 bg-lime-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive
                        ? "bg-white/15 text-white"
                        : isCompleted
                          ? "bg-lime-200 text-slate-900"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium leading-snug">{wizardStep.title}</div>
                </div>
              </button>
            )
          })}
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarife Adı</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Örn: E-Ticaret Standart 2026" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geçerlilik Başlangıç</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geçerlilik Bitiş</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
            {overlapErrors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p className="font-medium">Kesişen Tanım var:</p>
                <ul className="mt-1 list-disc pl-5">
                  {overlapErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {gapWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <p className="font-medium">Tanım boşluğu uyarısı:</p>
                <ul className="mt-1 list-disc pl-5">
                  {gapWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <RulesMatrixEditor
              rows={rules}
              onAdd={addRule}
              onDuplicate={duplicateRule}
              onRemove={removeRule}
              onChange={setRuleField}
            />
            <FormMessage>{form.formState.errors.rules?.message}</FormMessage>
            </div>
          )}

          {step === 3 && (
            <SurchargeEditor
              value={surcharges}
              onChange={(key, val) => {
                const updated = { ...form.getValues("surcharges"), [key]: val }
                form.setValue("surcharges", updated, { shouldDirty: true, shouldValidate: true })
              }}
            />
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Vazgeç
            </Button>
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              Geri
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                İleri
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
