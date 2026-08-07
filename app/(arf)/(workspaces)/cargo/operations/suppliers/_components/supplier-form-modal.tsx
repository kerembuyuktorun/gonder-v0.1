"use client"

import type { ChangeEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Trash2, Upload } from "lucide-react"
import type { ContractType, SupplierType } from "../_types"
import type { DocumentType, SupplierDocument } from "../[supplierId]/_types"

type StepId = "company" | "contactAgreement" | "bank" | "documents"

interface SupplierDocumentDraft extends SupplierDocument {
  fileName?: string
  fileSize?: number
  uploadedBy?: string
}

export interface SupplierFormValues {
  supplierType: SupplierType | ""
  name: string
  city: string
  officialAddress: string
  taxOffice: string
  taxNumber: string
  contactPerson: string
  contactPersonTitle: string
  contactPhone: string
  contactEmail: string
  contractType: ContractType | ""
  paymentTermDays: string
  pricePerTrip: string
  pricePerDesi: string
  iban: string
  accountHolder: string
  documents: SupplierDocumentDraft[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  submitPendingLabel: string
  initialValues: SupplierFormValues
  onSubmit: (values: SupplierFormValues) => Promise<void>
}

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "company", title: "Firma Bilgileri" },
  { id: "contactAgreement", title: "İletişim &\nAnlaşma" },
  { id: "bank", title: "Banka Bilgileri" },
  { id: "documents", title: "Firma Dosyaları" },
]

const SUPPLIER_TYPE_OPTIONS: Array<{ value: SupplierType; label: string }> = [
  { value: "ozmal", label: "Özmal" },
  { value: "logistics", label: "Lojistik" },
  { value: "truck_owner", label: "Kamyon Sahibi" },
  { value: "warehouse", label: "Ambar" },
]

const CONTRACT_TYPE_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: "fixed_salary", label: "Sabit Maaşlı" },
  { value: "per_trip", label: "Sefer Başı" },
  { value: "per_desi", label: "Desi Başı" },
  { value: "commission", label: "Komisyon" },
]

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  vergi_levhasi: "Vergi Levhası",
  imza_sirkuleri: "İmza Sirküleri",
  tasima_sozlesmesi: "Taşıma Sözleşmesi",
  k_belgesi: "K Belgesi",
  src_belgesi: "SRC Belgesi",
  trafik_sigortasi: "Trafik Sigortası",
  kasko: "Kasko",
  diger: "Diğer",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function buildEmptySupplierFormValues(): SupplierFormValues {
  return {
    supplierType: "",
    name: "",
    city: "",
    officialAddress: "",
    taxOffice: "",
    taxNumber: "",
    contactPerson: "",
    contactPersonTitle: "",
    contactPhone: "",
    contactEmail: "",
    contractType: "",
    paymentTermDays: "",
    pricePerTrip: "",
    pricePerDesi: "",
    iban: "",
    accountHolder: "",
    documents: [],
  }
}

export function SupplierFormModal({
  open,
  onOpenChange,
  title,
  submitLabel,
  submitPendingLabel,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<SupplierFormValues>(initialValues)
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const currentStep = STEPS[stepIndex]

  useEffect(() => {
    setValues(initialValues)
    setStepIndex(0)
  }, [initialValues, open])

  const updateField = <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: keyof SupplierFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value)
  }

  const handleDocumentTypeChange = (documentId: string) => (value: string) => {
    setValues((prev) => ({
      ...prev,
      documents: prev.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              documentType: value as DocumentType,
              label: DOCUMENT_TYPE_LABELS[value as DocumentType],
            }
          : document,
      ),
    }))
  }

  const handleDeleteDocument = (documentId: string) => {
    setValues((prev) => ({
      ...prev,
      documents: prev.documents.filter((document) => document.id !== documentId),
    }))
  }

  const handleUploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextDocument: SupplierDocumentDraft = {
      id: `supplier-doc-${Date.now()}`,
      documentType: "diger",
      label: DOCUMENT_TYPE_LABELS.diger,
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: "Mevcut Kullanıcı",
      uploadedAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(file),
      isExpired: false,
      isExpiringSoon: false,
    }

    setValues((prev) => ({ ...prev, documents: [nextDocument, ...prev.documents] }))
    event.target.value = ""
  }

  const isCompanyStepValid = useMemo(
    () => Boolean(values.supplierType && values.name.trim()),
    [values.name, values.supplierType],
  )

  const isContactAgreementStepValid = useMemo(
    () => Boolean(values.contractType),
    [values.contractType],
  )

  const canMoveNext =
    stepIndex === 0
      ? isCompanyStepValid
      : stepIndex === 1
        ? isContactAgreementStepValid
        : true

  const canSave = isCompanyStepValid && isContactAgreementStepValid

  const handleSave = async () => {
    if (!canSave) {
      if (!isCompanyStepValid) {
        setStepIndex(0)
        return
      }
      setStepIndex(1)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px]! xl:max-w-[1320px]!">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-5 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {STEPS.map((step, index) => {
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
                    <div className="text-sm font-medium whitespace-pre-line leading-snug">{step.title}</div>
                  </div>
                </button>
              )
            })}
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{currentStep.title.replace("\n", " ")}</h3>
              </div>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {stepIndex + 1} / {STEPS.length}
              </Badge>
            </div>

            {currentStep.id === "company" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tedarikçi Tipi</Label>
                  <Select value={values.supplierType} onValueChange={(value: SupplierType) => updateField("supplierType", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tedarikçi tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIER_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-name">Firma Adı</Label>
                  <Input id="supplier-name" value={values.name} onChange={handleInputChange("name")} placeholder="Örn: Kuzey Lojistik A.Ş." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-city">Şehir</Label>
                  <Input id="supplier-city" value={values.city} onChange={handleInputChange("city")} placeholder="Örn: İstanbul" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-tax-office">Vergi Dairesi</Label>
                  <Input id="supplier-tax-office" value={values.taxOffice} onChange={handleInputChange("taxOffice")} placeholder="Örn: Kadıköy V.D." />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-tax-number">VKN / TCKN</Label>
                  <Input id="supplier-tax-number" value={values.taxNumber} onChange={handleInputChange("taxNumber")} placeholder="10 veya 11 hane" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-address">Resmi Adres</Label>
                  <Input id="supplier-address" value={values.officialAddress} onChange={handleInputChange("officialAddress")} placeholder="Açık adres" />
                </div>
              </div>
            )}

            {currentStep.id === "contactAgreement" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-contact-person">Yetkili Adı</Label>
                  <Input id="supplier-contact-person" value={values.contactPerson} onChange={handleInputChange("contactPerson")} placeholder="Ad Soyad" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-contact-title">Yetkili Unvanı</Label>
                  <Input id="supplier-contact-title" value={values.contactPersonTitle} onChange={handleInputChange("contactPersonTitle")} placeholder="Örn: Operasyon Müdürü" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-phone">Telefon</Label>
                  <Input id="supplier-phone" value={values.contactPhone} onChange={handleInputChange("contactPhone")} placeholder="+90 5XX XXX XXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-email">E-posta</Label>
                  <Input id="supplier-email" type="email" value={values.contactEmail} onChange={handleInputChange("contactEmail")} placeholder="ornek@firma.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sözleşme Tipi</Label>
                  <Select value={values.contractType} onValueChange={(value: ContractType) => updateField("contractType", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sözleşme tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-payment-term">Ödeme Vadesi (Gün)</Label>
                  <Input id="supplier-payment-term" type="number" min={1} value={values.paymentTermDays} onChange={handleInputChange("paymentTermDays")} placeholder="Örn: 30" />
                </div>
                {values.contractType === "per_trip" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier-price-trip">Sefer Başı Ücret (₺)</Label>
                    <Input id="supplier-price-trip" type="number" min={0} value={values.pricePerTrip} onChange={handleInputChange("pricePerTrip")} placeholder="Örn: 2500" />
                  </div>
                )}
                {values.contractType === "per_desi" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier-price-desi">Desi Başı Ücret (₺)</Label>
                    <Input id="supplier-price-desi" type="number" min={0} step="0.1" value={values.pricePerDesi} onChange={handleInputChange("pricePerDesi")} placeholder="Örn: 3.5" />
                  </div>
                )}
              </div>
            )}

            {currentStep.id === "bank" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-iban">IBAN</Label>
                  <Input id="supplier-iban" value={values.iban} onChange={handleInputChange("iban")} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-account-holder">Hesap Sahibi</Label>
                  <Input id="supplier-account-holder" value={values.accountHolder} onChange={handleInputChange("accountHolder")} placeholder="Firma / kişi adı" />
                </div>
              </div>
            )}

            {currentStep.id === "documents" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Dosya yükleme ve tip güncelleme</div>
                    <div className="text-sm text-slate-500">Firma evraklarını bu adımda yönetin.</div>
                  </div>
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUploadDocument} />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1.5 size-4" />
                      Dosya Ekle
                    </Button>
                  </>
                </div>

                {values.documents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    Henüz dosya yok.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {values.documents.map((document) => (
                      <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="grid gap-3 lg:grid-cols-[1.5fr_220px_auto] lg:items-center">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {DOCUMENT_TYPE_LABELS[document.documentType] ?? "Diğer"}
                            </div>
                            <div className="mt-1 text-sm text-slate-700">{document.fileName ?? document.label}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {document.fileSize != null ? formatBytes(document.fileSize) : "Boyut yok"}
                              {" • "}
                              {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString("tr-TR") : "Tarih yok"}
                              {" • "}
                              {document.uploadedBy ?? "Mevcut Kullanıcı"}
                            </div>
                          </div>
                          <Select value={document.documentType} onValueChange={handleDocumentTypeChange(document.id)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteDocument(document.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
            {stepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))} disabled={!canMoveNext}>
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={isSubmitting || !canSave}>
                {isSubmitting ? submitPendingLabel : submitLabel}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
