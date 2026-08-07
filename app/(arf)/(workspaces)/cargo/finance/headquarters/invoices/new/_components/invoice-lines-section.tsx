"use client"

import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react"
import { SATIR_EK_AKSIYONLARI, TEVKIFAT_ORANLARI } from "../_mock/invoice-create-mock-data"
import type { AcikKargoOption, FaturaDovizi, FaturaSatiri, HizmetUrunOption } from "../_types"

const ZORUNLU_BIRIMLER = [
  "Adet",
  "Ay",
  "Çift",
  "Çuval",
  "Dakika",
  "Desilitre",
  "Desimetre",
  "File",
  "Gram",
  "Gün",
  "Hafta",
  "Kamyon",
  "Kilogram",
  "Kilometre",
  "Koli",
  "Litre",
  "Metre",
  "Metrekare",
  "Metreküp",
  "Miligram",
  "Milimetre",
  "Paket",
  "Palet",
  "Poşet",
  "Saat",
  "Sandık",
  "Saniye",
  "Santimetre",
  "Ton",
  "Yıl",
  "Diğer",
]

type SatirAksiyonId = "aciklama" | "indirim" | "otv" | "tevkifat"

interface Props {
  satirlar: FaturaSatiri[]
  doviz: FaturaDovizi
  selectedCustomerId?: string
  hizmetUrunler: HizmetUrunOption[]
  acikKargolar: AcikKargoOption[]
  birimler: string[]
  vergiOranlari: number[]
  satirToplamlari: Record<string, number>
  onAddLine: () => void
  onRemoveLine: (lineId: string) => void
  onUpdateLine: (lineId: string, patch: Partial<FaturaSatiri>) => void
  onApplyLineAction: (lineId: string, action: SatirAksiyonId) => void
  onApplyTevkifat: (lineId: string, oran: string) => void
}

type SatirUrunSecenek = {
  id: string
  label: string
  defaultUnit: string
  defaultPrice: number
  defaultTaxRate: number
  defaultQuantity?: number
  kind: "catalog" | "cargo" | "custom"
}

function normalizeTr(value: string): string {
  return value.trim().toLocaleLowerCase("tr")
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function FaturaSatirlarSection({
  satirlar,
  doviz: _doviz,
  selectedCustomerId,
  hizmetUrunler,
  acikKargolar,
  birimler,
  vergiOranlari,
  satirToplamlari,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  onApplyLineAction,
  onApplyTevkifat,
}: Props) {
  const [birimPopoverOpen, setBirimPopoverOpen] = useState<Record<string, boolean>>({})
  const [urunPopoverOpen, setUrunPopoverOpen] = useState<Record<string, boolean>>({})
  const [urunQuery, setUrunQuery] = useState<Record<string, string>>({})
  const [customUrunler, setCustomUrunler] = useState<SatirUrunSecenek[]>([])
  const [birimFiyatDraftlari, setBirimFiyatDraftlari] = useState<Record<string, string>>({})
  const [toplamDraftlari, setToplamDraftlari] = useState<Record<string, string>>({})
  const birimSecenekleri = useMemo(() => Array.from(new Set([...birimler, ...ZORUNLU_BIRIMLER])), [birimler])
  const katalogUrunleri = useMemo<SatirUrunSecenek[]>(
    () =>
      hizmetUrunler.map((item) => ({
        id: item.id,
        label: item.label,
        defaultUnit: item.defaultUnit,
        defaultPrice: item.defaultPrice,
        defaultTaxRate: item.defaultTaxRate,
        kind: "catalog",
      })),
    [hizmetUrunler],
  )
  const acikKargoUrunleri = useMemo<SatirUrunSecenek[]>(
    () =>
      acikKargolar
        .filter((cargo) => cargo.customerId === selectedCustomerId)
        .map((cargo) => {
          const netTotal = cargo.baseAmount ?? Math.round((cargo.amount / 1.2) * 100) / 100
          return {
            id: cargo.id,
            label: cargo.trackingNo,
            defaultUnit: cargo.pieceList || "Adet",
            defaultPrice: netTotal,
            defaultTaxRate: 20,
            defaultQuantity: cargo.pieceCount,
            kind: "cargo",
          }
        }),
    [acikKargolar, selectedCustomerId],
  )
  const urunSecenekleri = useMemo<SatirUrunSecenek[]>(
    () => [...acikKargoUrunleri, ...katalogUrunleri, ...customUrunler],
    [acikKargoUrunleri, katalogUrunleri, customUrunler],
  )

  const getLineQuery = (lineId: string): string => urunQuery[lineId] ?? ""

  const canCreateCustomUrun = (lineId: string): boolean => {
    const query = getLineQuery(lineId).trim()
    if (!query) {
      return false
    }

    return !urunSecenekleri.some((option) => normalizeTr(option.label) === normalizeTr(query))
  }

  const createCustomUrunFromQuery = (lineId: string): void => {
    const query = getLineQuery(lineId).trim()
    if (!query || !canCreateCustomUrun(lineId)) {
      return
    }

    const newOption: SatirUrunSecenek = {
      id: `custom-urun-${Date.now().toString(36)}`,
      label: query,
      defaultUnit: "Adet",
      defaultPrice: 0,
      defaultTaxRate: 20,
      kind: "custom",
    }

    setCustomUrunler((prev) => [...prev, newOption])
    onUpdateLine(lineId, {
      urunId: newOption.id,
      urunLabel: newOption.label,
      urunTipi: newOption.kind,
      birim: newOption.defaultUnit,
      birimFiyat: newOption.defaultPrice,
      birimFiyatKilidi: false,
      vergiOrani: newOption.defaultTaxRate,
    })
    setUrunQuery((prev) => ({ ...prev, [lineId]: "" }))
    setUrunPopoverOpen((prev) => ({ ...prev, [lineId]: false }))
  }

  const updateLinePriceFromTotal = (line: FaturaSatiri, nextTotal: number): void => {
    const safeTotal = Math.max(0, nextTotal)
    const vatMultiplier = 1 + Math.max(0, line.vergiOrani) / 100
    const netTotal = safeTotal / vatMultiplier

    if (line.urunTipi === "cargo") {
      onUpdateLine(line.id, { birimFiyat: round2(netTotal) })
      return
    }

    const quantity = Math.max(0, line.miktar)
    if (quantity <= 0) {
      return
    }

    onUpdateLine(line.id, { birimFiyat: round2(netTotal / quantity) })
  }

  const getToplamInputValue = (lineId: string): string => {
    const draft = toplamDraftlari[lineId]
    if (draft !== undefined) {
      return draft
    }
    return String(round2(satirToplamlari[lineId] ?? 0))
  }

  const getBirimFiyatInputValue = (line: FaturaSatiri): string => {
    const draft = birimFiyatDraftlari[line.id]
    if (draft !== undefined) {
      return draft
    }
    return String(round2(line.birimFiyat))
  }

  const commitBirimFiyatInput = (line: FaturaSatiri): void => {
    const draft = birimFiyatDraftlari[line.id]
    if (draft === undefined) {
      return
    }

    const normalized = draft.replace(",", ".").trim()
    const parsed = Number(normalized)
    if (!Number.isNaN(parsed)) {
      const nextPrice = Math.max(0, parsed)
      onUpdateLine(line.id, { birimFiyat: round2(nextPrice) })

      if (line.urunTipi === "custom" && line.urunId) {
        setCustomUrunler((prev) =>
          prev.map((item) =>
            item.id === line.urunId
              ? {
                  ...item,
                  defaultPrice: round2(nextPrice),
                }
              : item,
          ),
        )
      }
    }

    setBirimFiyatDraftlari((prev) => {
      const { [line.id]: _removed, ...rest } = prev
      return rest
    })
  }

  const commitToplamInput = (line: FaturaSatiri): void => {
    const draft = toplamDraftlari[line.id]
    if (draft === undefined) {
      return
    }

    const normalized = draft.replace(",", ".").trim()
    const parsed = Number(normalized)
    if (!Number.isNaN(parsed)) {
      updateLinePriceFromTotal(line, parsed)
    }

    setToplamDraftlari((prev) => {
      const { [line.id]: _removed, ...rest } = prev
      return rest
    })
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">Hizmet / Ürün Satırları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {satirlar.map((line, index) => {
          return (
            <div key={line.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-medium text-slate-400">Satır {index + 1}</div>
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <Label className="mb-1.5 text-xs text-slate-600">Hizmet / Ürün</Label>
                  <Popover
                    open={Boolean(urunPopoverOpen[line.id])}
                    onOpenChange={(open: boolean) => setUrunPopoverOpen((prev) => ({ ...prev, [line.id]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={Boolean(urunPopoverOpen[line.id])}
                        className="h-9 w-full justify-between font-normal"
                      >
                        <span className="truncate">
                          {urunSecenekleri.find((option) => option.id === line.urunId)?.label ?? line.urunLabel ?? "Hizmet / Ürün seçiniz"}
                        </span>
                        <ChevronsUpDown className="size-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                      <Command>
                        <CommandInput
                          placeholder="Kargo no veya ürün ara..."
                          value={getLineQuery(line.id)}
                          onValueChange={(value: string) => setUrunQuery((prev) => ({ ...prev, [line.id]: value }))}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="space-y-2 p-2 text-xs text-slate-500">
                              <p>Sonuç bulunamadı.</p>
                              {canCreateCustomUrun(line.id) && (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                                  onMouseDown={(event) => {
                                    event.preventDefault()
                                    createCustomUrunFromQuery(line.id)
                                  }}
                                >
                                  <Plus className="size-3.5" />
                                  "{getLineQuery(line.id).trim()}" ürününü ekle
                                </button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="secilmedi"
                              onSelect={() => {
                                onUpdateLine(line.id, {
                                  urunId: undefined,
                                  urunLabel: undefined,
                                  urunTipi: undefined,
                                  birimFiyatKilidi: false,
                                })
                                setUrunPopoverOpen((prev) => ({ ...prev, [line.id]: false }))
                                setUrunQuery((prev) => ({ ...prev, [line.id]: "" }))
                              }}
                            >
                              Seçilmedi
                            </CommandItem>
                            {urunSecenekleri.map((option) => (
                              <CommandItem
                                key={option.id}
                                value={option.label}
                                onSelect={() => {
                                  const patch: Partial<FaturaSatiri> = {
                                    urunId: option.id,
                                    urunLabel: option.label,
                                    urunTipi: option.kind,
                                    birim: option.defaultUnit,
                                    birimFiyat: option.defaultPrice,
                                    birimFiyatKilidi: option.kind === "cargo",
                                    vergiOrani: option.defaultTaxRate,
                                  }
                                  if (option.kind === "cargo" && option.defaultQuantity != null) {
                                    patch.miktar = option.defaultQuantity
                                  }
                                  onUpdateLine(line.id, patch)
                                  setUrunPopoverOpen((prev) => ({ ...prev, [line.id]: false }))
                                  setUrunQuery((prev) => ({ ...prev, [line.id]: "" }))
                                }}
                                className="flex items-center justify-between"
                              >
                                <span className="truncate">{option.label}</span>
                                {line.urunId === option.id && <Check className="size-4 text-emerald-600" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="lg:col-span-1">
                  <Label className="mb-1.5 text-xs text-slate-600">Miktar</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.miktar}
                    disabled={line.urunTipi === "cargo"}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      onUpdateLine(line.id, { miktar: Number(event.target.value) || 0 })
                    }
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-1.5 text-xs text-slate-600">Birim</Label>
                  <Popover
                    open={Boolean(birimPopoverOpen[line.id])}
                    onOpenChange={(open: boolean) => setBirimPopoverOpen((prev) => ({ ...prev, [line.id]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={Boolean(birimPopoverOpen[line.id])}
                        disabled={line.urunTipi === "cargo"}
                        className="h-9 w-full justify-between font-normal"
                      >
                        <span className="truncate">{line.birim || "Birim seçiniz"}</span>
                        <ChevronsUpDown className="size-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                      <Command>
                        <CommandInput placeholder="Birim ara..." />
                        <CommandList>
                          <CommandEmpty>Birim bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {birimSecenekleri.map((birim) => (
                              <CommandItem
                                key={birim}
                                value={birim}
                                onSelect={() => {
                                  onUpdateLine(line.id, { birim })
                                  if (line.urunTipi === "custom" && line.urunId) {
                                    setCustomUrunler((prev) =>
                                      prev.map((item) =>
                                        item.id === line.urunId
                                          ? {
                                              ...item,
                                              defaultUnit: birim,
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                  setBirimPopoverOpen((prev) => ({ ...prev, [line.id]: false }))
                                }}
                                className="flex items-center justify-between"
                              >
                                <span>{birim}</span>
                                {line.birim === birim && <Check className="size-4 text-emerald-600" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-1.5 text-xs text-slate-600">{line.urunTipi === "cargo" ? "Fiyat" : "Birim Fiyat"}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={getBirimFiyatInputValue(line)}
                    disabled={line.birimFiyatKilidi === true}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setBirimFiyatDraftlari((prev) => ({ ...prev, [line.id]: event.target.value }))
                    }
                    onBlur={() => commitBirimFiyatInput(line)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") {
                        commitBirimFiyatInput(line)
                        event.currentTarget.blur()
                      }
                    }}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-1.5 text-xs text-slate-600">Vergi</Label>
                  <Select
                    value={String(line.vergiOrani)}
                    disabled={line.urunTipi === "cargo"}
                    onValueChange={(value: string) => onUpdateLine(line.id, { vergiOrani: Number(value) || 0 })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vergiOranlari.map((oran) => (
                        <SelectItem key={oran} value={String(oran)}>
                          %{oran}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-1.5 text-xs text-slate-600">Toplam</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-9 flex-1"
                      value={getToplamInputValue(line.id)}
                      disabled={line.urunTipi === "cargo" || line.birimFiyatKilidi === true}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setToplamDraftlari((prev) => ({ ...prev, [line.id]: event.target.value }))
                      }
                      onBlur={() => commitToplamInput(line)}
                      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === "Enter") {
                          commitToplamInput(line)
                          event.currentTarget.blur()
                        }
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon" className="size-9 shrink-0 rounded-full">
                          <Plus className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                          {SATIR_EK_AKSIYONLARI.map((item) => (
                            <DropdownMenuItem
                              key={item.id}
                              onClick={() => onApplyLineAction(line.id, item.id as SatirAksiyonId)}
                            >
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => onRemoveLine(line.id)}
                      disabled={satirlar.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {(line.aciklama !== undefined || line.indirimTutari !== undefined || line.tevkifatOrani || line.otvOrani !== undefined) && (
                <div className="mt-3 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 md:grid-cols-2 lg:grid-cols-3">
                  {line.aciklama !== undefined && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="mb-1.5 text-xs text-slate-600">Açıklama</Label>
                          <Textarea
                            rows={2}
                            value={line.aciklama}
                            onChange={(event) => onUpdateLine(line.id, { aciklama: event.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 border-slate-300 text-slate-500 hover:text-slate-700"
                          onClick={() => onUpdateLine(line.id, { aciklama: undefined })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {line.indirimTutari !== undefined && (
                    <div>
                      <Label className="mb-1.5 text-xs text-slate-600">İndirim</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.indirimTutari}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onUpdateLine(line.id, { indirimTutari: Number(event.target.value) || 0 })
                          }
                        />
                        <Select
                          value={line.indirimTipi ?? "amount"}
                          onValueChange={(value: "amount" | "rate") => onUpdateLine(line.id, { indirimTipi: value })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">TL</SelectItem>
                            <SelectItem value="rate">%</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 border-slate-300 text-slate-500 hover:text-slate-700"
                          onClick={() => onUpdateLine(line.id, { indirimTutari: undefined, indirimTipi: undefined })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {line.otvOrani !== undefined && (
                    <div>
                      <Label className="mb-1.5 text-xs text-slate-600">ÖTV</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={line.otvOrani}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onUpdateLine(line.id, { otvOrani: Number(event.target.value) || 0 })
                          }
                        />
                        <Select
                          value={line.otvTipi ?? "rate"}
                          onValueChange={(value: "amount" | "rate") => onUpdateLine(line.id, { otvTipi: value })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">TL</SelectItem>
                            <SelectItem value="rate">%</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 border-slate-300 text-slate-500 hover:text-slate-700"
                          onClick={() => onUpdateLine(line.id, { otvOrani: undefined, otvTipi: undefined })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {line.tevkifatOrani && (
                    <div className="lg:col-span-1">
                      <Label className="mb-1.5 text-xs text-slate-600">Tevkifat Oranı</Label>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <Select value={line.tevkifatOrani} onValueChange={(value: string) => onApplyTevkifat(line.id, value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEVKIFAT_ORANLARI.map((oran) => (
                              <SelectItem key={oran} value={oran}>
                                {oran} Tevkifat Uygula
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 border-slate-300 text-slate-500 hover:text-slate-700"
                          onClick={() => onUpdateLine(line.id, { tevkifatOrani: undefined })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              )}


            </div>
          )
        })}

        <Button type="button" variant="outline" className="w-full border-dashed" onClick={onAddLine}>
          <Plus className="mr-2 size-4" />
          Yeni Satır Ekle
        </Button>
      </CardContent>
    </Card>
  )
}
