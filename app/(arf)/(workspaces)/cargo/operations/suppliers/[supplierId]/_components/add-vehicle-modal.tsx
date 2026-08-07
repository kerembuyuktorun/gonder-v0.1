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
import { addSupplierVehicle, updateSupplierVehicle } from "../_api/supplier-detail-api"
import type {
  SupplierVehicle,
  SupplierVehicleDocument,
  VehicleBodyType,
  VehicleDocumentType,
  VehicleStatus,
  VehicleType,
} from "../_types"

interface Props {
  supplierId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (vehicle: SupplierVehicle) => void
  vehicle?: SupplierVehicle | null
}

type StepId = "info" | "documents"

interface VehicleDraft {
  plate: string
  brand: string
  model: string
  status: VehicleStatus
  vehicleType: VehicleType | ""
  bodyType: VehicleBodyType | ""
  year: string
  maxWeightCapacity: string
  maxVolumeCapacity: string
  inspectionExpiryDate: string
  trafficInsuranceExpiryDate: string
  cascoPolicyNumber: string
  cascoExpiryDate: string
  currentDriverName: string
  documents: SupplierVehicleDocument[]
}

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "info", title: "Bilgiler" },
  { id: "documents", title: "Dosyalar" },
]

const VEHICLE_TYPE_OPTIONS: Array<{ value: VehicleType; label: string }> = [
  { value: "tir", label: "TIR" },
  { value: "kamyon", label: "Kamyon" },
  { value: "van", label: "Van" },
  { value: "pickup", label: "Pickup" },
]

const BODY_TYPE_OPTIONS: Array<{ value: VehicleBodyType; label: string }> = [
  { value: "tenteli", label: "Tenteli" },
  { value: "kapali_kasa", label: "Kapalı Kasa" },
  { value: "frigorifik", label: "Frigorifik" },
  { value: "acik_kasa", label: "Açık Kasa" },
  { value: "panelvan", label: "Panelvan" },
  { value: "diger", label: "Diğer" },
]

const VEHICLE_STATUS_OPTIONS: Array<{ value: VehicleStatus; label: string }> = [
  { value: "active", label: "Aktif" },
  { value: "passive", label: "Pasif" },
]

const VEHICLE_DOCUMENT_TYPE_LABELS: Record<VehicleDocumentType, string> = {
  ruhsat: "Ruhsat",
  trafik_sigortasi: "Trafik Sigortası",
  kasko: "Kasko",
  muayene: "Muayene Belgesi",
  diger: "Diğer",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildEmptyDraft(): VehicleDraft {
  return {
    plate: "",
    brand: "",
    model: "",
    status: "active",
    vehicleType: "",
    bodyType: "",
    year: String(new Date().getFullYear()),
    maxWeightCapacity: "",
    maxVolumeCapacity: "",
    inspectionExpiryDate: "",
    trafficInsuranceExpiryDate: "",
    cascoPolicyNumber: "",
    cascoExpiryDate: "",
    currentDriverName: "",
    documents: [],
  }
}

function buildDraft(vehicle: SupplierVehicle): VehicleDraft {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    status: vehicle.status,
    vehicleType: vehicle.vehicleType,
    bodyType: vehicle.bodyType ?? "",
    year: String(vehicle.year),
    maxWeightCapacity: vehicle.maxWeightCapacity != null ? String(vehicle.maxWeightCapacity) : "",
    maxVolumeCapacity: vehicle.maxVolumeCapacity != null ? String(vehicle.maxVolumeCapacity) : "",
    inspectionExpiryDate: vehicle.inspectionExpiryDate ?? "",
    trafficInsuranceExpiryDate: vehicle.trafficInsuranceExpiryDate ?? "",
    cascoPolicyNumber: vehicle.cascoPolicyNumber ?? "",
    cascoExpiryDate: vehicle.cascoExpiryDate ?? "",
    currentDriverName: vehicle.currentDriverName ?? "",
    documents: vehicle.documents ?? [],
  }
}

export function AddVehicleModal({ supplierId, open, onOpenChange, onSaved, vehicle }: Props) {
  const [draft, setDraft] = useState<VehicleDraft>(() => (vehicle ? buildDraft(vehicle) : buildEmptyDraft()))
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isEditMode = Boolean(vehicle)
  const currentStep = STEPS[stepIndex]

  useEffect(() => {
    setDraft(vehicle ? buildDraft(vehicle) : buildEmptyDraft())
    setStepIndex(0)
  }, [open, vehicle])

  const updateField = <K extends keyof VehicleDraft>(key: K, value: VehicleDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: keyof VehicleDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value)
  }

  const handleDocumentTypeChange = (documentId: string) => (value: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: prev.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              type: value as VehicleDocumentType,
              label: VEHICLE_DOCUMENT_TYPE_LABELS[value as VehicleDocumentType],
            }
          : document,
      ),
    }))
  }

  const handleDeleteDocument = (documentId: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: prev.documents.filter((document) => document.id !== documentId),
    }))
  }

  const handleUploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextDocument: SupplierVehicleDocument = {
      id: `vehicle-doc-${Date.now()}`,
      type: "diger",
      label: VEHICLE_DOCUMENT_TYPE_LABELS.diger,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Mevcut Kullanıcı",
      fileUrl: URL.createObjectURL(file),
    }

    setDraft((prev) => ({ ...prev, documents: [nextDocument, ...prev.documents] }))
    event.target.value = ""
  }

  const isInfoStepValid = useMemo(
    () => Boolean(draft.plate.trim() && draft.brand.trim() && draft.model.trim() && draft.vehicleType && draft.year.trim()),
    [draft.brand, draft.model, draft.plate, draft.vehicleType, draft.year],
  )

  const handleSave = async () => {
    if (!isInfoStepValid) {
      setStepIndex(0)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        plate: draft.plate.trim(),
        brand: draft.brand.trim(),
        model: draft.model.trim(),
        status: draft.status,
        vehicleType: draft.vehicleType as VehicleType,
        bodyType: draft.bodyType ? (draft.bodyType as VehicleBodyType) : undefined,
        year: Number(draft.year),
        maxWeightCapacity: draft.maxWeightCapacity ? Number(draft.maxWeightCapacity) : undefined,
        maxVolumeCapacity: draft.maxVolumeCapacity ? Number(draft.maxVolumeCapacity) : undefined,
        inspectionExpiryDate: draft.inspectionExpiryDate || undefined,
        trafficInsuranceExpiryDate: draft.trafficInsuranceExpiryDate || undefined,
        cascoPolicyNumber: draft.cascoPolicyNumber || undefined,
        cascoExpiryDate: draft.cascoExpiryDate || undefined,
        currentDriverName: draft.currentDriverName || undefined,
        currentDriverId: vehicle?.currentDriverId,
        documents: draft.documents,
      }

      const savedVehicle = vehicle
        ? await updateSupplierVehicle(supplierId, vehicle.id, payload)
        : await addSupplierVehicle(supplierId, payload)

      onSaved(savedVehicle)
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
              {isEditMode ? "Araç Düzenle" : "Araç Ekle"}
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
                  <Label htmlFor="vehicle-plate">Plaka</Label>
                  <Input id="vehicle-plate" value={draft.plate} onChange={handleInputChange("plate")} className="uppercase" placeholder="34 ABC 001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Araç Durumu</Label>
                  <Select value={draft.status} onValueChange={(value: VehicleStatus) => updateField("status", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Araç Tipi</Label>
                  <Select value={draft.vehicleType} onValueChange={(value: VehicleType) => updateField("vehicleType", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Araç tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Kasa Tipi</Label>
                  <Select value={draft.bodyType} onValueChange={(value: VehicleBodyType) => updateField("bodyType", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kasa tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-brand">Marka</Label>
                  <Input id="vehicle-brand" value={draft.brand} onChange={handleInputChange("brand")} placeholder="Mercedes" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-model">Model</Label>
                  <Input id="vehicle-model" value={draft.model} onChange={handleInputChange("model")} placeholder="Actros" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-year">Yıl</Label>
                  <Input id="vehicle-year" type="number" value={draft.year} onChange={handleInputChange("year")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-driver">Zimmetli Sürücü</Label>
                  <Input id="vehicle-driver" value={draft.currentDriverName} onChange={handleInputChange("currentDriverName")} placeholder="Mehmet Demir" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-weight-capacity">Max Ağırlık Kapasitesi</Label>
                  <Input id="vehicle-weight-capacity" type="number" step="0.5" value={draft.maxWeightCapacity} onChange={handleInputChange("maxWeightCapacity")} placeholder="24" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-volume-capacity">Max Hacim Kapasitesi</Label>
                  <Input id="vehicle-volume-capacity" type="number" step="0.5" value={draft.maxVolumeCapacity} onChange={handleInputChange("maxVolumeCapacity")} placeholder="68" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-inspection">Araç Muayene Bitiş Tarihi</Label>
                  <Input id="vehicle-inspection" type="date" value={draft.inspectionExpiryDate} onChange={handleInputChange("inspectionExpiryDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-traffic-insurance">Trafik Sigortası Bitiş Tarihi</Label>
                  <Input id="vehicle-traffic-insurance" type="date" value={draft.trafficInsuranceExpiryDate} onChange={handleInputChange("trafficInsuranceExpiryDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-casco-policy">Kasko Poliçe No</Label>
                  <Input id="vehicle-casco-policy" value={draft.cascoPolicyNumber} onChange={handleInputChange("cascoPolicyNumber")} placeholder="KSK-34001" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-casco-expiry">Kasko Bitiş Tarihi</Label>
                  <Input id="vehicle-casco-expiry" type="date" value={draft.cascoExpiryDate} onChange={handleInputChange("cascoExpiryDate")} />
                </div>
              </div>
            )}

            {currentStep.id === "documents" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Dosya yükleme ve tip güncelleme</div>
                    <div className="text-sm text-slate-500">Araç evraklarını bu adımda yönetin.</div>
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
                    {draft.documents.map((document) => (
                      <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="grid gap-3 lg:grid-cols-[1.5fr_220px_auto] lg:items-center">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {VEHICLE_DOCUMENT_TYPE_LABELS[document.type] ?? "Diğer"}
                            </div>
                            <div className="mt-1 text-sm text-slate-700">{document.fileName ?? document.label}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {document.fileSize != null ? formatBytes(document.fileSize) : "Boyut yok"} • {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString("tr-TR") : "Tarih yok"} • {document.uploadedBy ?? "Mevcut Kullanıcı"}
                            </div>
                          </div>
                          <Select value={document.type} onValueChange={handleDocumentTypeChange(document.id)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(VEHICLE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
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
              <Button type="button" onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))} disabled={!isInfoStepValid}>
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={isSubmitting || !isInfoStepValid}>
                {isSubmitting ? (isEditMode ? "Kaydediliyor..." : "Ekleniyor...") : (isEditMode ? "Güncellemeleri Kaydet" : "Aracı Ekle")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
