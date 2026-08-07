'use client'

import type { ChangeEvent } from 'react'
import { Check, Info, Plus, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { FtlYukSatir, GonderiTipi, LtlSatir, SelectOption, TasimaSecBilgileri, VehicleRecord } from '../_types/transport'
import { StepInfoPanel } from './step-info-panel'

interface TasimaSecStepProps {
  data: TasimaSecBilgileri
  selectedVehicle: VehicleRecord | null
  yukTipiOptions: SelectOption[]
  onChange: (data: TasimaSecBilgileri) => void
}

export function TasimaSecStep({
  data,
  selectedVehicle,
  yukTipiOptions,
  onChange,
}: TasimaSecStepProps) {
  const setGonderiTipi = (tip: GonderiTipi) => {
    onChange({ ...data, gonderiTipi: tip })
  }

  const handleAddLtlRow = () => {
    const newRow: LtlSatir = {
      id: `ltl-${Date.now()}`,
      yukTipiId: null,
      yukTipiLabel: '',
      adet: 0,
      en: 0,
      boy: 0,
      genislik: 0,
      agirlik: 0,
      istiflenebilir: false,
    }
    onChange({ ...data, ltl: [...data.ltl, newRow] })
  }

  const handleRemoveLtlRow = (id: string) => {
    onChange({ ...data, ltl: data.ltl.filter((row) => row.id !== id) })
  }

  const handleLtlRowChange = (id: string, updates: Partial<LtlSatir>) => {
    onChange({
      ...data,
      ltl: data.ltl.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sol bilgi paneli */}
      <StepInfoPanel
        title="Taşıma Seç"
        description="Sevkiyatın planlanması ve yönetimi için gerekli tüm detayları burada görüntüleyebilir ve düzenleyebilirsiniz."
      >
        {/* FTL / LTL Toggle */}
        <div className="mt-2 space-y-3">
          <GonderiTipiButton
            active={data.gonderiTipi === 'FTL'}
            label="Komple Gönderi - FTL"
            onClick={() => setGonderiTipi('FTL')}
          />
          <GonderiTipiButton
            active={data.gonderiTipi === 'LTL'}
            label="Parsiyel Gönderi - LTL"
            onClick={() => setGonderiTipi('LTL')}
          />
        </div>
      </StepInfoPanel>

      {/* Sağ form alanı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {data.gonderiTipi === 'FTL' ? (
          <FtlForm
            data={data}
            selectedVehicle={selectedVehicle}
            yukTipiOptions={yukTipiOptions}
            onChange={onChange}
          />
        ) : (
          <LtlForm
            rows={data.ltl}
            selectedVehicle={selectedVehicle}
            yukTipiOptions={yukTipiOptions}
            onAddRow={handleAddLtlRow}
            onRemoveRow={handleRemoveLtlRow}
            onRowChange={handleLtlRowChange}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Gönderi Tipi Toggle Button ─── */

function GonderiTipiButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
        active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600',
      )}
    >
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full transition-colors',
          active ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-transparent',
        )}
      >
        <Check className="size-4" />
      </span>
      {label}
    </button>
  )
}

/* ─── FTL Form ─── */

function FtlForm({
  data,
  selectedVehicle,
  yukTipiOptions,
  onChange,
}: {
  data: TasimaSecBilgileri
  selectedVehicle: VehicleRecord | null
  yukTipiOptions: SelectOption[]
  onChange: (data: TasimaSecBilgileri) => void
}) {
  const rows = data.ftl.yukler

  const handleAddRow = () => {
    const newRow: FtlYukSatir = {
      id: `ftl-${Date.now()}`,
      yukTipiId: null,
      yukTipiLabel: '',
      adet: 0,
      en: 0,
      boy: 0,
      genislik: 0,
      agirlik: 0,
    }
    onChange({ ...data, ftl: { yukler: [...rows, newRow] } })
  }

  const handleRemoveRow = (id: string) => {
    onChange({ ...data, ftl: { yukler: rows.filter((r) => r.id !== id) } })
  }

  const handleRowChange = (id: string, updates: Partial<FtlYukSatir>) => {
    onChange({
      ...data,
      ftl: { yukler: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) },
    })
  }

  /* Toplamlar */
  const toplamAdet = rows.reduce((s, r) => s + r.adet, 0)
  const toplamAgirlik = rows.reduce((s, r) => s + r.agirlik, 0)
  const toplamHacim = rows.reduce((s, r) => s + calcHacim(r.en, r.boy, r.genislik, r.adet), 0)
  const toplamDesi = rows.reduce((s, r) => s + calcDesi(r.en, r.boy, r.genislik, r.adet), 0)

  /* Kapasite kontrolü */
  const kapasiteKg = selectedVehicle ? selectedVehicle.kapasite * 1000 : null
  const kapasiteAsildi = kapasiteKg !== null && toplamAgirlik > kapasiteKg

  return (
    <div className="space-y-6">
      {/* Araç Bilgileri – otomatik dolan readonly kart */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          <p className="text-sm font-semibold text-slate-700">Araç Bilgileri</p>
        </div>

        {selectedVehicle ? (
          <div className="grid gap-4 sm:grid-cols-4">
            <InfoField label="Plaka" value={selectedVehicle.plaka} />
            <InfoField label="Araç Tipi" value={selectedVehicle.aracTipi} />
            <InfoField label="Kasa Tipi" value={selectedVehicle.kasaTipi} />
            <InfoField label="Kapasite" value={`${selectedVehicle.kapasite} ton`} />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Info className="size-4" />
            <span>Sevk Bilgileri adımından araç seçimi yapınız.</span>
          </div>
        )}
      </div>

      {/* Yük Kalemleri Tablosu */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Yük Kalemleri</p>
          <Button
            variant="outline"
            onClick={handleAddRow}
            className="h-9 rounded-2xl border-slate-200 px-4 text-sm font-medium shadow-sm hover:bg-slate-50"
          >
            <Plus className="mr-1.5 size-4" />
            Yük Ekle
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-sm font-semibold text-slate-600">Yük Tipi</TableHead>
                <TableHead className="text-sm font-semibold text-slate-600">Adet</TableHead>
                <TableHead className="text-sm font-semibold text-slate-600">En×Boy×Genişlik (cm)</TableHead>
                <TableHead className="text-sm font-semibold text-slate-600">Ağırlık (kg)</TableHead>
                <TableHead className="text-sm font-semibold text-slate-600">Hacim (m³)</TableHead>
                <TableHead className="text-sm font-semibold text-slate-600">Desi</TableHead>
                <TableHead className="w-16 text-sm font-semibold text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-400">
                    Henüz yük eklenmedi. &quot;+ Yük Ekle&quot; butonuna tıklayarak yeni bir kalem ekleyebilirsiniz.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((row) => {
                    const rowHacim = calcHacim(row.en, row.boy, row.genislik, row.adet)
                    const rowDesi = calcDesi(row.en, row.boy, row.genislik, row.adet)

                    return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select
                          value={row.yukTipiId ?? ''}
                          onValueChange={(val: string) => {
                            const opt = yukTipiOptions.find((o) => o.value === val)
                            handleRowChange(row.id, {
                              yukTipiId: val,
                              yukTipiLabel: opt?.label ?? '',
                            })
                          }}
                        >
                          <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 text-sm">
                            <SelectValue placeholder="Seçin">
                              {row.yukTipiId && (
                                <span className="flex items-center gap-1.5">
                                  <span>{yukTipiOptions.find((o) => o.value === row.yukTipiId)?.icon}</span>
                                  <span>{row.yukTipiLabel}</span>
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {yukTipiOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-1.5">
                                  {opt.icon && <span>{opt.icon}</span>}
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={row.adet}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleRowChange(row.id, { adet: Number(e.target.value) || 0 })
                          }
                          placeholder="0"
                          className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            value={row.en}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleRowChange(row.id, { en: Number(e.target.value) || 0 })
                            }
                            placeholder="En"
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                          <span className="text-xs text-slate-400">×</span>
                          <Input
                            type="number"
                            min={0}
                            value={row.boy}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleRowChange(row.id, { boy: Number(e.target.value) || 0 })
                            }
                            placeholder="Boy"
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                          <span className="text-xs text-slate-400">×</span>
                          <Input
                            type="number"
                            min={0}
                            value={row.genislik}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleRowChange(row.id, { genislik: Number(e.target.value) || 0 })
                            }
                            placeholder="Gen."
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={row.agirlik}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleRowChange(row.id, { agirlik: Number(e.target.value) || 0 })
                          }
                          placeholder="0"
                          className="h-9 w-20 rounded-xl border-slate-200 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{rowHacim.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{Math.round(rowDesi).toLocaleString('tr-TR')}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(row.id)}
                          className="size-8 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    )
                  })}

                  {/* Toplam satırı */}
                  <TableRow className="bg-slate-50 font-semibold hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-700">Toplam</TableCell>
                    <TableCell className="text-sm text-slate-700">{toplamAdet}</TableCell>
                    <TableCell />
                    <TableCell className={cn('text-sm', kapasiteAsildi ? 'text-rose-600' : 'text-slate-700')}>
                      {toplamAgirlik.toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{toplamHacim.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-slate-700">{Math.round(toplamDesi).toLocaleString('tr-TR')}</TableCell>
                    <TableCell />
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Kapasite uyarısı */}
        {kapasiteAsildi && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            <Info className="size-4 shrink-0" />
            <span>
              Toplam yük ağırlığı ({toplamAgirlik.toLocaleString('tr-TR')} kg) araç kapasitesini ({kapasiteKg!.toLocaleString('tr-TR')} kg) aşıyor!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Info Field (readonly) ─── */

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

/* ─── LTL Form (Parsiyel Tablo) ─── */

/** Tek birim hacmi m³ */
const calcHacim = (en: number, boy: number, genislik: number, adet: number) =>
  (en * boy * genislik * adet) / 1_000_000

/** Desi = (en × boy × genişlik × adet) / 3000 */
const calcDesi = (en: number, boy: number, genislik: number, adet: number) =>
  (en * boy * genislik * adet) / 3000

function LtlForm({
  rows,
  selectedVehicle,
  yukTipiOptions,
  onAddRow,
  onRemoveRow,
  onRowChange,
}: {
  rows: LtlSatir[]
  selectedVehicle: VehicleRecord | null
  yukTipiOptions: SelectOption[]
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onRowChange: (id: string, updates: Partial<LtlSatir>) => void
}) {
  /* Toplamlar */
  const toplamAdet = rows.reduce((s, r) => s + r.adet, 0)
  const toplamAgirlik = rows.reduce((s, r) => s + r.agirlik, 0)
  const toplamHacim = rows.reduce((s, r) => s + calcHacim(r.en, r.boy, r.genislik, r.adet), 0)
  const toplamDesi = rows.reduce((s, r) => s + calcDesi(r.en, r.boy, r.genislik, r.adet), 0)

  return (
    <div className="space-y-6">
      {/* Araç Bilgileri – otomatik dolan readonly kart */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          <p className="text-sm font-semibold text-slate-700">Araç Bilgileri</p>
        </div>

        {selectedVehicle ? (
          <div className="grid gap-4 sm:grid-cols-4">
            <InfoField label="Plaka" value={selectedVehicle.plaka} />
            <InfoField label="Araç Tipi" value={selectedVehicle.aracTipi} />
            <InfoField label="Kasa Tipi" value={selectedVehicle.kasaTipi} />
            <InfoField label="Kapasite" value={`${selectedVehicle.kapasite} ton`} />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Info className="size-4" />
            <span>Sevk Bilgileri adımından araç seçimi yapınız.</span>
          </div>
        )}
      </div>

      {/* Yük Kalemleri Tablosu */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Yük Kalemleri</p>
          <Button
            variant="outline"
            onClick={onAddRow}
            className="h-9 rounded-2xl border-slate-200 px-4 text-sm font-medium shadow-sm hover:bg-slate-50"
          >
            <Plus className="mr-1.5 size-4" />
            Yük Ekle
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-sm font-semibold text-slate-600">Yük Tipi</TableHead>
              <TableHead className="text-sm font-semibold text-slate-600">Adet</TableHead>
              <TableHead className="text-sm font-semibold text-slate-600">En×Boy×Genişlik (cm)</TableHead>
              <TableHead className="text-sm font-semibold text-slate-600">Ağırlık (kg)</TableHead>
              <TableHead className="text-sm font-semibold text-slate-600">Hacim (m³)</TableHead>
              <TableHead className="text-sm font-semibold text-slate-600">Desi</TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600">İstif</TableHead>
              <TableHead className="w-16 text-sm font-semibold text-slate-600">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  Henüz yük eklenmedi. &quot;+ Yük Ekle&quot; butonuna tıklayarak yeni bir kalem ekleyebilirsiniz.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row) => {
                  const rowHacim = calcHacim(row.en, row.boy, row.genislik, row.adet)
                  const rowDesi = calcDesi(row.en, row.boy, row.genislik, row.adet)

                  return (
                    <TableRow key={row.id}>
                      {/* Yük Tipi */}
                      <TableCell>
                        <Select
                          value={row.yukTipiId ?? ''}
                          onValueChange={(val: string) => {
                            const opt = yukTipiOptions.find((o) => o.value === val)
                            onRowChange(row.id, {
                              yukTipiId: val,
                              yukTipiLabel: opt?.label ?? '',
                            })
                          }}
                        >
                          <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 text-sm">
                            <SelectValue placeholder="Seçin">
                              {row.yukTipiId && (
                                <span className="flex items-center gap-1.5">
                                  <span>{yukTipiOptions.find((o) => o.value === row.yukTipiId)?.icon}</span>
                                  <span>{row.yukTipiLabel}</span>
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {yukTipiOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-1.5">
                                  {opt.icon && <span>{opt.icon}</span>}
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Adet */}
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={row.adet}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onRowChange(row.id, { adet: Number(e.target.value) || 0 })
                          }
                          placeholder="0"
                          className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                        />
                      </TableCell>

                      {/* Ölçüler: En × Boy × Yükseklik */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            value={row.en}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onRowChange(row.id, { en: Number(e.target.value) || 0 })
                            }
                            placeholder="En"
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                          <span className="text-xs text-slate-400">×</span>
                          <Input
                            type="number"
                            min={0}
                            value={row.boy}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onRowChange(row.id, { boy: Number(e.target.value) || 0 })
                            }
                            placeholder="Boy"
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                          <span className="text-xs text-slate-400">×</span>
                          <Input
                            type="number"
                            min={0}
                            value={row.genislik}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onRowChange(row.id, { genislik: Number(e.target.value) || 0 })
                            }
                            placeholder="Gen."
                            className="h-9 w-16 rounded-xl border-slate-200 text-sm"
                          />
                        </div>
                      </TableCell>

                      {/* Ağırlık */}
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={row.agirlik}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onRowChange(row.id, { agirlik: Number(e.target.value) || 0 })
                          }
                          placeholder="0"
                          className="h-9 w-20 rounded-xl border-slate-200 text-sm"
                        />
                      </TableCell>

                      {/* Hacim (otomatik) */}
                      <TableCell>
                        <span className="text-sm text-slate-600">{rowHacim.toFixed(2)}</span>
                      </TableCell>

                      {/* Desi (otomatik) */}
                      <TableCell>
                        <span className="text-sm text-slate-600">{Math.round(rowDesi).toLocaleString('tr-TR')}</span>
                      </TableCell>

                      {/* İstiflenebilir */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => onRowChange(row.id, { istiflenebilir: !row.istiflenebilir })}
                          className={cn(
                            'inline-flex size-7 items-center justify-center rounded-lg border transition-colors',
                            row.istiflenebilir
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-slate-300 bg-white text-transparent hover:border-slate-400',
                          )}
                        >
                          <Check className="size-4" />
                        </button>
                      </TableCell>

                      {/* Sil */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveRow(row.id)}
                          className="size-8 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* Toplam satırı */}
                <TableRow className="bg-slate-50 font-semibold hover:bg-slate-50">
                  <TableCell className="text-sm text-slate-700">Toplam</TableCell>
                  <TableCell className="text-sm text-slate-700">{toplamAdet}</TableCell>
                  <TableCell />
                  <TableCell className="text-sm text-slate-700">{toplamAgirlik.toLocaleString('tr-TR')}</TableCell>
                  <TableCell className="text-sm text-slate-700">{toplamHacim.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-slate-700">{Math.round(toplamDesi).toLocaleString('tr-TR')}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}
