'use client'

import { type ChangeEvent, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FiyatDetaylari, FiyatlandirmaBilgileri, SelectOption } from '../_types/transport'
import { StepInfoPanel } from './step-info-panel'

const STANDARD_INPUT_CLASS = 'h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + '₺'

interface FiyatlandirmaStepProps {
  data: FiyatlandirmaBilgileri
  kdvOptions: SelectOption[]
  onChange: (data: FiyatlandirmaBilgileri) => void
}

export function FiyatlandirmaStep({ data, kdvOptions, onChange }: FiyatlandirmaStepProps) {
  const [karOpen, setKarOpen] = useState(false)

  const satisDetay = useMemo(
    () => calculatePriceDetails(data.satisFiyat, data.satisKdvOran, data.satisTevfikat),
    [data.satisFiyat, data.satisKdvOran, data.satisTevfikat],
  )

  const alisDetay = useMemo(
    () => calculatePriceDetails(data.alisFiyat, data.alisKdvOran, data.alisTevfikat),
    [data.alisFiyat, data.alisKdvOran, data.alisTevfikat],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sol bilgi paneli */}
      <StepInfoPanel
        title="Fiyatlandırma"
        description="Taşıma maliyetlerinizi hesaplayın ve detaylı fiyat bilgilerini görüntüleyin. Vergiler, ek hizmetler ve tevkifat dahil tüm kalemler burada listelenmiştir."
      />

      {/* Sağ form alanı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alış Fiyatı */}
          <PriceColumn
            title="Alış Fiyatı"
            fiyat={data.alisFiyat}
            kdvOran={data.alisKdvOran}
            tevfikat={data.alisTevfikat}
            detay={alisDetay}
            kdvOptions={kdvOptions}
            onFiyatChange={(val) =>
              onChange({ ...data, alisFiyat: val, alisFiyatDetay: alisDetay })
            }
            onKdvChange={(val) =>
              onChange({ ...data, alisKdvOran: val, alisFiyatDetay: alisDetay })
            }
            onTevfikatChange={(val) =>
              onChange({ ...data, alisTevfikat: val, alisFiyatDetay: alisDetay })
            }
          />

          {/* Satış Fiyatı */}
          <PriceColumn
            title="Satış Fiyatı"
            fiyat={data.satisFiyat}
            kdvOran={data.satisKdvOran}
            tevfikat={data.satisTevfikat}
            detay={satisDetay}
            kdvOptions={kdvOptions}
            onFiyatChange={(val) =>
              onChange({ ...data, satisFiyat: val, satisFiyatDetay: satisDetay })
            }
            onKdvChange={(val) =>
              onChange({ ...data, satisKdvOran: val, satisFiyatDetay: satisDetay })
            }
            onTevfikatChange={(val) =>
              onChange({ ...data, satisTevfikat: val, satisFiyatDetay: satisDetay })
            }
          />
        </div>

        {/* Kar / Zarar */}
        {(data.satisFiyat > 0 || data.alisFiyat > 0) && (() => {
          const kar = satisDetay.araToplam - alisDetay.araToplam
          const karMarji = satisDetay.araToplam > 0 ? (kar / satisDetay.araToplam) * 100 : 0

          const borderColor = kar > 0 ? 'border-emerald-200' : kar < 0 ? 'border-rose-200' : 'border-slate-200'

          return (
            <div className={cn('mt-4 overflow-hidden rounded-2xl border', borderColor)}>
              <button
                type="button"
                onClick={() => setKarOpen(!karOpen)}
                className={cn(
                  'flex w-full items-center justify-between px-5 py-3.5 transition-colors',
                  kar > 0
                    ? 'bg-emerald-50 hover:bg-emerald-100/60'
                    : kar < 0
                      ? 'bg-rose-50 hover:bg-rose-100/60'
                      : 'bg-slate-50 hover:bg-slate-100/60',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Kar / Zarar
                  {karOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </span>
                {karOpen && (
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-sm font-semibold',
                      kar > 0 ? 'text-emerald-700' : kar < 0 ? 'text-rose-700' : 'text-slate-600',
                    )}>
                      {kar >= 0 ? '+' : ''}{formatCurrency(kar)}
                    </span>
                    <span className={cn(
                      'rounded-lg px-2 py-0.5 text-xs font-bold',
                      kar > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : kar < 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600',
                    )}>
                      %{karMarji.toFixed(1)}
                    </span>
                  </div>
                )}
              </button>

              {karOpen && (
                <div className={cn('space-y-2 border-t bg-white px-5 py-3.5 text-sm', borderColor)}>
                  <DetailRow label="Alış (KDV Hariç):" value={formatCurrency(alisDetay.araToplam)} />
                  <DetailRow label="Satış (KDV Hariç):" value={formatCurrency(satisDetay.araToplam)} />
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

/* ─── Price Column Component ─── */

function PriceColumn({
  title,
  fiyat,
  kdvOran,
  tevfikat,
  detay,
  kdvOptions,
  onFiyatChange,
  onKdvChange,
  onTevfikatChange,
}: {
  title: string
  fiyat: number
  kdvOran: number
  tevfikat: boolean
  detay: FiyatDetaylari
  kdvOptions: SelectOption[]
  onFiyatChange: (val: number) => void
  onKdvChange: (val: number) => void
  onTevfikatChange: (val: boolean) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-slate-700">{title}</Label>

      {/* Fiyat + KDV */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">
            ₺
          </span>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={fiyat || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onFiyatChange(Number(e.target.value) || 0)
            }
            placeholder="00.00"
            className={`${STANDARD_INPUT_CLASS} pl-8`}
          />
        </div>

        <Select
          value={String(kdvOran)}
          onValueChange={(val: string) => onKdvChange(Number(val))}
        >
          <SelectTrigger className="h-11 w-32 shrink-0 rounded-2xl border-slate-200 bg-white px-3 text-sm shadow-sm data-[size=default]:h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kdvOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tevfikat checkbox */}
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <Checkbox
          checked={tevfikat}
          onCheckedChange={(checked: boolean | 'indeterminate') => onTevfikatChange(checked === true)}
          className="size-5 rounded-md border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
        Tevfikat ekle
      </label>

      {/* Fiyat Detayları */}
      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2.5 text-center text-sm font-medium text-slate-600">Fiyat Detayları</p>
        <div className="space-y-2.5 text-sm">
          <DetailRow label="Birim Fiyat:" value={formatCurrency(detay.birimFiyat)} />
          <DetailRow label="Ara Toplam:" value={formatCurrency(detay.araToplam)} bold />
          <DetailRow label="Tevfikat Tutarı:" value={formatCurrency(detay.tevfikatTutari)} />
          <DetailRow label="KDV Tutarı:" value={formatCurrency(detay.kdvTutari)} />
          <div className="border-t border-slate-200 pt-2">
            <DetailRow
              label="Toplam Fiyat:"
              value={formatCurrency(detay.toplamFiyat)}
              bold
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Detail Row ─── */

function DetailRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-slate-600', bold && 'font-semibold text-slate-800')}>{label}</span>
      <span
        className={cn(
          'text-slate-700',
          bold && 'font-semibold',
          highlight && 'rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ─── Hesaplama yardımcısı ─── */

function calculatePriceDetails(
  fiyat: number,
  kdvOran: number,
  tevfikat: boolean,
): FiyatDetaylari {
  const birimFiyat = fiyat
  const araToplam = fiyat
  const kdvTutari = araToplam * (kdvOran / 100)
  const tevfikatTutari = tevfikat ? kdvTutari * (2 / 10) : 0
  const toplamFiyat = araToplam + kdvTutari - tevfikatTutari

  return {
    birimFiyat,
    araToplam,
    tevfikatTutari: Math.round(tevfikatTutari * 100) / 100,
    kdvTutari: Math.round(kdvTutari * 100) / 100,
    toplamFiyat: Math.round(toplamFiyat * 100) / 100,
  }
}
