'use client'

import { ArrowRight, MapPin, Pencil } from 'lucide-react'
import {
  findBody,
  findLoadKind,
  findPallet,
  findPreset,
  findVehicle,
  PACKAGE_PRESETS,
} from '../_lib/catalog'
import { calcDesi } from '../_lib/pricing'
import type { OrderDraft } from '../_lib/order-types'
import { useWizard, type StepId } from './wizard-context'

type SummaryRow = { label: string; value: string }

function formatDate(value: string): string {
  if (!value) return 'Esnek'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function buildSummaryRows(draft: OrderDraft): SummaryRow[] {
  const rows: SummaryRow[] = [{ label: 'Yükleme tarihi', value: formatDate(draft.extras.loadingDate) }]

  if (draft.service === 'kargo') {
    const { cargo } = draft
    const preset = findPreset(cargo.preset)
    rows.push({ label: 'Taşıma tipi', value: 'Kargo' })
    rows.push({
      label: 'Paket',
      value: preset ? preset.label : PACKAGE_PRESETS.some((p) => p.id === cargo.preset) ? '' : 'Özel ölçü',
    })
    rows.push({
      label: 'Ölçüler',
      value: `${cargo.widthCm}×${cargo.lengthCm}×${cargo.heightCm} cm · ${cargo.weightKg} kg`,
    })
    rows.push({ label: 'Parça adedi', value: `${cargo.quantity} parça` })
    rows.push({
      label: 'Toplam desi',
      value: calcDesi(cargo.widthCm, cargo.lengthCm, cargo.heightCm, cargo.quantity).toFixed(2),
    })
    if (cargo.contentNote) rows.push({ label: 'İçerik', value: cargo.contentNote })
  } else if (draft.logisticsMode === 'ftl') {
    rows.push({ label: 'Taşıma opsiyonu', value: 'FTL (Komple Taşımacılık)' })
    draft.ftl.rows.forEach((row, index) => {
      const vehicle = findVehicle(row.vehicleTypeId)
      const body = findBody(row.bodyTypeId)
      if (!vehicle || !body) return
      rows.push({
        label: draft.ftl.rows.length > 1 ? `Araç ${index + 1}` : 'Araç / kasa',
        value: `${vehicle.label} · ${body.label} · ${row.count} adet`,
      })
    })
  } else if (draft.logisticsMode === 'ltl') {
    const { ltl } = draft
    const kind = findLoadKind(ltl.loadKind)
    const pallet = findPallet(ltl.palletTypeId)
    rows.push({ label: 'Taşıma opsiyonu', value: 'LTL (Parsiyel Taşımacılık)' })
    rows.push({ label: 'Yük tipi', value: kind?.label ?? '—' })
    if (pallet && pallet.id !== 'diger') rows.push({ label: 'Palet tipi', value: pallet.label })
    rows.push({ label: 'Ölçüler', value: `${ltl.widthCm}×${ltl.lengthCm}×${ltl.heightCm} cm` })
    rows.push({ label: 'Adet / ağırlık', value: `${ltl.quantity} parça · ${ltl.weightKg * ltl.quantity} kg` })
    rows.push({ label: 'İstiflenebilir', value: ltl.stackable ? 'Evet' : 'Hayır' })
    if (ltl.description) rows.push({ label: 'Açıklama', value: ltl.description })
  }

  const extras: string[] = []
  if (draft.extras.forklift) extras.push('Forklift desteği')
  if (draft.extras.temperatureControl) extras.push('Isı kontrollü')
  if (draft.extras.fragile) extras.push('Kırılabilir')
  if (draft.extras.insurance) extras.push('Sigortalı')
  if (extras.length > 0) rows.push({ label: 'Ek hizmetler', value: extras.join(', ') })

  return rows
}

export function OrderSummary({ editable = true }: { editable?: boolean }) {
  const { draft, goTo } = useWizard()
  const rows = buildSummaryRows(draft)

  const detailStep: StepId = 'details'

  return (
    <div className='rounded-2xl border border-[var(--gl-border)] bg-white'>
      <div className='flex items-center justify-between gap-3 border-b border-[var(--gl-border)] p-4'>
        <p className='gl-eyebrow'>Sipariş özeti</p>
        {editable ? (
          <button
            type='button'
            onClick={() => goTo(detailStep)}
            className='inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gl-petrol)] hover:underline'
          >
            <Pencil className='size-3' aria-hidden />
            Detayları düzenle
          </button>
        ) : null}
      </div>

      <div className='space-y-3 border-b border-[var(--gl-border)] p-4'>
        <div className='flex items-start gap-2.5'>
          <MapPin className='mt-0.5 size-4 shrink-0 text-[var(--gl-petrol)]' aria-hidden />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[var(--gl-ink)]'>{draft.origin?.title}</p>
            <p className='truncate text-xs text-[var(--gl-muted)]'>{draft.origin?.subtitle}</p>
          </div>
        </div>
        <div className='ml-[7px] h-4 border-l-2 border-dashed border-[var(--gl-border-strong)]' aria-hidden />
        <div className='flex items-start gap-2.5'>
          <MapPin className='mt-0.5 size-4 shrink-0 text-[var(--gl-accent)]' aria-hidden />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[var(--gl-ink)]'>{draft.destination?.title}</p>
            <p className='truncate text-xs text-[var(--gl-muted)]'>{draft.destination?.subtitle}</p>
          </div>
        </div>
        {editable ? (
          <button
            type='button'
            onClick={() => goTo('route')}
            className='inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gl-petrol)] hover:underline'
          >
            Adresleri değiştir
            <ArrowRight className='size-3' aria-hidden />
          </button>
        ) : null}
      </div>

      <dl className='divide-y divide-[var(--gl-border)]'>
        {rows
          .filter((row) => row.value)
          .map((row) => (
            <div key={`${row.label}-${row.value}`} className='flex items-start justify-between gap-4 px-4 py-2.5'>
              <dt className='text-xs text-[var(--gl-muted)]'>{row.label}</dt>
              <dd className='text-right text-xs font-medium text-[var(--gl-ink)]'>{row.value}</dd>
            </div>
          ))}
      </dl>
    </div>
  )
}
