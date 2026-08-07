"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userData } from "../../../_data/nav"
import { updateUser } from "../_api/users-api"
import { cn } from "@/lib/utils"
import { ImagePlus, Plus, Scissors, Trash2, Upload } from "lucide-react"
import type { LocationOption, UserAssetDraft, UserDocument, UserDocumentType, UserRecord, UserAssetEntry, UserAssetKind } from "../_types"
import { USER_ROLE_LABELS, USER_ROLE_REQUIRES_LOCATION } from "../_types"
import type { UserRole } from "../_types/user"

type StepId = "identity" | "photo" | "documents" | "assets"

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "identity", title: "Kullanıcı Bilgileri" },
  { id: "photo", title: "Kullanıcı Profil Resmi" },
  { id: "documents", title: "Kullanıcı Dosyaları" },
  { id: "assets", title: "Kullanıcı Zimmet Bilgileri" },
]

const DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  employment_contract: "İş Sözleşmesi",
  cv: "CV",
  identity: "Kimlik Belgesi",
  other: "Diğer",
}

const ASSET_KIND_LABELS: Record<UserAssetKind, string> = {
  phone: "Telefon",
  computer: "Bilgisayar",
  tablet: "Tablet",
  simcard: "Simkart",
  car: "Araba",
  house: "Ev",
}

function createEmptyAssetEntry(): UserAssetEntry {
  return {
    id: `asset-entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: "phone",
    assetName: "",
    brandModel: "",
    serialNumber: "",
    imei: "",
    assignmentNumber: "",
    providedAt: "",
    notes: "",
  }
}

const CURRENT_ACTOR_NAME = userData.name || "Mevcut Kullanıcı"

interface UserEditDraft {
  firstName: string
  lastName: string
  identityNumber: string
  email: string
  phoneNumber: string
  role: UserRole
  locationId: string | null
  profilePhotoUrl: string
  documents: UserDocument[]
  asset: UserAssetDraft
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function cropImageToCircle(
  sourceUrl: string,
  zoom: number,
  offsetX: number,
  offsetY: number,
  size = 320,
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Gorsel yuklenemedi"))
    img.src = sourceUrl
  })

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Canvas baslatilamadi")
  }

  const scaledWidth = image.width * zoom
  const scaledHeight = image.height * zoom
  const centerX = size / 2
  const centerY = size / 2
  const drawX = centerX - scaledWidth / 2 + offsetX
  const drawY = centerY - scaledHeight / 2 + offsetY

  context.clearRect(0, 0, size, size)
  context.save()
  context.beginPath()
  context.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
  context.closePath()
  context.clip()
  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight)
  context.restore()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error("Kirpma sonucu olusturulamadi"))
    }, "image/png")
  })

  return URL.createObjectURL(blob)
}

function sanitizeAsset(asset: UserAssetDraft, assignedByName: string): UserAssetDraft | undefined {
  const entries = (asset.entries ?? [])
    .map((entry) => ({
      ...entry,
      assetName: entry.assetName.trim(),
      brandModel: entry.brandModel?.trim() || undefined,
      serialNumber: entry.serialNumber?.trim() || undefined,
      imei: entry.imei?.trim() || undefined,
      assignmentNumber: entry.assignmentNumber?.trim() || undefined,
      providedAt: entry.providedAt?.trim() || undefined,
      notes: entry.notes?.trim() || undefined,
    }))
    .filter((entry) => entry.assetName)

  const normalized: UserAssetDraft = {
    vehiclePlate: asset.vehiclePlate?.trim() || undefined,
    assignedTerritory: asset.assignedTerritory?.trim() || undefined,
    deviceId: asset.deviceId?.trim() || undefined,
    deviceSerialNumber: asset.deviceSerialNumber?.trim() || undefined,
    entries: entries.length > 0 ? entries : undefined,
    assignedAt: asset.assignedAt?.trim() || undefined,
    assignedByName,
  }

  const hasAnyValue = Object.values(normalized).some(Boolean)
  return hasAnyValue ? normalized : undefined
}

function buildDraft(user: UserRecord): UserEditDraft {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    identityNumber: user.identityNumber ?? "",
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    locationId: user.locationId,
    profilePhotoUrl: user.profilePhotoUrl ?? "",
    documents: user.documents ?? [],
    asset: {
      vehiclePlate: user.asset?.vehiclePlate ?? "",
      assignedTerritory: user.asset?.assignedTerritory ?? "",
      deviceId: user.asset?.deviceId ?? "",
      deviceSerialNumber: user.asset?.deviceSerialNumber ?? "",
      entries: user.asset?.entries ?? [],
      assignedAt: user.asset?.assignedAt ?? "",
      assignedByName: CURRENT_ACTOR_NAME,
    },
  }
}

interface Props {
  open: boolean
  user: UserRecord
  locations: LocationOption[]
  onOpenChange: (open: boolean) => void
  onSaved: (updated: UserRecord) => void
}

export function UserEditModal({ open, user, locations, onOpenChange, onSaved }: Props) {
  const [draft, setDraft] = useState<UserEditDraft>(() => buildDraft(user))
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffsetX, setCropOffsetX] = useState(0)
  const [cropOffsetY, setCropOffsetY] = useState(0)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDraft(buildDraft(user))
      setStepIndex(0)
    }
  }, [open, user])

  useEffect(() => {
    return () => {
      if (draft.profilePhotoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(draft.profilePhotoUrl)
      }
      for (const document of draft.documents) {
        if (document.url.startsWith("blob:")) {
          URL.revokeObjectURL(document.url)
        }
      }
    }
  }, [draft.profilePhotoUrl, draft.documents])

  const currentStep = STEPS[stepIndex]

  const updateField = <K extends keyof UserEditDraft>(key: K, value: UserEditDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const selectedRole = draft.role
  const requiresLocation = USER_ROLE_REQUIRES_LOCATION[selectedRole]

  const filteredLocations = useMemo(
    () =>
      requiresLocation
        ? locations.filter((loc) => {
            if (selectedRole === "tm_manager") return loc.type === "tm"
            if (selectedRole === "branch_manager") return loc.type === "branch"
            return loc.type !== "hq"
          })
        : [],
    [locations, requiresLocation, selectedRole],
  )

  function handleProfilePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (draft.profilePhotoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(draft.profilePhotoUrl)
    }

    updateField("profilePhotoUrl", URL.createObjectURL(file))
    event.target.value = ""
  }

  function handleDeleteProfilePhoto() {
    if (draft.profilePhotoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(draft.profilePhotoUrl)
    }
    updateField("profilePhotoUrl", "")
    setIsCropOpen(false)
  }

  function openCropper() {
    if (!draft.profilePhotoUrl) return
    setCropZoom(1)
    setCropOffsetX(0)
    setCropOffsetY(0)
    setIsCropOpen(true)
  }

  async function handleApplyCrop() {
    if (!draft.profilePhotoUrl) return
    setIsCropping(true)
    try {
      const croppedUrl = await cropImageToCircle(draft.profilePhotoUrl, cropZoom, cropOffsetX, cropOffsetY)
      if (draft.profilePhotoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(draft.profilePhotoUrl)
      }
      updateField("profilePhotoUrl", croppedUrl)
      setIsCropOpen(false)
    } finally {
      setIsCropping(false)
    }
  }

  function handleUploadDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const nextDocument: UserDocument = {
      id: `doc-${Date.now()}`,
      type: "other",
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: CURRENT_ACTOR_NAME,
      url: URL.createObjectURL(file),
    }

    updateField("documents", [nextDocument, ...draft.documents])
    event.target.value = ""
  }

  function handleDocumentTypeChange(documentId: string, value: string) {
    updateField(
      "documents",
      draft.documents.map((document) =>
        document.id === documentId ? { ...document, type: value as UserDocumentType } : document,
      ),
    )
  }

  function handleDeleteDocument(documentId: string) {
    const document = draft.documents.find((item) => item.id === documentId)
    if (document?.url.startsWith("blob:")) {
      URL.revokeObjectURL(document.url)
    }
    updateField(
      "documents",
      draft.documents.filter((documentItem) => documentItem.id !== documentId),
    )
  }

  function handleAssetEntryChange<K extends keyof UserAssetEntry>(entryId: string, key: K, value: UserAssetEntry[K]) {
    setDraft((prev) => ({
      ...prev,
      asset: {
        ...prev.asset,
        entries: (prev.asset.entries ?? []).map((entry) =>
          entry.id === entryId ? { ...entry, [key]: value } : entry,
        ),
      },
    }))
  }

  function handleAddAssetEntry() {
    setDraft((prev) => ({
      ...prev,
      asset: {
        ...prev.asset,
        entries: [...(prev.asset.entries ?? []), createEmptyAssetEntry()],
      },
    }))
  }

  function handleRemoveAssetEntry(entryId: string) {
    setDraft((prev) => ({
      ...prev,
      asset: {
        ...prev.asset,
        entries: (prev.asset.entries ?? []).filter((entry) => entry.id !== entryId),
      },
    }))
  }

  async function handleSave() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      return
    }

    if (requiresLocation && !draft.locationId) {
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await updateUser(user.id, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        identityNumber: draft.identityNumber.trim() || undefined,
        email: draft.email.trim(),
        phoneNumber: draft.phoneNumber.trim(),
        role: draft.role,
        locationId: draft.locationId,
        profilePhotoUrl: draft.profilePhotoUrl || undefined,
        documents: draft.documents,
        asset: sanitizeAsset(draft.asset, CURRENT_ACTOR_NAME),
      })
      if (updated) {
        onSaved(updated)
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px] xl:max-w-[1320px]">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">Kullanıcı Düzenle</DialogTitle>
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
                    <div className="text-sm font-medium leading-snug">{step.title}</div>
                  </div>
                </button>
              )
            })}
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{currentStep.title}</h3>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {stepIndex + 1} / {STEPS.length}
              </Badge>
            </div>

            {currentStep.id === "identity" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-first-name">Ad</Label>
                  <Input id="edit-user-first-name" value={draft.firstName} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("firstName", event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-last-name">Soyad</Label>
                  <Input id="edit-user-last-name" value={draft.lastName} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("lastName", event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-tc">Tc</Label>
                  <Input id="edit-user-tc" value={draft.identityNumber} maxLength={11} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("identityNumber", event.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-email">E-Posta</Label>
                  <Input id="edit-user-email" type="email" value={draft.email} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("email", event.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-user-phone">Telefon</Label>
                  <Input id="edit-user-phone" value={draft.phoneNumber} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("phoneNumber", event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Rol</Label>
                  <Select value={draft.role} onValueChange={(value: UserRole) => setDraft((prev) => ({ ...prev, role: value, locationId: null }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bağlı Birim</Label>
                  <Select
                    value={draft.locationId ?? ""}
                    onValueChange={(value: string) => updateField("locationId", value || null)}
                    disabled={!requiresLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={requiresLocation ? "Birim seçin" : "Bu rol için birim gerekmiyor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep.id === "photo" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative size-44 overflow-hidden rounded-full border border-slate-200 bg-white">
                      {draft.profilePhotoUrl ? (
                        <img src={draft.profilePhotoUrl} alt="Profil resmi" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-slate-400">
                          <ImagePlus className="size-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <input ref={profilePhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
                      <Button type="button" variant="outline" onClick={() => profilePhotoInputRef.current?.click()}>
                        <Upload className="mr-1.5 size-4" />
                        Resim Yükle
                      </Button>
                      <Button type="button" variant="outline" className="text-slate-600" disabled={!draft.profilePhotoUrl} onClick={openCropper}>
                        <Scissors className="mr-1.5 size-4" />
                        Kırp
                      </Button>
                      <Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700" disabled={!draft.profilePhotoUrl} onClick={handleDeleteProfilePhoto}>
                        <Trash2 className="mr-1.5 size-4" />
                        Kaldır
                      </Button>
                    </div>

                    {isCropOpen && draft.profilePhotoUrl && (
                      <div className="w-full max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm font-medium text-slate-900">Yuvarlak Kirpma Onizleme</div>
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative size-72 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            <img
                              src={draft.profilePhotoUrl}
                              alt="Kırpma önizleme"
                              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                              style={{
                                transform: `translate(calc(-50% + ${cropOffsetX}px), calc(-50% + ${cropOffsetY}px)) scale(${cropZoom})`,
                                transformOrigin: "center",
                              }}
                            />
                          </div>

                          <div className="grid w-full gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">Yakınlaştırma</Label>
                              <Input
                                type="range"
                                min="1"
                                max="3"
                                step="0.01"
                                value={cropZoom}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setCropZoom(Number(event.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">Yatay Konum</Label>
                              <Input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={cropOffsetX}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setCropOffsetX(Number(event.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">Dikey Konum</Label>
                              <Input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={cropOffsetY}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setCropOffsetY(Number(event.target.value))}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCropOpen(false)}>
                              Iptal
                            </Button>
                            <Button type="button" onClick={() => void handleApplyCrop()} disabled={isCropping}>
                              {isCropping ? "Uygulaniyor..." : "Kırpmayı Uygula"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === "documents" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm text-slate-500">Kullanıcıya ait CV, iş sözleşmesi ve diğer dökümanları bu adımda yükleyin.</div>
                  </div>
                  <>
                    <input ref={documentInputRef} type="file" className="hidden" onChange={handleUploadDocument} />
                    <Button type="button" variant="outline" onClick={() => documentInputRef.current?.click()}>
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
                              {DOCUMENT_TYPE_LABELS[document.type] ?? "Diğer"}
                            </div>
                            <div className="mt-1 text-sm text-slate-700">{document.fileName}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatBytes(document.fileSize)} • {new Date(document.uploadedAt).toLocaleString("tr-TR")} • {document.uploadedBy}
                            </div>
                          </div>
                          <Select value={document.type} onValueChange={(value: string) => handleDocumentTypeChange(document.id, value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
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
                            onClick={() => handleDeleteDocument(document.id)}
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

            {currentStep.id === "assets" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="mt-1 text-sm text-slate-500">Her zimmet için ayrı satır ekleyin ve detayları girin.</div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddAssetEntry}>
                      <Plus className="mr-1.5 size-4" />
                      Satır Ekle
                    </Button>
                  </div>
                </div>

                {(draft.asset.entries ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    Henüz zimmet satırı eklenmedi.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(draft.asset.entries ?? []).map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="space-y-1.5">
                            <Label>Zimmet Türü</Label>
                            <Select value={entry.kind} onValueChange={(value: UserAssetKind) => handleAssetEntryChange(entry.id, "kind", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ASSET_KIND_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label>Varlık Adı</Label>
                            <Input value={entry.assetName} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "assetName", event.target.value)} placeholder="iPhone 15 / Ford Courier" />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Marka / Model</Label>
                            <Input value={entry.brandModel ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "brandModel", event.target.value)} placeholder="Apple / Ford / Dell" />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Zimmet No</Label>
                            <Input value={entry.assignmentNumber ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "assignmentNumber", event.target.value)} placeholder="ZMT-2026-0001" />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Seri No</Label>
                            <Input value={entry.serialNumber ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "serialNumber", event.target.value)} placeholder="SN-XXXX" />
                          </div>

                          <div className="space-y-1.5">
                            <Label>IMEI</Label>
                            <Input value={entry.imei ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "imei", event.target.value)} placeholder="359876543210123" />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Teslim Tarihi</Label>
                            <Input type="date" value={entry.providedAt ? entry.providedAt.slice(0, 10) : ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "providedAt", event.target.value ? new Date(event.target.value).toISOString() : "")} />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Not</Label>
                            <Input value={entry.notes ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => handleAssetEntryChange(entry.id, "notes", event.target.value)} placeholder="Opsiyonel not" />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700" onClick={() => handleRemoveAssetEntry(entry.id)}>
                            <Trash2 className="mr-1.5 size-4" />
                            Sil
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Zimmetleyen Kullanıcı</Label>
                    <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                      {CURRENT_ACTOR_NAME}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="asset-assigned-at">Zimmet Tarihi</Label>
                    <Input
                      id="asset-assigned-at"
                      type="date"
                      value={draft.asset.assignedAt ? draft.asset.assignedAt.slice(0, 10) : ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((prev) => ({ ...prev, asset: { ...prev.asset, assignedAt: event.target.value ? new Date(event.target.value).toISOString() : "" } }))}
                    />
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
            {stepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))}>
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleSave()} disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Güncellemeleri Kaydet"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
