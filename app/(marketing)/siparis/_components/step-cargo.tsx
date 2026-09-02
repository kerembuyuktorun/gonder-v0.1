'use client'

import { useMemo } from 'react'
import { Info, Ruler, ShieldCheck, Sparkles } from 'lucide-react'
import { PACKAGE_PRESETS } from '../_lib/catalog'
import { buildBreakdown, calcDesi } from '../_lib/pricing'
import { EstimateCard } from './estimate-card'
import { PackageArt } from './order-art'
import { NumberField, QuantityStepper, TextField, ToggleRow } from './inputs'
import { SelectionCard } from './selection-card'
import { SpeedTimingBlock } from './speed-timing-block'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

export function StepCargo() {
  const { draft, setDraft, next, back, variant } = useWizard()
  const { cargo } = draft
  const panelPage = variant === 'shipment'

  const setCargo = (partial: Partial<typeof cargo>) => {
    setDraft((prev) => ({ ...prev, cargo: { ...prev.cargo, ...partial } }))
  }

  const desi = calcDesi(cargo.widthCm, cargo.lengthCm, cargo.heightCm, cargo.quantity)
  const totalWeight = Math.round(cargo.weightKg * cargo.quantity * 100) / 100
  const chargeable = Math.max(desi, totalWeight)

  const breakdown = useMemo(() => buildBreakdown(draft), [draft])

  const dimensionsValid =
    cargo.widthCm > 0 && cargo.lengthCm > 0 && cargo.heightCm > 0 && cargo.weightKg > 0

  return (
    <div>
      <StepHeader
        title='Paketini tanımla'
        description='Hazır ölçülerden birini seç ya da kendi ölçülerini gir. Fiyat desi ve ağırlığın büyüğü üzerinden hesaplanır.'
      />

      <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {PACKAGE_PRESETS.map((preset) => (
          <SelectionCard
            key={preset.id}
            selected={cargo.preset === preset.id}
            onSelect={() =>
              setCargo({
                preset: preset.id,
                widthCm: preset.widthCm,
                lengthCm: preset.lengthCm,
                heightCm: preset.heightCm,
                weightKg: preset.weightKg,
              })
            }
            title={preset.label}
            hint={`${preset.widthCm}×${preset.lengthCm}×${preset.heightCm} cm · ${preset.weightKg} kg`}
            art={<PackageArt variant={preset.id} />}
          />
        ))}

        <SelectionCard
          selected={cargo.preset === 'custom'}
          onSelect={() => setCargo({ preset: 'custom' })}
          title='Özel Ölçü'
          hint='Kendi en/boy/yükseklik değerlerini gir'
          art={
            <span className='flex size-14 items-center justify-center rounded-xl bg-[var(--gl-subtle)]'>
              <Ruler className='size-6 text-[var(--gl-petrol)]' aria-hidden />
            </span>
          }
        />
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <div className='space-y-5'>
          <div>
            <p className='gl-eyebrow'>Ölçüler</p>
            <p className='mt-1 text-xs text-[var(--gl-muted)]'>
              Değerleri değiştirdiğinde seçim otomatik olarak özel ölçüye geçer.
            </p>
            <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <NumberField
                label='En'
                suffix='cm'
                value={cargo.widthCm}
                onChange={(v) => setCargo({ widthCm: v, preset: 'custom' })}
              />
              <NumberField
                label='Boy'
                suffix='cm'
                value={cargo.lengthCm}
                onChange={(v) => setCargo({ lengthCm: v, preset: 'custom' })}
              />
              <NumberField
                label='Yükseklik'
                suffix='cm'
                value={cargo.heightCm}
                onChange={(v) => setCargo({ heightCm: v, preset: 'custom' })}
              />
              <NumberField
                label='Ağırlık'
                suffix='kg'
                value={cargo.weightKg}
                onChange={(v) => setCargo({ weightKg: v, preset: 'custom' })}
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end'>
            <QuantityStepper
              label='Parça adedi'
              value={cargo.quantity}
              onChange={(v) => setCargo({ quantity: v })}
            />
            <TextField
              label='İçerik (opsiyonel)'
              placeholder='Örn. tekstil ürünü, elektronik aksesuar'
              value={cargo.contentNote}
              onChange={(v) => setCargo({ contentNote: v })}
            />
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <ToggleRow
              label='Kırılabilir içerik'
              hint='Ek ambalaj ve özenli istifleme'
              checked={draft.extras.fragile}
              onChange={(checked) =>
                setDraft((prev) => ({ ...prev, extras: { ...prev.extras, fragile: checked } }))
              }
              icon={<Sparkles className='size-4' aria-hidden />}
            />
            <ToggleRow
              label='Yük sigortası'
              hint='Beyan değeri üzerinden teminat'
              checked={draft.extras.insurance}
              onChange={(checked) =>
                setDraft((prev) => ({ ...prev, extras: { ...prev.extras, insurance: checked } }))
              }
              icon={<ShieldCheck className='size-4' aria-hidden />}
            />
          </div>

          {draft.extras.insurance ? (
            <div className='max-w-xs'>
              <NumberField
                label='Beyan edilen yük değeri'
                suffix='₺'
                value={draft.extras.declaredValue}
                onChange={(v) =>
                  setDraft((prev) => ({ ...prev, extras: { ...prev.extras, declaredValue: v } }))
                }
              />
            </div>
          ) : null}
        </div>

        <aside className='h-fit rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-5 lg:sticky lg:top-24'>
          <p className='gl-eyebrow'>Tahmini hesap</p>

          <dl className='mt-3 space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <dt className='text-[var(--gl-muted)]'>Toplam desi</dt>
              <dd className='font-semibold tabular-nums'>{desi.toFixed(2)}</dd>
            </div>
            <div className='flex items-center justify-between'>
              <dt className='text-[var(--gl-muted)]'>Toplam ağırlık</dt>
              <dd className='font-semibold tabular-nums'>{totalWeight} kg</dd>
            </div>
            <div className='flex items-center justify-between border-t border-[var(--gl-border)] pt-2'>
              <dt className='text-[var(--gl-muted)]'>Ücrete esas</dt>
              <dd className='font-semibold tabular-nums'>{chargeable.toFixed(2)}</dd>
            </div>
          </dl>

          <EstimateCard
            total={breakdown?.total ?? null}
            signature={`${cargo.preset}-${cargo.widthCm}-${cargo.lengthCm}-${cargo.heightCm}-${cargo.weightKg}-${cargo.quantity}-${draft.deliverySpeed}-${draft.extras.fragile}-${draft.extras.insurance}-${draft.extras.declaredValue}`}
            hint={
              breakdown
                ? `${breakdown.distanceKm} km güzergâh${panelPage ? '' : ' · kesin tutar teklifte'}`
                : undefined
            }
          />

          {panelPage ? null : (
            <p className='mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--gl-muted)]'>
              <Info className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              Kesin tutarı sonraki adımda seçeceğin teklif belirler.
            </p>
          )}
        </aside>
      </div>

      <div className='mt-8'>
        <SpeedTimingBlock />
      </div>

      <StepNav
        onBack={back}
        onNext={next}
        nextLabel='Teklifleri Gör'
        nextDisabled={!dimensionsValid || cargo.preset === null}
      />
    </div>
  )
}
