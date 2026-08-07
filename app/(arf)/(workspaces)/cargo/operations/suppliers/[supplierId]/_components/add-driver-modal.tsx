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
import { addSupplierDriver, updateSupplierDriver } from "../_api/supplier-detail-api"
import type {
  BloodGroup,
  DriverDocument,
  DriverDocumentType,
  DriverStatus,
  LicenseClass,
  SrcType,
  SupplierDriver,
} from "../_types"

interface Props {
  supplierId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (driver: SupplierDriver) => void
  driver?: SupplierDriver | null
}

type StepId = "info" | "documents"

interface DriverDraft {
  firstName: string
  lastName: string
  nationalId: string
  phone: string
  birthDate: string
  bloodGroup: BloodGroup | ""
  status: DriverStatus
  licenseClass: LicenseClass | ""
  licenseExpiry: string
  hasSrcCertificate: boolean
  srcType: SrcType | ""
  srcExpiryDate: string
  psychotechnicExpiryDate: string
  documents: DriverDocument[]
}

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "info", title: "Bilgiler" },
  { id: "documents", title: "Dosyalar" },
]

const STATUS_OPTIONS: Array<{ value: DriverStatus; label: string }> = [
  { value: "available", label: "Müsait" },
  { value: "on_trip", label: "Seferde" },
  { value: "off_duty", label: "Görev Dışı" },
]

const LICENSE_CLASS_OPTIONS: Array<{ value: LicenseClass; label: string }> = [
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "CE", label: "CE" },
  { value: "D", label: "D" },
]

const SRC_TYPE_OPTIONS: Array<{ value: SrcType; label: string }> = [
  { value: "SRC-1", label: "SRC-1" },
  { value: "SRC-2", label: "SRC-2" },
  { value: "SRC-3", label: "SRC-3" },
  { value: "SRC-4", label: "SRC-4" },
  { value: "SRC-5", label: "SRC-5" },
]

const BLOOD_GROUP_OPTIONS: Array<{ value: BloodGroup; label: string }> = [
  { value: "A Rh+", label: "A Rh+" },
  { value: "A Rh-", label: "A Rh-" },
  { value: "B Rh+", label: "B Rh+" },
  { value: "B Rh-", label: "B Rh-" },
  { value: "AB Rh+", label: "AB Rh+" },
  { value: "AB Rh-", label: "AB Rh-" },
  { value: "0 Rh+", label: "0 Rh+" },
  { value: "0 Rh-", label: "0 Rh-" },
]

const DRIVER_DOCUMENT_TYPE_LABELS: Record<DriverDocumentType, string> = {
  ehliyet_fotokopisi: "Ehliyet Belgesi",
  src_belgesi: "SRC Belgesi",
  psikoteknik_belgesi: "Psikoteknik Belgesi",
  nufus_cuzdani: "Nüfus Cüzdanı",
  saglik_raporu: "Sağlık Raporu",
  diger: "Diğer",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildEmptyDraft(): DriverDraft {
  return {
    firstName: "",
    lastName: "",
    nationalId: "",
    phone: "",
    birthDate: "",
    bloodGroup: "",
    status: "available",
    licenseClass: "",
    licenseExpiry: "",
    hasSrcCertificate: false,
    srcType: "",
    srcExpiryDate: "",
    psychotechnicExpiryDate: "",
    documents: [],
  }
}

function buildDraft(driver: SupplierDriver): DriverDraft {
  return {
    firstName: driver.firstName,
    lastName: driver.lastName,
    nationalId: driver.nationalId,
    phone: driver.phone,
    birthDate: driver.birthDate ?? "",
    bloodGroup: driver.bloodGroup ?? "",
    status: driver.status,
    licenseClass: driver.licenseClass,
    licenseExpiry: driver.licenseExpiry,
    hasSrcCertificate: driver.hasSrcCertificate,
    srcType: driver.srcType ?? "",
    srcExpiryDate: driver.srcExpiryDate ?? "",
    psychotechnicExpiryDate: driver.psychotechnicExpiryDate ?? "",
    documents: driver.documents ?? [],
  }
}

export function AddDriverModal({ supplierId, open, onOpenChange, onSaved, driver }: Props) {
  const [draft, setDraft] = useState<DriverDraft>(() => (driver ? buildDraft(driver) : buildEmptyDraft()))
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isEditMode = Boolean(driver)
  const currentStep = STEPS[stepIndex]

  useEffect(() => {
    setDraft(driver ? buildDraft(driver) : buildEmptyDraft())
    setStepIndex(0)
  }, [open, driver])

  const updateField = <K extends keyof DriverDraft>(key: K, value: DriverDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: keyof DriverDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value)
  }

  const handleDocumentTypeChange = (documentId: string) => (value: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              type: value as DriverDocumentType,
              label: DRIVER_DOCUMENT_TYPE_LABELS[value as DriverDocumentType],
            }
          : doc,
      ),
    }))
  }

  const handleDeleteDocument = (documentId: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== documentId),
    }))
  }

  const handleUploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextDoc: DriverDocument = {
      id: `driver-doc-${Date.now()}`,
      type: "diger",
      label: DRIVER_DOCUMENT_TYPE_LABELS.diger,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Mevcut Kullanıcı",
      fileUrl: URL.createObjectURL(file),
    }

    setDraft((prev) => ({ ...prev, documents: [nextDoc, ...prev.documents] }))
    event.target.value = ""
  }

  const isInfoStepValid = useMemo(
    () =>
      Boolean(
        draft.firstName.trim() &&
          draft.lastName.trim() &&
          draft.nationalId.trim().length === 11 &&
          draft.licenseClass &&
          draft.licenseExpiry,
      ),
    [draft.firstName, draft.lastName, draft.nationalId, draft.licenseClass, draft.licenseExpiry],
  )

  const handleSave = async () => {
    if (!isInfoStepValid) {
      setStepIndex(0)
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Omit<SupplierDriver, "id"> = {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        nationalId: draft.nationalId.trim(),
        phone: draft.phone.trim(),
        birthDate: draft.birthDate || undefined,
        bloodGroup: draft.bloodGroup ? (draft.bloodGroup as BloodGroup) : undefined,
        status: draft.status,
        licenseClass: draft.licenseClass as LicenseClass,
        licenseExpiry: draft.licenseExpiry,
        hasSrcCertificate: draft.hasSrcCertificate,
        srcType: draft.hasSrcCertificate && draft.srcType ? (draft.srcType as SrcType) : undefined,
        srcExpiryDate: draft.hasSrcCertificate ? draft.srcExpiryDate || undefined : undefined,
        psychotechnicExpiryDate: draft.psychotechnicExpiryDate || undefined,
        activeVehicleId: driver?.activeVehicleId,
        activeVehiclePlate: driver?.activeVehiclePlate,
        totalTrips: driver?.totalTrips ?? 0,
        documents: draft.documents,
      }

      const savedDriver = driver
        ? await updateSupplierDriver(supplierId, driver.id, payload)
        : await addSupplierDriver(supplierId, payload)

      onSaved(savedDriver)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px]! xl:max-w-[1320px]!">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {isEditMode ? "Sürücü Düzenle" : "Sürücü Ekle"}
            </DialogTitle>
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
                <h3 className="text-lg font-semibold text-slate-900">{currentStep.title}</h3>
              </div>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {stepIndex + 1} / {STEPS.length}
              </Badge>
            </div>

            {currentStep.id === "info" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="driver-first-name">Ad *</Label>
                  <Input
                    id="driver-first-name"
                    value={draft.firstName}
                    onChange={handleInputChange("firstName")}
                    placeholder="Mehmet"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-last-name">Soyad *</Label>
                  <Input
                    id="driver-last-name"
                    value={draft.lastName}
                    onChange={handleInputChange("lastName")}
                    placeholder="Demir"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-national-id">TCKN *</Label>
                  <Input
                    id="driver-national-id"
                    value={draft.nationalId}
                    onChange={handleInputChange("nationalId")}
                    maxLength={11}
                    placeholder="12345678901"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-phone">Telefon</Label>
                  <Input
                    id="driver-phone"
                    value={draft.phone}
                    onChange={handleInputChange("phone")}
                    placeholder="+90 5XX XXX XXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-birth-date">Doğum Tarihi</Label>
                  <Input
                    id="driver-birth-date"
                    type="date"
                    value={draft.birthDate}
                    onChange={handleInputChange("birthDate")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kan Grubu</Label>
                  <Select
                    value={draft.bloodGroup}
                    onValueChange={(value: BloodGroup) => updateField("bloodGroup", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUP_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Durum</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value: DriverStatus) => updateField("status", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ehliyet Sınıfı *</Label>
                  <Select
                    value={draft.licenseClass}
                    onValueChange={(value: LicenseClass) => updateField("licenseClass", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_CLASS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-license-expiry">Ehliyet Bitiş Tarihi *</Label>
                  <Input
                    id="driver-license-expiry"
                    type="date"
                    value={draft.licenseExpiry}
                    onChange={handleInputChange("licenseExpiry")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SRC Belge Türü</Label>
                  <Select
                    value={draft.srcType}
                    onValueChange={(value: SrcType | "") => {
                      updateField("srcType", value)
                      updateField("hasSrcCertificate", value !== "")
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="SRC belgesi seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {SRC_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {draft.hasSrcCertificate && (
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-src-expiry">SRC Bitiş Tarihi</Label>
                    <Input
                      id="driver-src-expiry"
                      type="date"
                      value={draft.srcExpiryDate}
                      onChange={handleInputChange("srcExpiryDate")}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="driver-psychotechnic-expiry">Psikoteknik Belgesi Bitiş Tarihi</Label>
                  <Input
                    id="driver-psychotechnic-expiry"
                    type="date"
                    value={draft.psychotechnicExpiryDate}
                    onChange={handleInputChange("psychotechnicExpiryDate")}
                  />
                </div>
              </div>
            )}

            {currentStep.id === "documents" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Dosya yükleme ve tip güncelleme</div>
                    <div className="text-sm text-slate-500">Sürücü evraklarını bu adımda yönetin.</div>
                  </div>
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUploadDocument} />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1.5 size-4" />
                      Dosya Ekle
                    </Button>
                  </>
                </div>

                {draft.documents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    Henüz dosya yok.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {draft.documents.map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="grid gap-3 lg:grid-cols-[1.5fr_220px_auto] lg:items-center">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {DRIVER_DOCUMENT_TYPE_LABELS[doc.type] ?? "Diğer"}
                            </div>
                            <div className="mt-1 text-sm text-slate-700">{doc.fileName ?? doc.label}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {doc.fileSize != null ? formatBytes(doc.fileSize) : "Boyut yok"} •{" "}
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString("tr-TR") : "Tarih yok"} •{" "}
                              {doc.uploadedBy ?? "Mevcut Kullanıcı"}
                            </div>
                          </div>
                          <Select value={doc.type} onValueChange={handleDocumentTypeChange(doc.id)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DRIVER_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
              disabled={stepIndex === 0}
            >
              Geri
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))}
                disabled={!isInfoStepValid}
              >
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={isSubmitting || !isInfoStepValid}>
                {isSubmitting
                  ? isEditMode
                    ? "Kaydediliyor..."
                    : "Ekleniyor..."
                  : isEditMode
                    ? "Güncellemeleri Kaydet"
                    : "Sürücüyü Ekle"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
