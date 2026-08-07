"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import { FileUploader } from "@hascanb/arf-ui-kit/file-kit"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Pencil, Plus, Power, Trash2, X, CalendarDays } from "lucide-react"
import type { CustomerContractRecord } from "../../_data/customers"

const CUSTOMER_CONTRACTS_STORAGE_PREFIX = "arf:customers:contracts:v1:"

const getContractsStorageKey = (customerId: string) => `${CUSTOMER_CONTRACTS_STORAGE_PREFIX}${customerId}`

type PricingType = "desi" | "desi_dynamic"
type PackageType = "koli" | "palet" | "cuval" | "zarf"

interface PricingRule {
  id: string
  pricingType: PricingType
  packageType: PackageType
  distanceKey: string
  startDesi: number
  endDesi: number
  fee: number
  dynamicIncrement: number
}

interface ContractViewModel extends CustomerContractRecord {
  documentNo?: string
  attachmentUrl?: string
  pricingRules: PricingRule[]
  isActive: boolean
}

interface ContractFormState {
  contractNo: string
  documentNo: string
  startDate?: Date
  endDate?: Date
  note: string
}

const distanceOptions = [
  { value: "0_100", label: "0-100 km" },
  { value: "101_300", label: "101-300 km" },
  { value: "301_700", label: "301-700 km" },
  { value: "701_plus", label: "701+ km" },
]

const emptyRule = (): PricingRule => ({
  id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  pricingType: "desi",
  packageType: "koli",
  distanceKey: distanceOptions[0].value,
  startDesi: 1,
  endDesi: 5,
  fee: 0,
  dynamicIncrement: 0,
})

const emptyForm: ContractFormState = {
  contractNo: "",
  documentNo: "",
  startDate: undefined,
  endDate: undefined,
  note: "",
}

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  const normalized = value.includes(" ") ? value.split(" ")[0] : value.split("T")[0]
  const [year, month, day] = normalized.split("-").map((part) => Number(part))

  if (!year || !month || !day) {
    return undefined
  }

  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function toStorageDate(value?: Date): string {
  if (!value) return ""
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateLabel(value?: Date): string {
  if (!value) return "gg.aa.yyyy"
  return value.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatStorageDate(value: string): string {
  const parsed = parseDateOnly(value)
  if (!parsed) return value
  return formatDateLabel(parsed)
}

function formatPricingModel(rules: PricingRule[]): string {
  if (rules.length === 0) return "Fiyat kuralı tanımlanmadı"

  const first = rules[0]
  const typeLabel = first.pricingType === "desi" ? "Desi" : "Desi Dinamik"
  const packageLabel = first.packageType.charAt(0).toUpperCase() + first.packageType.slice(1)
  const distanceLabel = distanceOptions.find((item) => item.value === first.distanceKey)?.label ?? "Mesafe"
  return `${typeLabel} • ${packageLabel} • ${distanceLabel}`
}

function simulateDynamicPrice(rule: PricingRule, desi: number): number {
  if (rule.pricingType !== "desi_dynamic") {
    return rule.fee
  }

  if (desi <= rule.endDesi) {
    return rule.fee
  }

  return rule.fee + (desi - rule.endDesi) * rule.dynamicIncrement
}

export function CustomerContractsSection({
  customerId,
  contracts,
}: {
  customerId: string
  contracts: CustomerContractRecord[]
}) {
  const [rows, setRows] = useState<ContractViewModel[]>([])
  const [isStorageHydrated, setIsStorageHydrated] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContractFormState>(emptyForm)
  const [rules, setRules] = useState<PricingRule[]>([emptyRule()])
  const [files, setFiles] = useState<File[]>([])
  const [errorText, setErrorText] = useState("")
  const [sampleDesi, setSampleDesi] = useState(6)

  useEffect(() => {
    const fallbackRows = contracts.map((contract) => ({
      ...contract,
      documentNo: contract.documentNo ?? contract.contractNo,
      pricingRules: [emptyRule()],
      isActive: contract.status === "active",
    }))

    if (typeof window === "undefined") {
      setRows(fallbackRows)
      setIsStorageHydrated(true)
      return
    }

    try {
      const raw = localStorage.getItem(getContractsStorageKey(customerId))
      if (!raw) {
        setRows(fallbackRows)
        setIsStorageHydrated(true)
        return
      }

      const parsed = JSON.parse(raw) as Array<CustomerContractRecord & Partial<ContractViewModel>>
      const restoredRows = parsed.map((contract) => ({
        ...contract,
        documentNo: contract.documentNo ?? contract.contractNo,
        pricingRules:
          Array.isArray(contract.pricingRules) && contract.pricingRules.length > 0
            ? contract.pricingRules
            : [emptyRule()],
        isActive: typeof contract.isActive === "boolean" ? contract.isActive : contract.status === "active",
      }))

      setRows(restoredRows)
      setIsStorageHydrated(true)
    } catch {
      setRows(fallbackRows)
      setIsStorageHydrated(true)
    }
  }, [contracts, customerId])

  useEffect(() => {
    if (!isStorageHydrated) {
      return
    }

    if (typeof window === "undefined") {
      return
    }

    try {
      const serializableRows = rows.map((contract) => ({
        ...contract,
        attachmentUrl: contract.attachmentUrl?.startsWith("blob:") ? undefined : contract.attachmentUrl,
      }))

      localStorage.setItem(getContractsStorageKey(customerId), JSON.stringify(serializableRows))
    } catch {
      // ignore storage write errors in demo flow
    }
  }, [customerId, isStorageHydrated, rows])

  useEffect(() => {
    return () => {
      rows.forEach((row) => {
        if (row.attachmentUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(row.attachmentUrl)
        }
      })
    }
  }, [rows])

  const dynamicRule = useMemo(
    () => rules.find((rule) => rule.pricingType === "desi_dynamic") ?? null,
    [rules],
  )

  const dynamicPreviewPrice = useMemo(() => {
    if (!dynamicRule) return null
    return simulateDynamicPrice(dynamicRule, sampleDesi)
  }, [dynamicRule, sampleDesi])

  const openCreateModal = () => {
    setEditingId(null)
    setIsModalOpen(true)
    setForm(emptyForm)
    setRules([emptyRule()])
    setFiles([])
    setErrorText("")
    setSampleDesi(6)
  }

  const closeModal = () => {
    setEditingId(null)
    setIsModalOpen(false)
    setErrorText("")
  }

  const openEditModal = (contract: ContractViewModel) => {
    setEditingId(contract.id)
    setIsModalOpen(true)
    setForm({
      contractNo: contract.contractNo,
      documentNo: contract.documentNo ?? contract.contractNo,
      startDate: parseDateOnly(contract.startDate),
      endDate: parseDateOnly(contract.endDate),
      note: contract.note ?? "",
    })
    setRules(contract.pricingRules.length > 0 ? contract.pricingRules : [emptyRule()])
    setFiles([])
    setErrorText("")
    setSampleDesi(6)
  }

  const updateRule = (id: string, patch: Partial<PricingRule>) => {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)))
  }

  const removeRule = (id: string) => {
    setRules((current) => {
      if (current.length === 1) return current
      return current.filter((rule) => rule.id !== id)
    })
  }

  const handleSave = () => {
    if (!form.contractNo.trim() || !form.documentNo.trim() || !form.startDate || !form.endDate) {
      setErrorText("Sözleşme no, belge no, başlangıç ve bitiş tarihleri zorunludur.")
      return
    }

    if (form.endDate.getTime() < form.startDate.getTime()) {
      setErrorText("Bitiş tarihi başlangıç tarihinden önce olamaz.")
      return
    }

    if (rules.length === 0) {
      setErrorText("En az bir fiyat kuralı eklemelisiniz.")
      return
    }

    const hasInvalidRange = rules.some((rule) => rule.startDesi > rule.endDesi)
    if (hasInvalidRange) {
      setErrorText("Başlangıç desi, bitiş desiden büyük olamaz.")
      return
    }

    const uploadedFile = files[0]
    const current = editingId ? rows.find((row) => row.id === editingId) : undefined
    const nextIsActive = current?.isActive ?? true
    const nextStatus = nextIsActive ? "active" : "draft"

    let attachmentName = current?.attachmentName
    let attachmentUrl = current?.attachmentUrl

    if (uploadedFile) {
      attachmentName = uploadedFile.name
      attachmentUrl = URL.createObjectURL(uploadedFile)
      if (current?.attachmentUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.attachmentUrl)
      }
    }

    const next: ContractViewModel = {
      id: editingId ?? `ctr-${Date.now()}`,
      contractNo: form.contractNo.trim(),
      documentNo: form.documentNo.trim(),
      type: current?.type ?? "standart",
      startDate: toStorageDate(form.startDate),
      endDate: toStorageDate(form.endDate),
      pricingModel: formatPricingModel(rules),
      status: nextStatus,
      note: form.note.trim() || undefined,
      attachmentName,
      attachmentUrl,
      pricingRules: rules,
      isActive: nextIsActive,
    }

    setRows((prev) => {
      if (!editingId) {
        return [next, ...prev]
      }
      return prev.map((row) => (row.id === editingId ? next : row))
    })

    closeModal()
  }

  const handleConfirmDelete = () => {
    if (!deletingId) return
    const target = rows.find((row) => row.id === deletingId)
    if (target?.attachmentUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(target.attachmentUrl)
    }
    setRows((prev) => prev.filter((row) => row.id !== deletingId))
    setDeletingId(null)
  }

  const toggleContractActive = (contractId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== contractId) {
          return row
        }

        const nextIsActive = !row.isActive
        return {
          ...row,
          isActive: nextIsActive,
          status: nextIsActive ? "active" : "draft",
        }
      }),
    )
  }

  return (
    <>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">Sözleşme Bilgileri</CardTitle>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="mr-2 size-4" />
            Yeni Sözleşme Ekle
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">Bu müşteri için tanımlı sözleşme bulunmuyor.</p>
              <Button className="mt-3" size="sm" onClick={openCreateModal}>
                <Plus className="mr-2 size-4" />
                Yeni Sözleşme Ekle
              </Button>
            </div>
          ) : (
            rows.map((contract) => {
              return (
                <div key={contract.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{contract.contractNo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleContractActive(contract.id)}>
                        <Power className="mr-2 size-4" />
                        {contract.isActive ? "Pasif Yap" : "Aktif Yap"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(contract)}>
                        <Pencil className="mr-2 size-4" />
                        Düzenle
                      </Button>
                      <Button size="sm" variant="outline" className="text-rose-600" onClick={() => setDeletingId(contract.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Sil
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-medium">Belge No:</span> {contract.documentNo || "-"}</p>
                    <p><span className="font-medium">Başlangıç:</span> {formatStorageDate(contract.startDate)}</p>
                    <p><span className="font-medium">Bitiş:</span> {formatStorageDate(contract.endDate)}</p>
                    <p><span className="font-medium">Kural:</span> {contract.pricingRules.length} satır</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {contract.attachmentName ? (
                      <a
                        href={contract.attachmentUrl ?? "#"}
                        download={contract.attachmentUrl ? contract.attachmentName : undefined}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <FileText className="size-3.5" />
                        Sözleşme Görüntüle
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500">
                        Ek dosya yüklenmedi
                      </span>
                    )}
                  </div>

                  {contract.note && (
                    <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      {contract.note}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-16 backdrop-blur-[2px]">
          <div className="contracts-modal-scroll max-h-[calc(100vh-5rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingId ? "Sözleşmeyi Düzenle" : "Yeni Sözleşme"}
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="rounded-2xl" onClick={closeModal}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Sözleşme No">
                  <Input
                    value={form.contractNo}
                    placeholder="CTR-2026-0009"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setForm((current) => ({ ...current, contractNo: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Belge No">
                  <Input
                    value={form.documentNo}
                    placeholder="BLG-2026-0012"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setForm((current) => ({ ...current, documentNo: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Başlangıç Tarihi">
                  <DatePickerField
                    value={form.startDate}
                    onChange={(date) => setForm((current) => ({ ...current, startDate: date }))}
                  />
                </Field>
                <Field label="Bitiş Tarihi">
                  <DatePickerField
                    value={form.endDate}
                    onChange={(date) => setForm((current) => ({ ...current, endDate: date }))}
                  />
                </Field>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Sözleşme Belgesi (PDF)</Label>
                <FileUploader
                  value={files}
                  onChange={setFiles}
                  accept=".pdf"
                  multiple={false}
                  maxFiles={1}
                  maxSizeMb={20}
                  showPreview={false}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Açıklama</Label>
                <Textarea
                  value={form.note}
                  placeholder="Sözleşme notları, özel mutabakatlar, ek maddeler..."
                  className="min-h-20"
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Fiyat Tanımları</h3>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setRules((current) => [...current, emptyRule()])}>
                    <Plus className="mr-2 size-4" />
                    Kural Satırı Ekle
                  </Button>
                </div>

                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kural #{index + 1}</p>
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => removeRule(rule.id)}>
                          <Trash2 className="size-4 text-rose-600" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Field label="Tür">
                          <Select
                            value={rule.pricingType}
                            onValueChange={(value: PricingType) => updateRule(rule.id, { pricingType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desi">Desi</SelectItem>
                              <SelectItem value="desi_dynamic">Desi Dinamik</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Tip">
                          <Select
                            value={rule.packageType}
                            onValueChange={(value: PackageType) => updateRule(rule.id, { packageType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="koli">Koli</SelectItem>
                              <SelectItem value="palet">Palet</SelectItem>
                              <SelectItem value="cuval">Çuval</SelectItem>
                              <SelectItem value="zarf">Zarf</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Mesafe">
                          <Select
                            value={rule.distanceKey}
                            onValueChange={(value: string) => updateRule(rule.id, { distanceKey: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {distanceOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Ücret (TL)">
                          <Input
                            type="number"
                            min={0}
                            value={rule.fee}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateRule(rule.id, { fee: Number(event.target.value) || 0 })
                            }
                          />
                        </Field>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <Field label="Başlangıç Desi">
                          <Input
                            type="number"
                            min={0}
                            value={rule.startDesi}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateRule(rule.id, { startDesi: Number(event.target.value) || 0 })
                            }
                          />
                        </Field>
                        <Field label="Bitiş Desi">
                          <Input
                            type="number"
                            min={0}
                            value={rule.endDesi}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateRule(rule.id, { endDesi: Number(event.target.value) || 0 })
                            }
                          />
                        </Field>
                        <Field label="+ Fiyat (Dinamik)">
                          <Input
                            type="number"
                            min={0}
                            value={rule.dynamicIncrement}
                            disabled={rule.pricingType !== "desi_dynamic"}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateRule(rule.id, { dynamicIncrement: Number(event.target.value) || 0 })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                {dynamicRule && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Dinamik Simülasyon</span>
                      <Input
                        type="number"
                        min={1}
                        value={sampleDesi}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setSampleDesi(Number(event.target.value) || 1)
                        }
                        className="h-8 w-24 bg-white"
                      />
                      <span>desi için ücret:</span>
                      <span className="font-bold">{dynamicPreviewPrice ?? 0} TL</span>
                    </div>
                  </div>
                )}
              </div>

              {errorText && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {errorText}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={closeModal}>
                Vazgeç
              </Button>
              <Button className="rounded-2xl" onClick={handleSave}>
                {editingId ? "Değişiklikleri Kaydet" : "Sözleşmeyi Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-24 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white shadow-2xl">
            <div className="space-y-1 border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-semibold text-slate-900">Sözleşmeyi Sil</h3>
              <p className="text-sm text-slate-500">Bu işlem geri alınamaz. Seçili sözleşme kaydı silinecek.</p>
            </div>
            <div className="flex flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={() => setDeletingId(null)}>
                Vazgeç
              </Button>
              <Button className="rounded-2xl bg-rose-600 hover:bg-rose-700" onClick={handleConfirmDelete}>
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DatePickerField({
  value,
  onChange,
}: {
  value?: Date
  onChange: (value?: Date) => void
}) {
  const label = formatDateLabel(value)

  const handleDateSelect = (date?: Date) => {
    if (!date) return
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    onChange(next)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 w-full justify-between rounded-2xl border-slate-200 bg-white px-4 font-normal hover:bg-slate-50">
          <span className={value ? "text-slate-900" : "text-slate-500"}>{label}</span>
          <CalendarDays className="size-5 text-slate-700" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl p-2">
        <Calendar mode="single" selected={value} onSelect={handleDateSelect} />
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  )
}
