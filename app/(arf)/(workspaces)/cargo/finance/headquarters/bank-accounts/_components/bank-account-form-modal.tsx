"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { findExistingBankAccountByIban, type UpsertBankAccountPayload } from "../_api/bank-accounts-api"
import { resolveBankNameByCode } from "../_mock/turkey-banks-data"
import type { AccountType, BankAccountStatus, Currency, IntegrationStatus } from "../_types"
import { extractBankCode, IbanInput, sanitizeIbanInput, validateTurkishIban } from "./iban-input"
import { Check, ChevronDown } from "lucide-react"

const formSchema = z
  .object({
    id: z.string().optional(),
    iban: z.string().min(1, "IBAN zorunludur.").refine((value) => validateTurkishIban(value).isValid, {
      message: "Geçerli bir TR IBAN girin.",
    }),
    bankName: z.string().min(1, "Banka kodu tanınamadı."),
    branchName: z.string().min(2, "Banka şube adı zorunludur."),
    currency: z.enum(["TRY", "USD", "EUR"]),
    accountHolder: z.string().min(2, "Hesap sahibi zorunludur."),
    label: z.string().min(2, "Etiket zorunludur."),
    accountType: z.enum(["collection", "expense"]),
    status: z.enum(["active", "closed"]),
    isOpenToAllBranches: z.boolean(),
    allowedBranchIds: z.array(z.string()),
    integrationEnabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (
      value.accountType === "collection" &&
      !value.isOpenToAllBranches &&
      value.allowedBranchIds.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedBranchIds"],
        message: "En az bir şube seçmelisiniz.",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

export interface BranchOption {
  id: string
  name: string
}

export interface BankAccountFormInitialValues {
  id?: string
  iban: string
  bankName: string
  branchName: string
  currency: Currency
  accountHolder: string
  label: string
  accountType: AccountType
  isOpenToAllBranches: boolean
  allowedBranchIds: string[]
  integrationStatus: IntegrationStatus
  status: BankAccountStatus
  // Read-only metadata (shown in edit mode only)
  balance?: number
  createdByName?: string
  createdAt?: string
  updatedAt?: string
  lastDataSyncAt?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  submittingLabel: string
  branches: BranchOption[]
  initialValues?: BankAccountFormInitialValues
  onSubmit: (payload: UpsertBankAccountPayload & { id?: string }) => Promise<void>
}

function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
}

const ALL_STEPS = [
  { id: "financial", title: "Temel Finansal\nVeriler" },
  { id: "identity", title: "Hesap\nKimliği" },
  { id: "scope", title: "Kapsam ve\nEntegrasyon" },
  { id: "meta", title: "Kayıt\nBilgisi" },
]

const defaultValues: FormValues = {
  id: undefined,
  iban: "",
  bankName: "",
  branchName: "",
  currency: "TRY",
  accountHolder: "",
  label: "",
  accountType: "collection",
  status: "active",
  isOpenToAllBranches: true,
  allowedBranchIds: [],
  integrationEnabled: true,
}

export function BankAccountFormModal({
  open,
  onOpenChange,
  title,
  submitLabel,
  submittingLabel,
  branches,
  initialValues,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchesOpen, setBranchesOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(
    () => initialValues?.id ? ALL_STEPS : ALL_STEPS.filter((s) => s.id !== "meta"),
    [initialValues?.id],
  )
  const currentStep = steps[stepIndex]

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues,
  })

  useEffect(() => {
    setStepIndex(0)
    form.reset(
      initialValues
        ? {
            id: initialValues.id,
            iban: sanitizeIbanInput(initialValues.iban),
            bankName: initialValues.bankName,
            branchName: initialValues.branchName,
            currency: initialValues.currency,
            accountHolder: initialValues.accountHolder,
            label: initialValues.label,
            accountType: initialValues.accountType,
            status: initialValues.status ?? "active",
            isOpenToAllBranches: initialValues.isOpenToAllBranches,
            allowedBranchIds: initialValues.allowedBranchIds,
            integrationEnabled: initialValues.integrationStatus === "active",
          }
        : defaultValues,
    )
  }, [form, initialValues, open])

  const ibanValue = form.watch("iban")
  const isOpenToAllBranches = form.watch("isOpenToAllBranches")
  const accountType = form.watch("accountType")
  const allowedBranchIds = form.watch("allowedBranchIds")

  useEffect(() => {
    const bankCode = extractBankCode(ibanValue)
    const bankName = resolveBankNameByCode(bankCode)
    if (form.getValues("bankName") !== bankName) {
      form.setValue("bankName", bankName, { shouldValidate: true })
    }
  }, [form, ibanValue])

  useEffect(() => {
    if (accountType === "expense") {
      form.setValue("isOpenToAllBranches", false)
      form.setValue("allowedBranchIds", [])
    }
  }, [accountType, form])

  const selectedBranchNames = useMemo(
    () =>
      branches
        .filter((branch) => allowedBranchIds.includes(branch.id))
        .map((branch) => branch.name),
    [allowedBranchIds, branches],
  )

  const submitHandler = form.handleSubmit(async (values) => {
    const normalizedIban = sanitizeIbanInput(values.iban)
    const duplicate = await findExistingBankAccountByIban(normalizedIban)

    if (duplicate && duplicate.id !== values.id) {
      const shouldContinue = window.confirm(
        `Bu IBAN sistemde '${duplicate.label}' etiketi ile zaten kayıtlı. Devam etmek istiyor musunuz?`,
      )
      if (!shouldContinue) {
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        id: values.id,
        iban: normalizedIban,
        bankName: values.bankName,
        branchName: values.branchName.trim(),
        currency: values.currency,
        accountHolder: values.accountHolder.trim(),
        label: values.label.trim(),
        accountType: values.accountType,
        status: values.status,
        isOpenToAllBranches: values.accountType === "expense" ? false : values.isOpenToAllBranches,
        allowedBranchIds:
          values.accountType === "expense"
            ? []
            : values.isOpenToAllBranches
              ? branches.map((branch) => branch.id)
              : values.allowedBranchIds,
        integrationStatus: values.integrationEnabled ? "active" : "passive",
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-[1200px]! xl:max-w-[1320px]! overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submitHandler}>
            <div className="grid gap-5 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="space-y-2">
                {steps.map((step, index) => {
                  const isActive = index === stepIndex
                  const isCompleted = index < stepIndex
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setStepIndex(index)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left transition",
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : isCompleted
                            ? "border-lime-200 bg-lime-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                            isActive
                              ? "bg-white/15 text-white"
                              : isCompleted
                                ? "bg-lime-200 text-slate-900"
                                : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {index + 1}
                        </div>
                        <div className="whitespace-pre-line text-sm font-medium leading-snug">{step.title}</div>
                      </div>
                    </button>
                  )
                })}
              </aside>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{currentStep.title.replace(/\n/g, " ")}</h3>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                    {stepIndex + 1} / {steps.length}
                  </Badge>
                </div>

                {currentStep.id === "financial" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>IBAN</FormLabel>
                          <FormControl>
                            <IbanInput {...field} value={field.value} onValueChange={field.onChange} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                          </FormControl>
                          <FormDescription>TR ile başlamalı, 26 karakter olmalı ve checksum kontrolünü geçmelidir.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banka Adı</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly disabled placeholder="IBAN'dan otomatik çözümlenir" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="branchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banka Şube Adı</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Örn: Kadıköy Şubesi" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Döviz Cinsi</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Döviz seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                              <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep.id === "identity" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hesap Sahibi / Unvan</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Şirket unvanı veya kişi adı" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etiket</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Örn: Marmara Bölgesi Tahsilatları" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hesap Türü</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Hesap türü seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="collection">Tahsilat Hesabı</SelectItem>
                              <SelectItem value="expense">Gider / Ödeme Hesabı</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {accountType === "expense"
                              ? "Bu hesap yalnızca Genel Merkez kullanımı için işaretlenir."
                              : "Tahsilat hesapları şubelere kontrollü biçimde açılır."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hesap Durumu</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Durum seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Aktif — Kullanımda</SelectItem>
                              <SelectItem value="closed">Pasif — Kapalı</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep.id === "scope" && (
                  <div className="space-y-4">
                    {accountType === "collection" && (
                      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <FormField
                          control={form.control}
                          name="isOpenToAllBranches"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <div className="space-y-0.5">
                                <FormLabel>Tüm Şubelere Açık</FormLabel>
                                <FormDescription>İşaretlenirse bu hesap tüm aktif şubelerin ekranında görünür.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {!isOpenToAllBranches && (
                          <FormField
                            control={form.control}
                            name="allowedBranchIds"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Şube Whitelist</FormLabel>
                                <Popover open={branchesOpen} onOpenChange={setBranchesOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {selectedBranchNames.length === 0
                                          ? "Şube seçin"
                                          : selectedBranchNames.length === 1
                                            ? selectedBranchNames[0]
                                            : `${selectedBranchNames.length} şube seçildi`}
                                        <ChevronDown className="ml-2 size-4 opacity-60" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command filter={(value: string, search: string) => (normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0)}>
                                      <CommandInput placeholder="Şube ara..." />
                                      <CommandList className="max-h-72">
                                        <CommandEmpty>Şube bulunamadı.</CommandEmpty>
                                        <CommandGroup>
                                          {branches.map((branch) => {
                                            const checked = field.value.includes(branch.id)
                                            return (
                                              <CommandItem
                                                key={branch.id}
                                                value={branch.name}
                                                onSelect={() => {
                                                  field.onChange(
                                                    checked
                                                      ? field.value.filter((item: string) => item !== branch.id)
                                                      : [...field.value, branch.id],
                                                  )
                                                }}
                                              >
                                                <Checkbox checked={checked} className="mr-2" />
                                                {branch.name}
                                                <Check className={cn("ml-auto size-4", checked ? "opacity-100" : "opacity-0")} />
                                              </CommandItem>
                                            )
                                          })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormDescription>Bu IBAN yalnızca seçili şubelerin ödeme ekranında görünür.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}

                    {accountType === "expense" && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Gider / Ödeme hesabı seçildiği için bu kayıt otomatik olarak yalnızca Genel Merkez kullanımında tutulur.
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="integrationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div className="space-y-0.5">
                            <FormLabel>Banka Entegrasyonu Aktif mi?</FormLabel>
                            <FormDescription>
                              Aktif durumda ekstre verisi API veya MT940 akışından sisteme otomatik alınır.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep.id === "meta" && initialValues && (
                  <div className="space-y-5">
                    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">Mevcut Bakiye</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          {initialValues.balance != null
                            ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: initialValues.currency, minimumFractionDigits: 2 }).format(initialValues.balance)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Para Birimi</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">{initialValues.currency}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">Oluşturan</p>
                        <p className="mt-1 font-medium text-slate-900">{initialValues.createdByName ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Oluşturulma</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {initialValues.createdAt
                            ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(initialValues.createdAt))
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Son Güncelleme</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {initialValues.updatedAt
                            ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(initialValues.updatedAt))
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Son Veri Senkronu</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {initialValues.lastDataSyncAt
                            ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(initialValues.lastDataSyncAt))
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))} disabled={stepIndex === 0}>
                  Geri
                </Button>
                {stepIndex < steps.length - 1 ? (
                  <Button type="button" onClick={() => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}>
                    İleri
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? submittingLabel : submitLabel}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
