"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Check, ChevronsUpDown, Circle, CircleCheckBig, Minus, Plus, Search, X } from "lucide-react"
import { submitInvoiceCreation } from "../_api/invoice-create-api"
import { createInitialFormState, createInitialLine, VADE_PRESET_OPTIONS } from "../_mock/invoice-create-mock-data"
import type {
  FaturaEkKalem,
  FaturaEkKalemTipi,
  FaturaOlusturFormState,
  FaturaSatiri,
  InvoiceComputedTotals,
  InvoiceCreateInitData,
  VadePreset,
} from "../_types"
import { FaturaSatirlarSection } from "./invoice-lines-section"
import { FaturaToplamlarCard } from "./invoice-totals-card"

interface Props {
  initialData: InvoiceCreateInitData
}

function round2(value: number): number {
  return Number(value.toFixed(2))
}

function mapVatWithholdingTypeToRatio(type: FaturaEkKalemTipi): string | undefined {
  const ratioMap: Partial<Record<FaturaEkKalemTipi, string>> = {
    vat_withholding_10_10: "10/10",
    vat_withholding_9_10: "9/10",
    vat_withholding_7_10: "7/10",
    vat_withholding_5_10: "5/10",
    vat_withholding_4_10: "4/10",
    vat_withholding_3_10: "3/10",
    vat_withholding_2_10: "2/10",
  }

  return ratioMap[type]
}

function parseTevkifatFraction(value?: string): number {
  if (!value || !value.includes("/")) {
    return 0
  }

  const [payText, paydaText] = value.split("/")
  const pay = Number(payText)
  const payda = Number(paydaText)

  if (!Number.isFinite(pay) || !Number.isFinite(payda) || payda <= 0) {
    return 0
  }

  return pay / payda
}

function formatTevkifatLabel(ratio: string): string {
  const fraction = parseTevkifatFraction(ratio)
  return `KDV Tevkifat (%${Math.round(fraction * 100)})`
}

function computeLine(line: FaturaSatiri): { grossTotal: number; discountTotal: number; otvTotal: number; subTotal: number; vatTotal: number; grandTotal: number; tevkifatTutari: number } {
  // Kargo satırlarında birimFiyat toplam net fiyattır; miktar ile çarpılmaz
  const baseAmount = line.urunTipi === "cargo"
    ? round2(Math.max(0, line.birimFiyat))
    : round2(Math.max(0, line.miktar) * Math.max(0, line.birimFiyat))
  const rawDiscount = Math.max(line.indirimTutari ?? 0, 0)
  const discountAmount = line.indirimTipi === "rate"
    ? round2((baseAmount * Math.min(rawDiscount, 100)) / 100)
    : round2(Math.min(rawDiscount, baseAmount))
  const taxableAmount = round2(baseAmount - discountAmount)

  const vatBeforeTevkifat = round2((taxableAmount * Math.max(0, line.vergiOrani)) / 100)
  const tevkifatTutari = round2(vatBeforeTevkifat * parseTevkifatFraction(line.tevkifatOrani))

  const rawOtv = Math.max(0, line.otvOrani ?? 0)
  const otv = line.otvTipi === "amount"
    ? round2(rawOtv)
    : round2((baseAmount * Math.min(rawOtv, 100)) / 100)

  const grandTotal = round2(taxableAmount + vatBeforeTevkifat + otv)

  return {
    grossTotal: baseAmount,
    discountTotal: discountAmount,
    otvTotal: otv,
    subTotal: taxableAmount,
    vatTotal: vatBeforeTevkifat,
    grandTotal,
    tevkifatTutari,
  }
}

function computeTotals(form: FaturaOlusturFormState): InvoiceComputedTotals {
  const lineTotals = form.satirlar.map((line) => {
    const computed = computeLine(line)
    return {
      id: line.id,
      grossTotal: computed.grossTotal,
      discountTotal: computed.discountTotal,
      otvTotal: computed.otvTotal,
      subTotal: computed.subTotal,
      vatTotal: computed.vatTotal,
      grandTotal: computed.grandTotal,
      tevkifatOrani: line.tevkifatOrani,
      tevkifatTutari: computed.tevkifatTutari,
    }
  })

  const lineGrossTotal = round2(lineTotals.reduce((sum, item) => sum + item.grossTotal, 0))
  const lineDiscountTotal = round2(lineTotals.reduce((sum, item) => sum + item.discountTotal, 0))
  const lineOtvTotal = round2(lineTotals.reduce((sum, item) => sum + item.otvTotal, 0))
  const lineSubTotal = round2(lineTotals.reduce((sum, item) => sum + item.subTotal, 0))
  const lineVatTotal = round2(lineTotals.reduce((sum, item) => sum + item.vatTotal, 0))
  const adjustmentsTotal = round2(
    form.ekKalemler
      .filter((item) => !item.type.startsWith("vat_withholding_"))
      .reduce((sum, item) => sum + item.amount, 0),
  )
  const tevkifatRowsMap = lineTotals.reduce<Record<string, number>>((acc, item) => {
    if (!item.tevkifatOrani || item.tevkifatTutari <= 0) {
      return acc
    }

    acc[item.tevkifatOrani] = round2((acc[item.tevkifatOrani] ?? 0) + item.tevkifatTutari)
    return acc
  }, {})
  const withholdingRows = Object.entries(tevkifatRowsMap).map(([ratio, amount]) => ({
    ratio,
    label: formatTevkifatLabel(ratio),
    amount: round2(amount),
  }))
  const tevkifatTotal = round2(withholdingRows.reduce((sum, item) => sum + item.amount, 0))

  return {
    lineGrossTotal,
    lineDiscountTotal,
    lineOtvTotal,
    lineSubTotal,
    lineVatTotal,
    adjustmentsTotal,
    tevkifatTotal,
    grandTotal: round2(lineSubTotal + lineVatTotal + lineOtvTotal + adjustmentsTotal - tevkifatTotal),
    lineTotals,
    withholdingRows,
  }
}

function presetToDate(baseDate: string, preset: VadePreset): string {
  const found = VADE_PRESET_OPTIONS.find((option) => option.id === preset)
  const date = new Date(baseDate)
  if (!found || Number.isNaN(date.getTime())) {
    return baseDate
  }
  date.setDate(date.getDate() + found.days)
  return date.toISOString().slice(0, 10)
}

function parseDateInput(value?: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const [yearText, monthText, dayText] = value.split("-")
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return undefined
  }

  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDateLabel(value?: string | null): string {
  const parsed = parseDateInput(value)
  if (!parsed) {
    return "Tarih seçin"
  }

  return parsed.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isBeforeDate(candidate?: string | null, base?: string | null): boolean {
  const candidateDate = parseDateInput(candidate)
  const baseDate = parseDateInput(base)

  if (!candidateDate || !baseDate) {
    return false
  }

  return candidateDate.getTime() < baseDate.getTime()
}

function buildExtraItem(type: FaturaEkKalemTipi, lineSubTotal: number, lineVatTotal: number): FaturaEkKalem {
  const map: Record<FaturaEkKalemTipi, { label: string; multiplier: number }> = {
    subtotal_discount: { label: "Ara Toplam İndirimi", multiplier: -0.05 },
    withholding_20: { label: "%20 Stopaj", multiplier: -0.2 },
    withholding_17: { label: "%17 Stopaj", multiplier: -0.17 },
    withholding_15: { label: "%15 Stopaj", multiplier: -0.15 },
    withholding_10: { label: "%10 Stopaj", multiplier: -0.1 },
    withholding_5: { label: "%5 Stopaj", multiplier: -0.05 },
    withholding_3: { label: "%3 Stopaj", multiplier: -0.03 },
    vat_withholding_10_10: { label: "KDV Tevk. (%100)", multiplier: -1 },
    vat_withholding_9_10: { label: "KDV Tevk. (%90)", multiplier: -0.9 },
    vat_withholding_7_10: { label: "KDV Tevk. (%70)", multiplier: -0.7 },
    vat_withholding_5_10: { label: "KDV Tevk. (%50)", multiplier: -0.5 },
    vat_withholding_4_10: { label: "KDV Tevk. (%40)", multiplier: -0.4 },
    vat_withholding_3_10: { label: "KDV Tevk. (%30)", multiplier: -0.3 },
    vat_withholding_2_10: { label: "KDV Tevk. (%20)", multiplier: -0.2 },
  }

  const meta = map[type]
  const baseAmount = type.startsWith("vat_withholding_") ? lineVatTotal : lineSubTotal

  return {
    id: `extra-${type}-${Date.now()}`,
    type,
    label: meta.label,
    amount: round2(baseAmount * meta.multiplier),
  }
}

export function FaturaOlusturFormSection({ initialData }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FaturaOlusturFormState>(() => createInitialFormState())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false)
  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState("")
  const [tagQuery, setTagQuery] = useState("")
  const [categoryOptions, setCategoryOptions] = useState(() => initialData.kategoriler)
  const [tagOptions, setTagOptions] = useState(() => initialData.etiketler)
  const [showInvoiceNoFields, setShowInvoiceNoFields] = useState(false)
  const [showIbanFields, setShowIbanFields] = useState(false)

  const totals = useMemo(() => computeTotals(form), [form])
  const satirToplamMap = useMemo(
    () => Object.fromEntries(totals.lineTotals.map((lineTotal) => [lineTotal.id, lineTotal.grandTotal])),
    [totals.lineTotals],
  )

  const selectedCustomer = useMemo(
    () => initialData.customers.find((customer) => customer.id === form.musteriId),
    [form.musteriId, initialData.customers],
  )

  const selectedIban = useMemo(
    () => initialData.ibanBilgileri.find((iban) => iban.id === form.ibanBilgisiId),
    [form.ibanBilgisiId, initialData.ibanBilgileri],
  )

  const selectedCategory = useMemo(
    () => categoryOptions.find((category) => category.id === form.kategoriId),
    [categoryOptions, form.kategoriId],
  )

  const selectedTagLabels = useMemo(
    () => tagOptions.filter((tag) => form.etiketIds.includes(tag.id)).map((tag) => tag.label),
    [form.etiketIds, tagOptions],
  )

  const normalizedCategoryQuery = categoryQuery.trim()
  const normalizedTagQuery = tagQuery.trim()

  const canCreateCategory =
    normalizedCategoryQuery.length > 0 &&
    !categoryOptions.some((item) => item.label.toLocaleLowerCase("tr") === normalizedCategoryQuery.toLocaleLowerCase("tr"))

  const canCreateTag =
    normalizedTagQuery.length > 0 &&
    !tagOptions.some((item) => item.label.toLocaleLowerCase("tr") === normalizedTagQuery.toLocaleLowerCase("tr"))

  const createCategoryFromQuery = () => {
    if (!canCreateCategory) {
      return
    }

    const safeLabel = normalizedCategoryQuery
    const newCategory = {
      id: `custom-category-${Date.now().toString(36)}`,
      label: safeLabel,
    }

    setCategoryOptions((prev) => [...prev, newCategory])
    onUpdateForm("kategoriId", newCategory.id)
    setCategoryQuery("")
    setCategoryPopoverOpen(false)
  }

  const createTagFromQuery = () => {
    if (!canCreateTag) {
      return
    }

    const safeLabel = normalizedTagQuery
    const newTag = {
      id: `custom-tag-${Date.now().toString(36)}`,
      label: safeLabel,
    }

    setTagOptions((prev) => [...prev, newTag])
    onUpdateForm("etiketIds", form.etiketIds.includes(newTag.id) ? form.etiketIds : [...form.etiketIds, newTag.id])
    setTagQuery("")
  }

  const onUpdateForm = <K extends keyof FaturaOlusturFormState>(key: K, value: FaturaOlusturFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onUpdateDuzenlemeTarihi = (dateValue: string) => {
    setForm((prev) => {
      return {
        ...prev,
        duzenlemeTarihi: dateValue,
        vadeTarihi: dateValue,
        vadePreset: "same_day",
      }
    })
  }

  const onUpdateVadeTarihi = (dateValue: string) => {
    setForm((prev) => ({
      ...prev,
      vadeTarihi: isBeforeDate(dateValue, prev.duzenlemeTarihi) ? prev.duzenlemeTarihi : dateValue,
    }))
  }

  const onSelectCustomer = (customerId: string) => {
    const clearCargoSelections = (lines: FaturaSatiri[]): FaturaSatiri[] =>
      lines.map((line) =>
        line.urunTipi === "cargo"
          ? {
              ...line,
              urunId: undefined,
              urunLabel: undefined,
              urunTipi: undefined,
              miktar: 1,
              birim: "Adet",
              birimFiyat: 0,
              birimFiyatKilidi: false,
            }
          : line,
      )

    if (customerId === "none") {
      setForm((prev) => ({
        ...prev,
        musteriId: undefined,
        satirlar: clearCargoSelections(prev.satirlar),
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      musteriId: customerId,
      satirlar: clearCargoSelections(prev.satirlar),
    }))
  }

  const onAddLine = () => {
    setForm((prev) => ({ ...prev, satirlar: [...prev.satirlar, createInitialLine()] }))
  }

  const onRemoveLine = (lineId: string) => {
    setForm((prev) => ({
      ...prev,
      satirlar: prev.satirlar.length === 1 ? prev.satirlar : prev.satirlar.filter((line) => line.id !== lineId),
    }))
  }

  const onUpdateLine = (lineId: string, patch: Partial<FaturaSatiri>) => {
    setForm((prev) => ({
      ...prev,
      satirlar: prev.satirlar.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    }))
  }

  const onApplyLineAction = (lineId: string, action: "aciklama" | "indirim" | "otv" | "tevkifat") => {
    const patches: Record<typeof action, Partial<FaturaSatiri>> = {
      aciklama: { aciklama: "" },
      indirim: { indirimTutari: 0, indirimTipi: "amount" },
      otv: { otvOrani: 0, otvTipi: "rate" },
      tevkifat: { tevkifatOrani: "9/10" },
    }

    onUpdateLine(lineId, patches[action])
  }

  const onApplyTevkifat = (lineId: string, oran: string) => {
    onUpdateLine(lineId, { tevkifatOrani: oran })
  }

  const onAddEkKalem = (type: FaturaEkKalemTipi) => {
    setForm((prev) => {
      const isStopaj = type.startsWith("withholding_")
      const isVatWithholding = type.startsWith("vat_withholding_")
      const alreadyExists = prev.ekKalemler.some((item) => item.type === type)
      const hasAnyStopaj = prev.ekKalemler.some((item) => item.type.startsWith("withholding_"))
      const hasAnyVatWithholding = prev.satirlar.some((line) => Boolean(line.tevkifatOrani))
      if (alreadyExists || (isStopaj && hasAnyStopaj) || (isVatWithholding && hasAnyVatWithholding)) {
        return prev
      }

      const tevkifatOrani = mapVatWithholdingTypeToRatio(type)

      if (tevkifatOrani) {
        return {
          ...prev,
          satirlar: prev.satirlar.map((line) => ({ ...line, tevkifatOrani })),
        }
      }

      return {
        ...prev,
        ekKalemler: [...prev.ekKalemler, buildExtraItem(type, totals.lineSubTotal, totals.lineVatTotal)],
      }
    })
  }

  const onRemoveEkKalem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      ekKalemler: prev.ekKalemler.filter((item) => item.id !== id),
    }))
  }

  const onUpdateEkKalemAmount = (id: string, amount: number) => {
    setForm((prev) => ({
      ...prev,
      ekKalemler: prev.ekKalemler.map((item) => (item.id === id ? { ...item, amount } : item)),
    }))
  }

  const onClearTevkifat = (ratio: string) => {
    setForm((prev) => ({
      ...prev,
      satirlar: prev.satirlar.map((line) =>
        line.tevkifatOrani === ratio ? { ...line, tevkifatOrani: undefined } : line,
      ),
    }))
  }

  const onApplyVadePreset = (preset: VadePreset) => {
    setForm((prev) => ({
      ...prev,
      vadePreset: preset,
      vadeTarihi: presetToDate(prev.duzenlemeTarihi, preset),
    }))
  }

  const validateForm = (): string | null => {
    if (!form.musteriId) {
      return "Kayıtlı müşteri seçimi zorunludur."
    }

    if (totals.grandTotal <= 0) {
      return "Genel toplam 0 olamaz. En az bir satır tutarı giriniz."
    }

    if (form.tahsilatDurumu === "tahsil_edildi") {
      if (!form.tahsilTarihi) {
        return "Tahsil tarihi zorunludur."
      }
      if (!form.tahsilHesapId) {
        return "Tahsilat hesabı seçiniz."
      }
    }

    if (isBeforeDate(form.vadeTarihi, form.duzenlemeTarihi)) {
      return "Vade tarihi, düzenleme tarihinden önce olamaz."
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await submitInvoiceCreation({ form, totals })
      router.push("/arf/cargo/finance/headquarters/invoices")
      router.refresh()
    } catch {
      setFormError("Fatura kaydı sırasında bir hata oluştu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold text-slate-900">Fatura Bilgileri</CardTitle>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              Kaydet
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid items-stretch gap-6 lg:grid-cols-[1.25fr_0.65fr]">
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Fatura İsmi</Label>
              <Input
                value={form.faturaIsmi}
                placeholder="Fatura İsmi"
                onChange={(event: ChangeEvent<HTMLInputElement>) => onUpdateForm("faturaIsmi", event.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Müşteri Adı</Label>
              <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerPopoverOpen}
                    className="h-10 w-full justify-between font-normal text-slate-700"
                  >
                    <span className="truncate">{selectedCustomer?.name ?? "Müşteri Adı"}</span>
                    <Search className="size-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandInput placeholder="Müşteri ara..." />
                    <CommandList>
                      <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {initialData.customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={`${customer.name} ${customer.taxNumber} ${customer.taxOffice}`}
                            onSelect={() => {
                              onSelectCustomer(customer.id)
                              setCustomerPopoverOpen(false)
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>{customer.name}</span>
                            {form.musteriId === customer.id && <Check className="size-4 text-emerald-600" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedCustomer && (
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Vergi Dairesi</p>
                  <p className="text-sm font-medium text-slate-800">{selectedCustomer.taxOffice || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Vergi / TCKN</p>
                  <p className="text-sm font-medium text-slate-800">{selectedCustomer.taxNumber || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500">Fatura Adresi</p>
                  <p className="text-sm font-medium text-slate-800">{selectedCustomer.billingAddress || "-"}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Tahsilat Durumu</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={`h-11 justify-start gap-2 ${
                    form.tahsilatDurumu === "tahsil_edilecek"
                      ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300"
                      : ""
                  }`}
                  onClick={() => onUpdateForm("tahsilatDurumu", "tahsil_edilecek")}
                >
                  {form.tahsilatDurumu === "tahsil_edilecek" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                  Tahsil Edilecek
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`h-11 justify-start gap-2 ${
                    form.tahsilatDurumu === "tahsil_edildi"
                      ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300"
                      : ""
                  }`}
                  onClick={() => onUpdateForm("tahsilatDurumu", "tahsil_edildi")}
                >
                  {form.tahsilatDurumu === "tahsil_edildi" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                  Tahsil Edildi
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Düzenleme Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 w-full justify-start rounded-2xl border-slate-200 bg-white px-3 text-left text-base font-normal hover:bg-slate-50 ${
                      form.duzenlemeTarihi ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    <CalendarDays className="mr-2 size-5 text-slate-500" />
                    <span>{formatDateLabel(form.duzenlemeTarihi)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto rounded-3xl border-slate-200 p-1 shadow-xl">
                  <Calendar
                    mode="single"
                    locale={tr}
                    selected={parseDateInput(form.duzenlemeTarihi)}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        onUpdateDuzenlemeTarihi(formatDateForInput(date))
                      }
                    }}
                    className="rounded-3xl p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <Label className="mb-2 text-xs text-slate-700">Vade Tarihi</Label>
              <div className="mb-3 flex flex-wrap gap-2">
                {VADE_PRESET_OPTIONS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    size="sm"
                    variant="outline"
                    className={`h-8 gap-1 rounded-full px-3 ${
                      form.vadePreset === preset.id
                        ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300"
                        : ""
                    }`}
                    onClick={() => onApplyVadePreset(preset.id)}
                  >
                    {form.vadePreset === preset.id ? <CircleCheckBig className="size-3.5" /> : <Circle className="size-3.5" />}
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-11 w-full justify-start rounded-2xl border-slate-200 bg-white px-3 text-left text-base font-normal hover:bg-slate-50 ${
                        form.vadeTarihi ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      <CalendarDays className="mr-2 size-5 text-slate-500" />
                      <span>{formatDateLabel(form.vadeTarihi)}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto rounded-3xl border-slate-200 p-1 shadow-xl">
                    {(() => {
                      const minDueDate = parseDateInput(form.duzenlemeTarihi)

                      return (
                    <Calendar
                      mode="single"
                      locale={tr}
                      selected={parseDateInput(form.vadeTarihi)}
                      disabled={minDueDate ? { before: minDueDate } : undefined}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          onUpdateVadeTarihi(formatDateForInput(date))
                        }
                      }}
                      className="rounded-3xl p-3"
                    />
                      )
                    })()}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="h-full self-stretch space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Fatura Kategorisi</Label>
              <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryPopoverOpen}
                    className="h-10 w-full justify-between bg-white font-normal"
                  >
                    <span className="truncate">{selectedCategory?.label ?? "Kategorisiz"}</span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandInput placeholder="Kategori ara..." value={categoryQuery} onValueChange={setCategoryQuery} />
                    <CommandList>
                      <CommandEmpty>
                        <div className="space-y-2 p-2 text-xs text-slate-500">
                          <p>Kategori bulunamadı.</p>
                          {canCreateCategory && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                createCategoryFromQuery()
                              }}
                            >
                              <Plus className="size-3.5" />
                              "{normalizedCategoryQuery}" kategorisini ekle
                            </button>
                          )}
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {categoryOptions.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.label}
                            onSelect={() => {
                              onUpdateForm("kategoriId", item.id)
                              setCategoryQuery("")
                              setCategoryPopoverOpen(false)
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>{item.label}</span>
                            {form.kategoriId === item.id && <Check className="size-4 text-emerald-600" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-1.5 text-xs text-slate-700">Etiket</Label>
              <Popover open={tagsPopoverOpen} onOpenChange={setTagsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagsPopoverOpen}
                    className="h-10 w-full justify-between bg-white font-normal"
                  >
                    <span className="truncate">{selectedTagLabels.length > 0 ? selectedTagLabels.join(", ") : "Etiketsiz"}</span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandInput placeholder="Etiket ara..." value={tagQuery} onValueChange={setTagQuery} />
                    <CommandList>
                      <CommandEmpty>
                        <div className="space-y-2 p-2 text-xs text-slate-500">
                          <p>Etiket bulunamadı.</p>
                          {canCreateTag && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                createTagFromQuery()
                              }}
                            >
                              <Plus className="size-3.5" />
                              "{normalizedTagQuery}" etiketini ekle
                            </button>
                          )}
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {tagOptions.map((etiket) => {
                          const selected = form.etiketIds.includes(etiket.id)
                          return (
                            <CommandItem
                              key={etiket.id}
                              value={etiket.label}
                              onSelect={() => {
                                onUpdateForm(
                                  "etiketIds",
                                  selected
                                    ? form.etiketIds.filter((id) => id !== etiket.id)
                                    : [...form.etiketIds, etiket.id],
                                )
                                setTagQuery("")
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>{etiket.label}</span>
                              {selected && <Check className="size-4 text-emerald-600" />}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700! hover:text-slate-900!"
                onClick={() => {
                  if (!showInvoiceNoFields && !form.faturaNoSeri) {
                    onUpdateForm("faturaNoSeri", "FTR")
                  }
                  setShowInvoiceNoFields((prev) => !prev)
                }}
              >
                {showInvoiceNoFields ? <Minus className="size-4" /> : <Plus className="size-4" />}
                {showInvoiceNoFields ? "Fatura No Ekle Kapat" : "Fatura No Ekle"}
              </button>

              {showInvoiceNoFields && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 text-xs text-slate-600">Fatura No Seri</Label>
                    <Input
                      value={form.faturaNoSeri ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => onUpdateForm("faturaNoSeri", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-slate-600">Fatura No Sıra</Label>
                    <Input
                      value={form.faturaNoSira ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => onUpdateForm("faturaNoSira", event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="mb-1.5 text-xs text-slate-700">Fatura Notu</Label>
                <Textarea
                  value={form.faturaNotu ?? ""}
                  rows={3}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onUpdateForm("faturaNotu", event.target.value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id="note-bakiye"
                    checked={form.notaBakiyeEkle}
                    onCheckedChange={(checked: boolean | "indeterminate") => onUpdateForm("notaBakiyeEkle", checked === true)}
                  />
                  <Label htmlFor="note-bakiye" className="text-sm text-slate-700">
                    Müşteri bakiyesini not olarak ekle
                  </Label>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700! hover:text-slate-900!"
                onClick={() => setShowIbanFields((prev) => !prev)}
              >
                {showIbanFields ? <Minus className="size-4" /> : <Plus className="size-4" />}
                {showIbanFields ? "IBAN Bilgisi Ekle Kapat" : "IBAN Bilgisi Ekle"}
              </button>

              {showIbanFields && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 text-xs text-slate-600">IBAN Bilgisi Ekle</Label>
                    <Select
                      value={form.ibanBilgisiId ?? "none"}
                      onValueChange={(value: string) => onUpdateForm("ibanBilgisiId", value === "none" ? undefined : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="IBAN seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seçilmedi</SelectItem>
                        {initialData.ibanBilgileri.map((iban) => (
                          <SelectItem key={iban.id} value={iban.id}>
                            {iban.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1.5 text-xs text-slate-600">Seçilen IBAN</Label>
                    <div className="flex min-h-9 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                      <span>{selectedIban?.iban ?? "-"}</span>
                      {selectedIban && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onUpdateForm("ibanBilgisiId", undefined)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3">
                <Label className="mb-2 text-xs text-slate-700">Stok Takibi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 justify-start gap-2 ${
                      form.stokTakibi === "cikis_var"
                        ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300"
                        : ""
                    }`}
                    onClick={() => onUpdateForm("stokTakibi", "cikis_var")}
                  >
                    {form.stokTakibi === "cikis_var" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                    Yapılsın
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 justify-start gap-2 ${
                      form.stokTakibi === "cikis_yok"
                        ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300"
                        : ""
                    }`}
                    onClick={() => onUpdateForm("stokTakibi", "cikis_yok")}
                  >
                    {form.stokTakibi === "cikis_yok" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                    Yapılmasın
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <FaturaSatirlarSection
          satirlar={form.satirlar}
          doviz={form.doviz}
          selectedCustomerId={form.musteriId}
          hizmetUrunler={initialData.hizmetUrunler}
          acikKargolar={initialData.acikKargolar}
          birimler={initialData.birimler}
          vergiOranlari={initialData.vergiOranlari}
          satirToplamlari={satirToplamMap}
          onAddLine={onAddLine}
          onRemoveLine={onRemoveLine}
          onUpdateLine={onUpdateLine}
          onApplyLineAction={onApplyLineAction}
          onApplyTevkifat={onApplyTevkifat}
        />

        <FaturaToplamlarCard
          doviz={form.doviz}
          totals={totals}
          ekKalemler={form.ekKalemler}
          onAddEkKalem={onAddEkKalem}
          onRemoveEkKalem={onRemoveEkKalem}
          onUpdateEkKalemAmount={onUpdateEkKalemAmount}
          onClearTevkifat={onClearTevkifat}
        />
      </div>
    </div>
  )
}
