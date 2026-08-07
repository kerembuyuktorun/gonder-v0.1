"use client"

import type { ChangeEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
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
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, ExternalLink, MapPin, Trash2, Upload } from "lucide-react"
import type { BranchDetail, BranchDocument, BranchDocumentType, BranchUser } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: BranchDetail
  onSave: (value: BranchDetail) => void
  mode?: 'edit' | 'create'
}

type StepId = "info" | "agency" | "transfer" | "documents" | "location"
const NO_TRANSFER_CENTER_VALUE = "__none__"

interface BranchEditDraft {
  il: string
  ilce: string
  mahalle: string
  acikAdres: string
  telefon: string
  eposta: string
  calismaGunleri: WorkdayId[]
  calismaBaslangicSaati: string
  calismaBitisSaati: string
  vergiDairesi: string
  vkn: string
  acenteSahibi: string
  acenteSahibiTelefon: string
  acenteSahibiEposta: string
  acenteYoneticisi: string
  acenteYoneticisiTelefon: string
  alimHakedisOrani: string
  dagitimHakedisOrani: string
  hesapSahibi: string
  bankAdi: string
  iban: string
  bagliMerkezId: string
  bagliMerkezAdi: string
  bagliMerkezKodu: string
  bagliMerkezSehir: string
  documents: BranchDocument[]
  managerUserId: string
  googleMapsLink: string
}

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "info", title: "Şube Bilgileri" },
  { id: "agency", title: "Şube Acente Bilgileri" },
  { id: "transfer", title: "Bağlı Transfer Merkezi\n& Şube Yöneticisi" },
  { id: "documents", title: "Şube Acente Dosyaları" },
  { id: "location", title: "Konum" },
]

const TRANSFER_CENTER_OPTIONS = [
  { id: NO_TRANSFER_CENTER_VALUE, name: "Bağlı merkez yok", code: "", city: "" },
  { id: "tc-001", name: "İstanbul Anadolu Transfer Merkezi", code: "TC-IST-A", city: "İstanbul" },
  { id: "tc-002", name: "Ankara Transfer Merkezi", code: "TC-ANK", city: "Ankara" },
  { id: "tc-003", name: "İstanbul Transfer Merkezi", code: "TC-IST", city: "İstanbul" },
]

const DOCUMENT_TYPE_LABELS: Record<BranchDocumentType, string> = {
  vergi_levhasi: "Vergi Levhası",
  sozlesme: "Sözleşme",
  imza_sirkuleri: "İmza Sirküleri",
  diger: "Diğer",
}

const CITY_OPTIONS = ["Adana", "Ankara", "İstanbul", "İzmir", "Kahramanmaraş", "Mersin"]

const DISTRICT_OPTIONS: Record<string, string[]> = {
  Adana: ["Seyhan", "Yüreğir", "Çukurova"],
  Ankara: ["Çankaya", "Yenimahalle", "Keçiören"],
  İstanbul: ["Kadıköy", "Başakşehir", "Üsküdar", "Ataşehir"],
  İzmir: ["Bornova", "Karşıyaka", "Konak"],
  Kahramanmaraş: ["Onikişubat", "Dulkadiroğlu"],
  Mersin: ["Akdeniz", "Yenişehir", "Mezitli"],
}

const NEIGHBORHOOD_OPTIONS: Record<string, string[]> = {
  Kadıköy: ["Moda Mah.", "Fenerbahçe", "Caferağa"],
  Başakşehir: ["İkitelli OSB", "Bahçeşehir"],
  Çankaya: ["Kavaklıdere", "Kızılay"],
  Onikişubat: ["Afşar", "Yeniköy"],
  Bornova: ["Merkez Mahallesi", "Erzene"],
  Seyhan: ["Alidede", "Reşatbey"],
  Akdeniz: ["Çilek", "Karaduvar"],
}

const WORKDAY_OPTIONS = [
  { id: "mon", label: "Pazartesi", short: "Pzt" },
  { id: "tue", label: "Salı", short: "Sal" },
  { id: "wed", label: "Çarşamba", short: "Çrş" },
  { id: "thu", label: "Perşembe", short: "Prş" },
  { id: "fri", label: "Cuma", short: "Cum" },
  { id: "sat", label: "Cumartesi", short: "Cmt" },
  { id: "sun", label: "Pazar", short: "Paz" },
] as const

type WorkdayId = (typeof WORKDAY_OPTIONS)[number]["id"]

const WORK_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`)

const DAY_ORDER: WorkdayId[] = WORKDAY_OPTIONS.map((day) => day.id)

function parseDayToken(token: string): WorkdayId | undefined {
  const normalized = token.trim().toLocaleLowerCase("tr-TR")
  if (["pzt", "pazartesi"].includes(normalized)) return "mon"
  if (["sal", "salı"].includes(normalized)) return "tue"
  if (["çar", "çrş", "çarşamba"].includes(normalized)) return "wed"
  if (["per", "prş", "perşembe"].includes(normalized)) return "thu"
  if (["cum", "cuma"].includes(normalized)) return "fri"
  if (["cmt", "cumartesi"].includes(normalized)) return "sat"
  if (["paz", "pazar"].includes(normalized)) return "sun"
  return undefined
}

function parseWorkingDays(rawDays: string): WorkdayId[] {
  const normalized = rawDays.trim().toLocaleLowerCase("tr-TR")

  if (normalized === "hafta içi") {
    return ["mon", "tue", "wed", "thu", "fri"]
  }

  if (normalized === "hafta sonu") {
    return ["sat", "sun"]
  }

  const parts = rawDays
    .split(/-|,/)
    .map((token) => parseDayToken(token))
    .filter((value): value is WorkdayId => value !== undefined)

  if (parts.length === 2 && rawDays.includes("-")) {
    const startIndex = DAY_ORDER.indexOf(parts[0])
    const endIndex = DAY_ORDER.indexOf(parts[1])
    if (startIndex >= 0 && endIndex >= startIndex) {
      return DAY_ORDER.slice(startIndex, endIndex + 1)
    }
  }

  return Array.from(new Set(parts))
}

function formatSelectedDays(dayIds: WorkdayId[]) {
  if (dayIds.length === 0) {
    return ""
  }

  const ordered = DAY_ORDER.filter((id) => dayIds.includes(id))
  if (ordered.length === 0) {
    return ""
  }

  const indexes = ordered.map((id) => DAY_ORDER.indexOf(id))
  const contiguous = indexes.every((index, idx) => idx === 0 || index === indexes[idx - 1] + 1)
  const labelOf = (id: WorkdayId) => WORKDAY_OPTIONS.find((day) => day.id === id)?.short ?? id

  if (contiguous && ordered.length >= 2) {
    return `${labelOf(ordered[0])} - ${labelOf(ordered[ordered.length - 1])}`
  }

  return ordered.map(labelOf).join(", ")
}

function splitWorkingSchedule(schedule?: string) {
  if (!schedule) {
    return { calismaGunleri: [] as WorkdayId[], calismaBaslangicSaati: "", calismaBitisSaati: "" }
  }

  const match = schedule.match(/^(.*?)\s+(\d{2}:\d{2}-\d{2}:\d{2})$/)
  if (match) {
    const [startHour, endHour] = match[2].split("-")
    return {
      calismaGunleri: parseWorkingDays(match[1].trim()),
      calismaBaslangicSaati: startHour ?? "",
      calismaBitisSaati: endHour ?? "",
    }
  }

  return { calismaGunleri: parseWorkingDays(schedule), calismaBaslangicSaati: "", calismaBitisSaati: "" }
}

function parseGoogleMapsCoordinates(link: string): { lat: number; lng: number } | null {
  const trimmed = link.trim()
  if (!trimmed) {
    return null
  }

  const qMatch = trimmed.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (qMatch) {
    return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) }
  }

  const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }
  }

  return null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildDraft(branch: BranchDetail): BranchEditDraft {
  const selectedManager = branch.users.find(
    (user) => `${user.firstName} ${user.lastName}` === branch.acenteYoneticisi,
  )

  const workingSchedule = splitWorkingSchedule(branch.calismaSaatleri)

  return {
    il: branch.il,
    ilce: branch.ilce,
    mahalle: branch.mahalle ?? "",
    acikAdres: branch.acikAdres ?? "",
    telefon: branch.telefon,
    eposta: branch.eposta ?? "",
    calismaGunleri: workingSchedule.calismaGunleri,
    calismaBaslangicSaati: workingSchedule.calismaBaslangicSaati,
    calismaBitisSaati: workingSchedule.calismaBitisSaati,
    vergiDairesi: branch.vergiDairesi ?? "",
    vkn: branch.vkn ?? "",
    acenteSahibi: branch.acenteSahibi ?? "",
    acenteSahibiTelefon: branch.acenteSahibiTelefon ?? "",
    acenteSahibiEposta: branch.acenteSahibiEposta ?? "",
    acenteYoneticisi: branch.acenteYoneticisi ?? "",
    acenteYoneticisiTelefon: branch.acenteYoneticisiTelefon ?? "",
    alimHakedisOrani: branch.alimHakedisOrani != null ? String(Math.round(branch.alimHakedisOrani * 100)) : "",
    dagitimHakedisOrani: branch.dagitimHakedisOrani != null ? String(Math.round(branch.dagitimHakedisOrani * 100)) : "",
    hesapSahibi: branch.hesapSahibi ?? "",
    bankAdi: branch.bankAdi ?? "",
    iban: branch.iban ?? "",
    bagliMerkezId: branch.bagliMerkezId ?? "",
    bagliMerkezAdi: branch.bagliMerkezAdi ?? "",
    bagliMerkezKodu: branch.bagliMerkezKodu ?? "",
    bagliMerkezSehir: branch.bagliMerkezSehir ?? "",
    documents: branch.documents,
    managerUserId: selectedManager?.id ?? "",
    googleMapsLink:
      branch.latitude && branch.longitude
        ? `https://maps.google.com/?q=${branch.latitude},${branch.longitude}`
        : "",
  }
}

function buildEmptyDraft(): BranchEditDraft {
  return {
    il: "",
    ilce: "",
    mahalle: "",
    acikAdres: "",
    telefon: "",
    eposta: "",
    calismaGunleri: [],
    calismaBaslangicSaati: "",
    calismaBitisSaati: "",
    vergiDairesi: "",
    vkn: "",
    acenteSahibi: "",
    acenteSahibiTelefon: "",
    acenteSahibiEposta: "",
    acenteYoneticisi: "",
    acenteYoneticisiTelefon: "",
    alimHakedisOrani: "",
    dagitimHakedisOrani: "",
    hesapSahibi: "",
    bankAdi: "",
    iban: "",
    bagliMerkezId: "",
    bagliMerkezAdi: "",
    bagliMerkezKodu: "",
    bagliMerkezSehir: "",
    documents: [],
    managerUserId: "",
    googleMapsLink: "",
  }
}

export function BranchDetailEditModal({ open, onOpenChange, branch, onSave, mode = 'edit' }: Props) {
  const [draft, setDraft] = useState<BranchEditDraft>(() => branch ? buildDraft(branch) : buildEmptyDraft())
  const [stepIndex, setStepIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cityOpen, setCityOpen] = useState(false)
  const [districtOpen, setDistrictOpen] = useState(false)
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false)
  const [workDaysOpen, setWorkDaysOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)

  useEffect(() => {
    if (branch) {
      setDraft(buildDraft(branch))
    } else if (mode === 'create') {
      setDraft(buildEmptyDraft())
    }
    setStepIndex(0)
  }, [branch, open, mode])

  const managerOptions = useMemo(() => branch?.users.filter((user) => user.status === "active") ?? [], [branch?.users])
  const currentStep = STEPS[stepIndex]
  const districtOptions = useMemo(() => DISTRICT_OPTIONS[draft.il] ?? [], [draft.il])
  const neighborhoodOptions = useMemo(() => NEIGHBORHOOD_OPTIONS[draft.ilce] ?? [], [draft.ilce])

  const updateField = <K extends keyof BranchEditDraft>(key: K, value: BranchEditDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: keyof BranchEditDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value)
  }

  const ibanBodyValue = (draft.iban ?? "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^TR/, "")

  const handleIbanChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/^TR/, "")

    updateField("iban", raw ? `TR${raw}` : "")
  }

  const handleCitySelect = (value: string) => {
    setDraft((prev) => ({ ...prev, il: value, ilce: "", mahalle: "" }))
    setCityOpen(false)
  }

  const handleDistrictSelect = (value: string) => {
    setDraft((prev) => ({ ...prev, ilce: value, mahalle: "" }))
    setDistrictOpen(false)
  }

  const handleNeighborhoodSelect = (value: string) => {
    setDraft((prev) => ({ ...prev, mahalle: value }))
    setNeighborhoodOpen(false)
  }

  const toggleWorkDay = (dayId: WorkdayId) => {
    setDraft((prev) => {
      const exists = prev.calismaGunleri.includes(dayId)
      if (exists) {
        return { ...prev, calismaGunleri: prev.calismaGunleri.filter((id) => id !== dayId) }
      }
      return {
        ...prev,
        calismaGunleri: DAY_ORDER.filter((id) => [...prev.calismaGunleri, dayId].includes(id)),
      }
    })
  }

  const handleTransferCenterChange = (value: string) => {
    const option = TRANSFER_CENTER_OPTIONS.find((item) => item.id === value)
    if (!option) return

    const mappedCenterId = option.id === NO_TRANSFER_CENTER_VALUE ? "" : option.id

    setDraft((prev) => ({
      ...prev,
      bagliMerkezId: mappedCenterId,
      bagliMerkezAdi: option.name,
      bagliMerkezKodu: option.code,
      bagliMerkezSehir: option.city,
    }))
    setTransferOpen(false)
  }

  const handleManagerChange = (value: string) => {
    const selectedManager = managerOptions.find((user) => user.id === value)
    if (!selectedManager) {
      setDraft((prev) => ({ ...prev, managerUserId: "", acenteYoneticisi: "", acenteYoneticisiTelefon: "" }))
      return
    }

    setDraft((prev) => ({
      ...prev,
      managerUserId: selectedManager.id,
      acenteYoneticisi: `${selectedManager.firstName} ${selectedManager.lastName}`,
      acenteYoneticisiTelefon: selectedManager.phone,
    }))
    setManagerOpen(false)
  }

  const handleDocumentTypeChange = (documentId: string) => (value: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: prev.documents.map((document) =>
        document.id === documentId ? { ...document, type: value as BranchDocumentType } : document,
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
    if (!file) {
      return
    }

    const nextDocument: BranchDocument = {
      id: `doc-${Date.now()}`,
      type: "diger",
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Mevcut Kullanıcı",
      url: URL.createObjectURL(file),
    }

    setDraft((prev) => ({ ...prev, documents: [nextDocument, ...prev.documents] }))
    event.target.value = ""
  }

  const handleSave = () => {
    const calismaGunleriLabel = formatSelectedDays(draft.calismaGunleri)
    const calismaSaatAraligi =
      draft.calismaBaslangicSaati && draft.calismaBitisSaati
        ? `${draft.calismaBaslangicSaati}-${draft.calismaBitisSaati}`
        : ""
    const calismaSaatleri = `${calismaGunleriLabel} ${calismaSaatAraligi}`.trim()

    const parsedCoordinates = parseGoogleMapsCoordinates(draft.googleMapsLink)

    const branchData: BranchDetail = mode === 'create'
      ? {
          id: `branch-${Date.now()}`,
          kod: `SB-${Date.now().toString().slice(-6)}`,
          ad: draft.acenteSahibi || "Yeni Şube",
          il: draft.il,
          ilce: draft.ilce,
          mahalle: draft.mahalle || undefined,
          acikAdres: draft.acikAdres || undefined,
          telefon: draft.telefon,
          eposta: draft.eposta || undefined,
          calismaSaatleri: calismaSaatleri || undefined,
          vergiDairesi: draft.vergiDairesi || undefined,
          vkn: draft.vkn || undefined,
          acenteSahibi: draft.acenteSahibi || undefined,
          acenteSahibiTelefon: draft.acenteSahibiTelefon || undefined,
          acenteSahibiEposta: draft.acenteSahibiEposta || undefined,
          acenteYoneticisi: draft.acenteYoneticisi || undefined,
          acenteYoneticisiTelefon: draft.acenteYoneticisiTelefon || undefined,
          managerUserId: draft.managerUserId || undefined,
          alimHakedisOrani: draft.alimHakedisOrani ? Number(draft.alimHakedisOrani) / 100 : undefined,
          dagitimHakedisOrani: draft.dagitimHakedisOrani ? Number(draft.dagitimHakedisOrani) / 100 : undefined,
          hesapSahibi: draft.hesapSahibi || undefined,
          bankAdi: draft.bankAdi || undefined,
          iban: draft.iban || undefined,
          latitude: parsedCoordinates ? parsedCoordinates.lat : undefined,
          longitude: parsedCoordinates ? parsedCoordinates.lng : undefined,
          status: "active",
          createdAt: new Date().toISOString(),
          bagliMerkezId: draft.bagliMerkezId || undefined,
          bagliMerkezAdi: draft.bagliMerkezAdi || undefined,
          bagliMerkezKodu: draft.bagliMerkezKodu || undefined,
          bagliMerkezSehir: draft.bagliMerkezSehir || undefined,
          documents: draft.documents,
          users: [],
          notes: [],
          commissionRecords: [],
        }
      : {
          ...branch!,
          il: draft.il,
          ilce: draft.ilce,
          mahalle: draft.mahalle || undefined,
          acikAdres: draft.acikAdres || undefined,
          telefon: draft.telefon,
          eposta: draft.eposta || undefined,
          calismaSaatleri: calismaSaatleri || undefined,
          vergiDairesi: draft.vergiDairesi || undefined,
          vkn: draft.vkn || undefined,
          acenteSahibi: draft.acenteSahibi || undefined,
          acenteSahibiTelefon: draft.acenteSahibiTelefon || undefined,
          acenteSahibiEposta: draft.acenteSahibiEposta || undefined,
          acenteYoneticisi: draft.acenteYoneticisi || undefined,
          acenteYoneticisiTelefon: draft.acenteYoneticisiTelefon || undefined,
          managerUserId: draft.managerUserId || undefined,
          alimHakedisOrani: draft.alimHakedisOrani ? Number(draft.alimHakedisOrani) / 100 : undefined,
          dagitimHakedisOrani: draft.dagitimHakedisOrani ? Number(draft.dagitimHakedisOrani) / 100 : undefined,
          bankAdi: draft.bankAdi || undefined,
          iban: draft.iban || undefined,
          hesapSahibi: draft.hesapSahibi || undefined,
          bagliMerkezId: draft.bagliMerkezId || undefined,
          bagliMerkezAdi: draft.bagliMerkezAdi || undefined,
          bagliMerkezKodu: draft.bagliMerkezKodu || undefined,
          bagliMerkezSehir: draft.bagliMerkezSehir || undefined,
          documents: draft.documents,
          latitude: parsedCoordinates ? parsedCoordinates.lat : branch?.latitude,
          longitude: parsedCoordinates ? parsedCoordinates.lng : branch?.longitude,
        }

    onSave(branchData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-[1200px]! xl:max-w-[1320px]! overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {mode === 'create' ? 'Şube Ekle' : 'Şube Düzenle'}
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
                  <Label>İl</Label>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {draft.il || "İl seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="İl ara..." />
                        <CommandList>
                          <CommandEmpty>İl bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {CITY_OPTIONS.map((city) => (
                              <CommandItem key={city} value={city} onSelect={() => handleCitySelect(city)}>
                                <Check className={cn("mr-2 size-4", draft.il === city ? "opacity-100" : "opacity-0")} />
                                {city}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>İlçe</Label>
                  <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                        disabled={!draft.il}
                      >
                        {draft.ilce || "İlçe seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="İlçe ara..." />
                        <CommandList>
                          <CommandEmpty>İlçe bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {districtOptions.map((district) => (
                              <CommandItem key={district} value={district} onSelect={() => handleDistrictSelect(district)}>
                                <Check className={cn("mr-2 size-4", draft.ilce === district ? "opacity-100" : "opacity-0")} />
                                {district}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Mahalle</Label>
                  <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                        disabled={!draft.ilce}
                      >
                        {draft.mahalle || "Mahalle seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Mahalle ara..." />
                        <CommandList>
                          <CommandEmpty>Mahalle bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {neighborhoodOptions.map((neighborhood) => (
                              <CommandItem
                                key={neighborhood}
                                value={neighborhood}
                                onSelect={() => handleNeighborhoodSelect(neighborhood)}
                              >
                                <Check className={cn("mr-2 size-4", draft.mahalle === neighborhood ? "opacity-100" : "opacity-0")} />
                                {neighborhood}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Çalışma Günleri</Label>
                  <Popover open={workDaysOpen} onOpenChange={setWorkDaysOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {formatSelectedDays(draft.calismaGunleri) || "Çalışma günleri seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Gün ara..." />
                        <CommandList>
                          <CommandEmpty>Gün bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {WORKDAY_OPTIONS.map((day) => (
                              <CommandItem key={day.id} value={`${day.label} ${day.short}`} onSelect={() => toggleWorkDay(day.id)}>
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    draft.calismaGunleri.includes(day.id) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {day.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Başlangıç Saati</Label>
                  <Select value={draft.calismaBaslangicSaati} onValueChange={(value: string) => updateField("calismaBaslangicSaati", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_HOUR_OPTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bitiş Saati</Label>
                  <Select value={draft.calismaBitisSaati} onValueChange={(value: string) => updateField("calismaBitisSaati", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_HOUR_OPTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="branch-address">Açık Adres</Label>
                  <Input id="branch-address" value={draft.acikAdres} onChange={handleInputChange("acikAdres")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branch-phone">Telefon</Label>
                  <Input id="branch-phone" value={draft.telefon} onChange={handleInputChange("telefon")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branch-email">E-posta</Label>
                  <Input id="branch-email" value={draft.eposta} onChange={handleInputChange("eposta")} />
                </div>
              </div>
            )}

            {currentStep.id === "agency" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="agency-tax-office">Vergi Dairesi</Label>
                  <Input id="agency-tax-office" value={draft.vergiDairesi} onChange={handleInputChange("vergiDairesi")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-vkn">VKN</Label>
                  <Input id="agency-vkn" value={draft.vkn} onChange={handleInputChange("vkn")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-owner">Acente Sahibi</Label>
                  <Input id="agency-owner" value={draft.acenteSahibi} onChange={handleInputChange("acenteSahibi")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-owner-phone">Telefon</Label>
                  <Input id="agency-owner-phone" value={draft.acenteSahibiTelefon} onChange={handleInputChange("acenteSahibiTelefon")} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="agency-owner-email">E-Posta</Label>
                  <Input id="agency-owner-email" value={draft.acenteSahibiEposta} onChange={handleInputChange("acenteSahibiEposta")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-alim-hakedis">Alım Hakediş Oranı (%)</Label>
                  <Input id="agency-alim-hakedis" type="number" min="0" max="100" value={draft.alimHakedisOrani} onChange={handleInputChange("alimHakedisOrani")} placeholder="20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-dagitim-hakedis">Dağıtım Hakediş Oranı (%)</Label>
                  <Input id="agency-dagitim-hakedis" type="number" min="0" max="100" value={draft.dagitimHakedisOrani} onChange={handleInputChange("dagitimHakedisOrani")} placeholder="25" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-bank">Banka Adı</Label>
                  <Input id="agency-bank" value={draft.bankAdi} onChange={handleInputChange("bankAdi")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-hesap-sahibi">Banka Hesap İsmi</Label>
                  <Input id="agency-hesap-sahibi" value={draft.hesapSahibi} onChange={handleInputChange("hesapSahibi")} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="agency-iban">IBAN</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-slate-500">
                      TR
                    </span>
                    <Input
                      id="agency-iban"
                      value={ibanBodyValue}
                      onChange={handleIbanChange}
                      className="pl-12"
                      placeholder="0001001745792316110001"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === "transfer" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Transfer Merkezi</Label>
                  <Popover open={transferOpen} onOpenChange={setTransferOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {draft.bagliMerkezAdi || "Transfer merkezi seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Transfer merkezi ara..." />
                        <CommandList>
                          <CommandEmpty>Transfer merkezi bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {TRANSFER_CENTER_OPTIONS.map((option) => (
                              <CommandItem key={option.id} value={`${option.name} ${option.code} ${option.city}`} onSelect={() => handleTransferCenterChange(option.id)}>
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    (draft.bagliMerkezId || NO_TRANSFER_CENTER_VALUE) === option.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {option.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label>Şube Yöneticisi</Label>
                  <Popover open={managerOpen} onOpenChange={setManagerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {draft.acenteYoneticisi || "Şube Yöneticisi seçin"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Şube Yöneticisi ara..." />
                        <CommandList>
                          <CommandEmpty>Şube Yöneticisi bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {managerOptions.map((user: BranchUser) => (
                              <CommandItem key={user.id} value={`${user.firstName} ${user.lastName} ${user.role}`} onSelect={() => handleManagerChange(user.id)}>
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    draft.managerUserId === user.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {user.firstName} {user.lastName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {currentStep.id === "documents" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Dosya yükleme ve tip güncelleme</div>
                    <div className="text-sm text-slate-500">Acente evraklarını bu adımda yönetin.</div>
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
                              {DOCUMENT_TYPE_LABELS[document.type] ?? "Diğer"}
                            </div>
                            <div className="mt-1 text-sm text-slate-700">{document.fileName}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatBytes(document.fileSize)} • {new Date(document.uploadedAt).toLocaleString("tr-TR")} • {document.uploadedBy}
                            </div>
                          </div>
                          <Select value={document.type} onValueChange={handleDocumentTypeChange(document.id)}>
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

            {currentStep.id === "location" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="branch-maps-link">Google Maps Linki</Label>
                  <Input
                    id="branch-maps-link"
                    value={draft.googleMapsLink}
                    onChange={handleInputChange("googleMapsLink")}
                    placeholder="https://maps.google.com/?q=40.9876,29.0332"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <MapPin className="size-4" />
                    Konum Linki
                  </div>
                  <p className="mt-2 break-all">{draft.googleMapsLink || "Henüz link girilmedi."}</p>
                  {draft.googleMapsLink ? (
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm">
                        <a href={draft.googleMapsLink} target="_blank" rel="noreferrer">
                          Haritada Aç
                          <ExternalLink className="ml-1.5 size-3.5" />
                        </a>
                      </Button>
                    </div>
                  ) : null}
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
              <Button type="button" onClick={handleSave}>
                {mode === 'create' ? 'Şubeyi Ekle' : 'Güncellemeleri Kaydet'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}