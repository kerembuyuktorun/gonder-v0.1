"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { tr } from "date-fns/locale"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Check, ChevronsUpDown, Circle, CircleCheckBig, Minus, Plus, X } from "lucide-react"
import type {
  CreateInvoicePayload,
  InvoiceCustomerInfo,
  OpenCargoRecord,
} from "../_types/financial"
import { getInvoiceCreateBaseInitData, VADE_PRESET_OPTIONS } from "../../../../finance/headquarters/invoices/new/_mock/invoice-create-mock-data"
import type { VadePreset } from "../../../../finance/headquarters/invoices/new/_types"

/* ─── Helpers ─── */

type TahsilatDurumu = "tahsil_edilecek" | "tahsil_edildi"
type StokTakibi = "cikis_var" | "cikis_yok"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function cargoTaxRate(cargo: OpenCargoRecord): number {
  const base = cargo.baseAmount ?? Number((cargo.amount / 1.2).toFixed(2))
  const vatAmount = typeof cargo.vat === "number" ? cargo.vat : cargo.amount - base
  if (base <= 0 || vatAmount <= 0) return 0
  return Math.round((vatAmount / base) * 100)
}

function cargoUnitLabel(cargo: OpenCargoRecord): string {
  if (!cargo.pieceList) return "Adet"
  const parts = cargo.pieceList.trim().split(" ")
  return parts.length > 1 ? parts.slice(1).join(" ") : "Adet"
}

function parseDateInput(value?: string | null): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return undefined
  const parsed = new Date(y, m - 1, d)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDateLabel(value?: string | null): string {
  const parsed = parseDateInput(value)
  if (!parsed) return "Tarih seçin"
  return parsed.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
}

function presetToDate(baseDate: string, preset: VadePreset): string {
  const found = VADE_PRESET_OPTIONS.find((o) => o.id === preset)
  const date = new Date(baseDate)
  if (!found || Number.isNaN(date.getTime())) return baseDate
  date.setDate(date.getDate() + found.days)
  return date.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/* ─── Component ─── */

export function CreateInvoiceModal({
  open,
  onOpenChange,
  selectedCargos,
  customerInfo,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCargos: OpenCargoRecord[]
  customerInfo: InvoiceCustomerInfo
  onConfirm: (payload: CreateInvoicePayload) => void
}) {
  const baseData = useMemo(() => getInvoiceCreateBaseInitData(), [])

  // ─── Form State ───
  const [invoiceName, setInvoiceName] = useState("")
  const [tahsilatDurumu, setTahsilatDurumu] = useState<TahsilatDurumu>("tahsil_edilecek")
  const [duzenlemeTarihi, setDuzenlemeTarihi] = useState("")
  const [vadeTarihi, setVadeTarihi] = useState("")
  const [vadePreset, setVadePreset] = useState<VadePreset>("same_day")
  const [note, setNote] = useState("")
  const [notaBakiyeEkle, setNotaBakiyeEkle] = useState(false)
  const [showInvoiceNoFields, setShowInvoiceNoFields] = useState(false)
  const [faturaNoSeri, setFaturaNoSeri] = useState("")
  const [faturaNoSira, setFaturaNoSira] = useState("")
  const [showIbanFields, setShowIbanFields] = useState(false)
  const [ibanBilgisiId, setIbanBilgisiId] = useState<string | undefined>()
  const [stokTakibi, setStokTakibi] = useState<StokTakibi>("cikis_var")
  const [kategoriId, setKategoriId] = useState("standart")
  const [etiketIds, setEtiketIds] = useState<string[]>([])

  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false)
  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState("")
  const [tagQuery, setTagQuery] = useState("")
  const [categoryOptions, setCategoryOptions] = useState(baseData.kategoriler)
  const [tagOptions, setTagOptions] = useState(baseData.etiketler)

  // ─── Totals ───
  const subTotal = useMemo(
    () => selectedCargos.reduce((acc, c) => acc + (c.baseAmount ?? Number((c.amount / 1.2).toFixed(2))), 0),
    [selectedCargos],
  )
  const vatTotal = useMemo(
    () =>
      selectedCargos.reduce((acc, c) => {
        if (typeof c.vat === "number") return acc + c.vat
        const base = c.baseAmount ?? Number((c.amount / 1.2).toFixed(2))
        return acc + (c.amount - base)
      }, 0),
    [selectedCargos],
  )
  const grandTotal = useMemo(() => subTotal + vatTotal, [subTotal, vatTotal])

  // ─── Derived ───
  const selectedCategory = useMemo(() => categoryOptions.find((c) => c.id === kategoriId), [categoryOptions, kategoriId])
  const selectedTagLabels = useMemo(() => tagOptions.filter((t) => etiketIds.includes(t.id)).map((t) => t.label), [etiketIds, tagOptions])
  const selectedIban = useMemo(() => baseData.ibanBilgileri.find((i) => i.id === ibanBilgisiId), [ibanBilgisiId, baseData.ibanBilgileri])

  const normalizedCategoryQuery = categoryQuery.trim()
  const normalizedTagQuery = tagQuery.trim()
  const canCreateCategory = normalizedCategoryQuery.length > 0 && !categoryOptions.some((i) => i.label.toLocaleLowerCase("tr") === normalizedCategoryQuery.toLocaleLowerCase("tr"))
  const canCreateTag = normalizedTagQuery.length > 0 && !tagOptions.some((i) => i.label.toLocaleLowerCase("tr") === normalizedTagQuery.toLocaleLowerCase("tr"))

  // ─── Reset on open ───
  useEffect(() => {
    if (!open) return
    const today = todayIso()
    setInvoiceName(`${customerInfo.tradeName} - ${selectedCargos.length} Kargo Faturası`)
    setTahsilatDurumu("tahsil_edilecek")
    setDuzenlemeTarihi(today)
    setVadeTarihi(today)
    setVadePreset("same_day")
    setNote("")
    setNotaBakiyeEkle(false)
    setShowInvoiceNoFields(false)
    setFaturaNoSeri("")
    setFaturaNoSira("")
    setShowIbanFields(false)
    setIbanBilgisiId(undefined)
    setStokTakibi("cikis_var")
    setKategoriId("standart")
    setEtiketIds([])
    setCategoryOptions(baseData.kategoriler)
    setTagOptions(baseData.etiketler)
  }, [open, customerInfo.tradeName, selectedCargos.length, baseData])

  // ─── Handlers ───
  const onUpdateDuzenlemeTarihi = (dateValue: string) => {
    setDuzenlemeTarihi(dateValue)
    setVadeTarihi(dateValue)
    setVadePreset("same_day")
  }

  const onApplyVadePreset = (preset: VadePreset) => {
    setVadePreset(preset)
    setVadeTarihi(presetToDate(duzenlemeTarihi, preset))
  }

  const createCategoryFromQuery = () => {
    if (!canCreateCategory) return
    const newCat = { id: `custom-category-${Date.now().toString(36)}`, label: normalizedCategoryQuery }
    setCategoryOptions((prev) => [...prev, newCat])
    setKategoriId(newCat.id)
    setCategoryQuery("")
    setCategoryPopoverOpen(false)
  }

  const createTagFromQuery = () => {
    if (!canCreateTag) return
    const newTag = { id: `custom-tag-${Date.now().toString(36)}`, label: normalizedTagQuery }
    setTagOptions((prev) => [...prev, newTag])
    setEtiketIds((prev) => (prev.includes(newTag.id) ? prev : [...prev, newTag.id]))
    setTagQuery("")
  }

  const handleConfirm = () => {
    onConfirm({
      invoiceName,
      issueDate: duzenlemeTarihi,
      dueDate: vadeTarihi,
      note,
      subTotal,
      vatTotal,
      grandTotal,
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] max-w-5xl! w-[90vw] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Kargo Faturası Oluştur</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* ── Fatura Bilgileri Card ── */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Fatura Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid items-stretch gap-6 lg:grid-cols-[1.25fr_0.65fr]">
              {/* ── Sol Sütun ── */}
              <div className="space-y-5">
                {/* Fatura İsmi */}
                <div>
                  <Label className="mb-1.5 text-xs text-slate-700">Fatura İsmi</Label>
                  <Input
                    value={invoiceName}
                    placeholder="Fatura İsmi"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInvoiceName(e.target.value)}
                  />
                </div>

                {/* Müşteri Bilgileri (readonly) */}
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Müşteri Tipi</p>
                    <p className="text-sm font-medium text-slate-800">{customerInfo.customerType === "corporate" ? "Kurumsal" : "Bireysel"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Şirket Ünvanı</p>
                    <p className="text-sm font-medium text-slate-800">{customerInfo.tradeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vergi Dairesi</p>
                    <p className="text-sm font-medium text-slate-800">{customerInfo.taxOffice || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vergi / TCKN</p>
                    <p className="text-sm font-medium text-slate-800">{customerInfo.taxNumber || "-"}</p>
                  </div>
                </div>

                {/* Tahsilat Durumu */}
                <div>
                  <Label className="mb-1.5 text-xs text-slate-700">Tahsilat Durumu</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-11 justify-start gap-2 ${tahsilatDurumu === "tahsil_edilecek" ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300" : ""}`}
                      onClick={() => setTahsilatDurumu("tahsil_edilecek")}
                    >
                      {tahsilatDurumu === "tahsil_edilecek" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                      Tahsil Edilecek
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-11 justify-start gap-2 ${tahsilatDurumu === "tahsil_edildi" ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300" : ""}`}
                      onClick={() => setTahsilatDurumu("tahsil_edildi")}
                    >
                      {tahsilatDurumu === "tahsil_edildi" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                      Tahsil Edildi
                    </Button>
                  </div>
                </div>

                {/* Düzenleme Tarihi */}
                <div>
                  <Label className="mb-1.5 text-xs text-slate-700">Düzenleme Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-11 w-full justify-start rounded-2xl border-slate-200 bg-white px-3 text-left text-base font-normal hover:bg-slate-50 ${duzenlemeTarihi ? "text-slate-800" : "text-slate-500"}`}
                      >
                        <CalendarDays className="mr-2 size-5 text-slate-500" />
                        <span>{formatDateLabel(duzenlemeTarihi)}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto rounded-3xl border-slate-200 p-1 shadow-xl">
                      <Calendar
                        mode="single"
                        locale={tr}
                        selected={parseDateInput(duzenlemeTarihi)}
                        onSelect={(date: Date | undefined) => {
                          if (date) onUpdateDuzenlemeTarihi(formatDateForInput(date))
                        }}
                        className="rounded-3xl p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Vade Tarihi */}
                <div className="rounded-lg border border-slate-200 p-3">
                  <Label className="mb-2 text-xs text-slate-700">Vade Tarihi</Label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {VADE_PRESET_OPTIONS.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`h-8 gap-1 rounded-full px-3 ${vadePreset === preset.id ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300" : ""}`}
                        onClick={() => onApplyVadePreset(preset.id)}
                      >
                        {vadePreset === preset.id ? <CircleCheckBig className="size-3.5" /> : <Circle className="size-3.5" />}
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-11 w-full justify-start rounded-2xl border-slate-200 bg-white px-3 text-left text-base font-normal hover:bg-slate-50 ${vadeTarihi ? "text-slate-800" : "text-slate-500"}`}
                      >
                        <CalendarDays className="mr-2 size-5 text-slate-500" />
                        <span>{formatDateLabel(vadeTarihi)}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto rounded-3xl border-slate-200 p-1 shadow-xl">
                      {(() => {
                        const minDueDate = parseDateInput(duzenlemeTarihi)

                        return (
                          <Calendar
                            mode="single"
                            locale={tr}
                            selected={parseDateInput(vadeTarihi)}
                            disabled={minDueDate ? { before: minDueDate } : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (date) setVadeTarihi(formatDateForInput(date))
                            }}
                            className="rounded-3xl p-3"
                          />
                        )
                      })()}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* ── Sağ Sütun ── */}
              <div className="h-full self-stretch space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {/* Kategori */}
                <div>
                  <Label className="mb-1.5 text-xs text-slate-700">Fatura Kategorisi</Label>
                  <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" role="combobox" aria-expanded={categoryPopoverOpen} className="h-10 w-full justify-between bg-white font-normal">
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
                                <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-primary" onMouseDown={(e) => { e.preventDefault(); createCategoryFromQuery() }}>
                                  <Plus className="size-3.5" />
                                  &quot;{normalizedCategoryQuery}&quot; kategorisini ekle
                                </button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {categoryOptions.map((item) => (
                              <CommandItem key={item.id} value={item.label} onSelect={() => { setKategoriId(item.id); setCategoryQuery(""); setCategoryPopoverOpen(false) }} className="flex items-center justify-between">
                                <span>{item.label}</span>
                                {kategoriId === item.id && <Check className="size-4 text-emerald-600" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Etiket */}
                <div>
                  <Label className="mb-1.5 text-xs text-slate-700">Etiket</Label>
                  <Popover open={tagsPopoverOpen} onOpenChange={setTagsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" role="combobox" aria-expanded={tagsPopoverOpen} className="h-10 w-full justify-between bg-white font-normal">
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
                                <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-primary" onMouseDown={(e) => { e.preventDefault(); createTagFromQuery() }}>
                                  <Plus className="size-3.5" />
                                  &quot;{normalizedTagQuery}&quot; etiketini ekle
                                </button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {tagOptions.map((etiket) => {
                              const selected = etiketIds.includes(etiket.id)
                              return (
                                <CommandItem key={etiket.id} value={etiket.label} onSelect={() => { setEtiketIds((prev) => selected ? prev.filter((id) => id !== etiket.id) : [...prev, etiket.id]); setTagQuery("") }} className="flex items-center justify-between">
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
                  {/* Fatura No */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700! hover:text-slate-900!"
                    onClick={() => { if (!showInvoiceNoFields && !faturaNoSeri) setFaturaNoSeri("FTR"); setShowInvoiceNoFields((p) => !p) }}
                  >
                    {showInvoiceNoFields ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    {showInvoiceNoFields ? "Fatura No Ekle Kapat" : "Fatura No Ekle"}
                  </button>

                  {showInvoiceNoFields && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 text-xs text-slate-600">Fatura No Seri</Label>
                        <Input value={faturaNoSeri} onChange={(e: ChangeEvent<HTMLInputElement>) => setFaturaNoSeri(e.target.value)} />
                      </div>
                      <div>
                        <Label className="mb-1.5 text-xs text-slate-600">Fatura No Sıra</Label>
                        <Input value={faturaNoSira} onChange={(e: ChangeEvent<HTMLInputElement>) => setFaturaNoSira(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* Not */}
                  <div>
                    <Label className="mb-1.5 text-xs text-slate-700">Fatura Notu</Label>
                    <Textarea value={note} rows={3} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)} />
                    <div className="mt-2 flex items-center gap-2">
                      <Checkbox id="note-bakiye-cargo" checked={notaBakiyeEkle} onCheckedChange={(checked: boolean | "indeterminate") => setNotaBakiyeEkle(checked === true)} />
                      <Label htmlFor="note-bakiye-cargo" className="text-sm text-slate-700">Müşteri bakiyesini not olarak ekle</Label>
                    </div>
                  </div>

                  {/* IBAN */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700! hover:text-slate-900!"
                    onClick={() => setShowIbanFields((p) => !p)}
                  >
                    {showIbanFields ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    {showIbanFields ? "IBAN Bilgisi Ekle Kapat" : "IBAN Bilgisi Ekle"}
                  </button>

                  {showIbanFields && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 text-xs text-slate-600">IBAN Bilgisi Ekle</Label>
                        <Select value={ibanBilgisiId ?? "none"} onValueChange={(v: string) => setIbanBilgisiId(v === "none" ? undefined : v)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="IBAN seçiniz" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Seçilmedi</SelectItem>
                            {baseData.ibanBilgileri.map((iban) => (<SelectItem key={iban.id} value={iban.id}>{iban.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-1.5 text-xs text-slate-600">Seçilen IBAN</Label>
                        <div className="flex min-h-9 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                          <span>{selectedIban?.iban ?? "-"}</span>
                          {selectedIban && (
                            <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setIbanBilgisiId(undefined)}>
                              <X className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stok Takibi */}
                  <div className="border-t border-slate-200 pt-3">
                    <Label className="mb-2 text-xs text-slate-700">Stok Takibi</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-11 justify-start gap-2 ${stokTakibi === "cikis_var" ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300" : ""}`}
                        onClick={() => setStokTakibi("cikis_var")}
                      >
                        {stokTakibi === "cikis_var" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                        Yapılsın
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-11 justify-start gap-2 ${stokTakibi === "cikis_yok" ? "border-lime-300 bg-lime-300 text-slate-900 hover:bg-lime-300" : ""}`}
                        onClick={() => setStokTakibi("cikis_yok")}
                      >
                        {stokTakibi === "cikis_yok" ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
                        Yapılmasın
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Hizmet / Ürün Satırları (Seçili Kargolar) ── */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Hizmet / Ürün Satırları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {selectedCargos.map((cargo, index) => {
                  const baseAmount = cargo.baseAmount ?? Number((cargo.amount / 1.2).toFixed(2))
                  const taxRate = cargoTaxRate(cargo)

                  return (
                    <div key={cargo.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="mb-2 text-xs font-medium text-slate-400">Seçili Kargo {index + 1}</div>
                      <div className="grid gap-3 lg:grid-cols-12">
                        <div className="lg:col-span-3">
                          <Label className="mb-1.5 text-xs text-slate-600">Hizmet / Ürün</Label>
                          <Input readOnly value={cargo.trackingNo} className="h-11 bg-slate-50 cursor-default border-slate-200 font-medium text-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>

                        <div className="lg:col-span-1">
                          <Label className="mb-1.5 text-xs text-slate-600">Miktar</Label>
                          <Input readOnly value={String(cargo.pieceCount)} className="h-11 bg-slate-50 cursor-default border-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="mb-1.5 text-xs text-slate-600">Birim</Label>
                          <Input readOnly value={cargoUnitLabel(cargo)} className="h-11 bg-slate-50 cursor-default border-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="mb-1.5 text-xs text-slate-600">Fiyat</Label>
                          <Input readOnly value={formatNumber(baseAmount)} className="h-11 bg-slate-50 cursor-default border-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="mb-1.5 text-xs text-slate-600">Vergi</Label>
                          <Input readOnly value={`%${taxRate}`} className="h-11 bg-slate-50 cursor-default border-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="mb-1.5 text-xs text-slate-600">Toplam</Label>
                          <Input readOnly value={formatNumber(cargo.amount)} className="h-11 bg-slate-50 cursor-default border-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 select-none" />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {selectedCargos.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    Faturalandırılacak kargo seçilmedi.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Toplamlar ── */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Toplamlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-3 text-sm text-slate-700">
                <span>Ara Toplam</span>
                <span className="font-medium">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
                <span>Toplam KDV</span>
                <span className="font-medium">{formatCurrency(vatTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-700">
                <span>Genel Toplam</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={!invoiceName || !duzenlemeTarihi || !vadeTarihi}>
            Fatura Oluştur
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
