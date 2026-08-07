"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { validateDistanceRange, type UpsertDistanceDefinitionPayload } from "../_api/distance-definitions-api"
import type { DistanceDefinitionRecord, DistanceSlaTarget, DistanceDefinitionStatus } from "../_types"
import { KmRangePreview } from "./km-range-preview"

const schema = z
  .object({
    name: z.string().min(2, "Tanım adı en az 2 karakter olmalidir."),
    description: z.string().optional(),
    minKm: z.coerce.number().nonnegative("Minimum mesafe 0 veya buyuk olmalidir."),
    hasUpperLimit: z.boolean(),
    maxKm: z.coerce.number().nullable(),
    slaTarget: z.enum(["24h", "48h", "72h"]),
  })
  .superRefine((value, context) => {
    if (value.hasUpperLimit) {
      if (value.maxKm === null || Number.isNaN(value.maxKm)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxKm"],
          message: "Üst limit açık olduğunda maxKm zorunludur.",
        })
        return
      }

      if (value.maxKm < value.minKm) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxKm"],
          message: "maxKm, minKm değerinden küçük olamaz.",
        })
      }
    }
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  mode: "create" | "edit"
  initial?: DistanceDefinitionRecord
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UpsertDistanceDefinitionPayload) => Promise<void>
}

const defaultValues: FormValues = {
  name: "",
  description: "",
  minKm: 0,
  hasUpperLimit: true,
  maxKm: 0,
  slaTarget: "24h",
}

function toPayload(values: FormValues, status: DistanceDefinitionStatus): UpsertDistanceDefinitionPayload {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    minKm: Number(values.minKm.toFixed(2)),
    maxKm: values.hasUpperLimit && values.maxKm !== null ? Number(values.maxKm.toFixed(2)) : null,
    hasUpperLimit: values.hasUpperLimit,
    slaTarget: values.slaTarget as DistanceSlaTarget,
    status,
  }
}

export function DistanceDefinitionFormModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collisionMessage, setCollisionMessage] = useState<string | null>(null)
  const [gapWarnings, setGapWarnings] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  })

  const hasUpperLimit = form.watch("hasUpperLimit")
  const minKm = form.watch("minKm")
  const maxKm = form.watch("maxKm")
  const effectiveStatus = initial?.status ?? "active"
  const isDirty = form.formState.isDirty

  useEffect(() => {
    if (!hasUpperLimit) {
      form.setValue("maxKm", null, { shouldValidate: true })
    } else if (form.getValues("maxKm") === null) {
      form.setValue("maxKm", form.getValues("minKm"), { shouldValidate: true })
    }
  }, [form, hasUpperLimit])

  useEffect(() => {
    form.reset(
      initial
        ? {
            name: initial.name,
            description: initial.description ?? "",
            minKm: initial.minKm,
            hasUpperLimit: initial.hasUpperLimit,
            maxKm: initial.maxKm,
            slaTarget: initial.slaTarget,
          }
        : defaultValues,
    )
    setCollisionMessage(null)
    setGapWarnings([])
  }, [form, initial, open])

  useEffect(() => {
    if (mode === "create" && !isDirty) {
      setCollisionMessage(null)
      setGapWarnings([])
      return
    }

    const timer = setTimeout(() => {
      const payload = {
        minKm: Number(minKm),
        maxKm: maxKm === null ? null : Number(maxKm),
        hasUpperLimit,
        status: effectiveStatus,
      }

      if (Number.isNaN(payload.minKm) || (payload.maxKm !== null && Number.isNaN(payload.maxKm))) {
        return
      }

      void validateDistanceRange(payload, initial?.id).then((result) => {
        if (!result.isValid) {
          const first = result.collisions[0]
          setCollisionMessage(
            `Dikkat! girdiğiniz değerler '${first?.conflictingName ?? "bir tanım"}' ile çakışmaktadır.`,
          )
        } else {
          setCollisionMessage(null)
        }
        setGapWarnings(result.gapWarnings)
      })
    }, 250)

    return () => clearTimeout(timer)
  }, [effectiveStatus, hasUpperLimit, initial?.id, isDirty, maxKm, minKm, mode])

  const submitHandler = form.handleSubmit(async (values) => {
    const payload = toPayload(values, effectiveStatus)

    const validation = await validateDistanceRange(
      {
        minKm: payload.minKm,
        maxKm: payload.maxKm,
        hasUpperLimit: payload.hasUpperLimit,
        status: payload.status,
      },
      initial?.id,
    )

    if (!validation.isValid) {
      const first = validation.collisions[0]
      setCollisionMessage(
        `Dikkat! girdiğiniz değerler '${first?.conflictingName ?? "bir tanım"}' ile çakışmaktadır.`,
      )
      return
    }

    setCollisionMessage(null)
    setGapWarnings(validation.gapWarnings)

    setIsSubmitting(true)
    try {
      await onSubmit(payload)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kayit islemi sirasinda hata olustu."
      setCollisionMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(78rem,calc(100%-2rem))] max-h-[90vh] overflow-y-auto p-8 sm:max-w-6xl">
        <DialogHeader className="space-y-1 pr-8">
          <DialogTitle>{mode === "create" ? "Yeni Mesafe Tanımı" : "Mesafe Tanımı Düzenle"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={submitHandler}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
              <div className="md:col-span-2 xl:col-span-12">
                <h3 className="text-sm font-semibold text-slate-900">1. Tanım Bilgileri</h3>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 xl:col-span-12">
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="Örnek: Şehir İçi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 xl:col-span-12">
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="Opsiyonel" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 xl:col-span-12 mt-1">
                <h3 className="text-sm font-semibold text-slate-900">2. Tanım Değerleri</h3>
              </div>

              <FormField
                control={form.control}
                name="minKm"
                render={({ field }) => (
                  <FormItem className="xl:col-span-4">
                    <FormLabel>Min Km</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value ?? ""}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const raw = event.target.value
                          field.onChange(raw === "" ? 0 : Number(raw))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxKm"
                render={({ field }) => (
                  <FormItem className="xl:col-span-4">
                    <FormLabel>Max Km</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={!hasUpperLimit}
                        value={field.value ?? ""}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const raw = event.target.value
                          field.onChange(raw === "" ? null : Number(raw))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasUpperLimit"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-3 xl:col-span-4 xl:self-end">
                    <div>
                      <FormLabel>Max Km Limitsiz</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={(checked: CheckedState) => field.onChange(!checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 xl:col-span-12">
                <KmRangePreview minKm={Number(minKm || 0)} maxKm={maxKm} hasUpperLimit={hasUpperLimit} />
              </div>

              <div className="md:col-span-2 xl:col-span-12 mt-1">
                <h3 className="text-sm font-semibold text-slate-900">3. Operasyonel</h3>
              </div>

              <FormField
                control={form.control}
                name="slaTarget"
                render={({ field }) => (
                  <FormItem className="xl:col-span-4">
                    <FormLabel>Hedeflenen Teslimat Süresi</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="SLA seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="24h">24 Saat</SelectItem>
                        <SelectItem value="48h">48 Saat</SelectItem>
                        <SelectItem value="72h">72 Saat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {collisionMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {collisionMessage}
              </div>
            )}

            {gapWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {gapWarnings[0]}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Kaydet" : "Değişiklikleri Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
