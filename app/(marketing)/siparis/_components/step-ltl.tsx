'use client'

import { useMemo } from 'react'
import { Info, Layers3 } from 'lucide-react'
import { LOAD_KINDS, PALLET_TYPES, findPallet } from '../_lib/catalog'
import { buildBreakdown, calcDesi } from '../_lib/pricing'
import { type LoadKindId } from '../_lib/order-types'
import { EstimateCard } from './estimate-card'
import { LoadArt } from './order-art'
import { NumberField, QuantityStepper, SelectField, TextField, ToggleRow } from './inputs'
import { SelectionCard } from './selection-card'
import { ExtrasBlock } from './extras-block'
import { SpeedTimingBlock } from './speed-timing-block'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

export function StepLtl() {
  const { draft, setDraft, next, back } = useWizard()
  const { ltl } = draft

  const set = (partial: Partial<typeof ltl>) => {
    setDraft((prev) => ({ ...prev, ltl: { ...prev.ltl, ...partial } }))
  }

  const selectKind = (kind: LoadKindId) => {
    if (kind === 'palet') {
      const pallet = findPallet(ltl.palletTypeId) ?? PALLET_TYPES[0]
      set({ loadKind: kind, palletTypeId: pallet.id, widthCm: pallet.widthCm, lengthCm: pallet.lengthCm })
      return
    }
    set({ loadKind: kind, palletTypeId: null })
  }

  const applyPallet = (id: string) => {
    const pallet = findPallet(id)
    if (!pallet) return
    if (pallet.id === 'diger') {
      set({ palletTypeId: id })
      return
    }
    set({ palletTypeId: id, widthCm: pallet.widthCm, lengthCm: pallet.lengthCm })
  }

  const desi = calcDesi(ltl.widthCm, ltl.lengthCm, ltl.heightCm, ltl.quantity)
  const totalWeight = Math.round(ltl.weightKg * ltl.quantity * 100) / 100
  const breakdown = useMemo(() => buildBreakdown(draft), [draft])

  const isPallet = ltl.loadKind === 'palet'
  const dimensionsLocked = isPallet && ltl.palletTypeId !== null && ltl.palletTypeId !== 'diger'

  const ready =
    ltl.loadKind !== null &&
    ltl.widthCm > 0 &&
    ltl.lengthCm > 0 &&
    ltl.heightCm > 0 &&
    ltl.weightKg > 0 &&
    ltl.quantity > 0

  return (
    <div>
      <StepHeader
        title='Yük tipini belirle'
        description='Sevkiyatı yapılacak yükün cinsini seç, ardından ölçü ve ağırlık bilgilerini gir.'
      />

      <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {LOAD_KINDS.map((kind) => (
          <SelectionCard
            key={kind.id}
            selected={ltl.loadKind === kind.id}
            onSelect={() => selectKind(kind.id)}
            title={kind.label}
            hint={kind.hint}
            art={<LoadArt variant={kind.id} />}
          />
        ))}
      </div>

      {ltl.loadKind ? (
        <div className='mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]'>
          <div className='space-y-5'>
            <div>
              <p className='gl-eyebrow'>
                {isPallet ? 'Palet bilgileri' : `${LOAD_KINDS.find((k) => k.id === ltl.loadKind)?.label} bilgileri`}
              </p>
              <p className='mt-1 text-xs text-[var(--gl-muted)]'>
                Sevkiyatın detaylarını belirt; navlun hacim ve ağırlığa göre hesaplanır.
              </p>

              <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {isPallet ? (
                  <SelectField
                    label='Palet tipi'
                    value={ltl.palletTypeId ?? ''}
                    onChange={applyPallet}
                    placeholder='Palet tipi seç'
                    options={PALLET_TYPES.map((p) => ({ value: p.id, label: p.label }))}
                  />
                ) : null}

                <NumberField
                  label='En'
                  suffix='cm'
                  value={ltl.widthCm}
                  onChange={(v) => set({ widthCm: v })}
                />
                <NumberField
                  label='Boy'
                  suffix='cm'
                  value={ltl.lengthCm}
                  onChange={(v) => set({ lengthCm: v })}
                />
                <NumberField
                  label='Yükseklik'
                  suffix='cm'
                  value={ltl.heightCm}
                  onChange={(v) => set({ heightCm: v })}
                />
                <NumberField
                  label='Parça başı ağırlık'
                  suffix='kg'
                  value={ltl.weightKg}
                  onChange={(v) => set({ weightKg: v })}
                />
                <QuantityStepper
                  label='Adet'
                  value={ltl.quantity}
                  onChange={(v) => set({ quantity: v })}
                  max={200}
                />
              </div>

              {dimensionsLocked ? (
                <p className='mt-2 text-xs text-[var(--gl-muted)]'>
                  En ve boy seçtiğin palet tipinden geldi; istersen üzerine yazabilirsin.
                </p>
              ) : null}
            </div>

            <ToggleRow
              label='Yük istiflenebilir'
              hint='Üzerine başka yük konabiliyorsa navlun düşer'
              checked={ltl.stackable}
              onChange={(checked) => set({ stackable: checked })}
              icon={<Layers3 className='size-4' aria-hidden />}
            />

            <TextField
              label='Yük açıklaması (opsiyonel)'
              placeholder='Örn. seramik karo, paletli ve streçli'
              value={ltl.description}
              onChange={(v) => set({ description: v })}
            />

            <SpeedTimingBlock />

            <ExtrasBlock />
          </div>

          <aside className='h-fit rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-5 lg:sticky lg:top-24'>
            <p className='gl-eyebrow'>Tahmini hesap</p>

            <dl className='mt-3 space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <dt className='text-[var(--gl-muted)]'>Toplam parça</dt>
                <dd className='font-semibold tabular-nums'>{ltl.quantity}</dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='text-[var(--gl-muted)]'>Toplam ağırlık</dt>
                <dd className='font-semibold tabular-nums'>{totalWeight} kg</dd>
              </div>
              <div className='flex items-center justify-between border-t border-[var(--gl-border)] pt-2'>
                <dt className='text-[var(--gl-muted)]'>Toplam hacim</dt>
                <dd className='font-semibold tabular-nums'>{desi.toFixed(0)} desi</dd>
              </div>
            </dl>

            <EstimateCard
              total={breakdown?.total ?? null}
              signature={`${ltl.loadKind}-${ltl.palletTypeId}-${ltl.widthCm}-${ltl.lengthCm}-${ltl.heightCm}-${ltl.weightKg}-${ltl.quantity}-${ltl.stackable}-${draft.deliverySpeed}-${draft.extras.forklift}-${draft.extras.temperatureControl}-${draft.extras.fragile}-${draft.extras.insurance}`}
              label='Tahmini navlun aralığı (KDV dahil)'
              hint={breakdown ? `${breakdown.distanceKm} km güzergâh · kesin tutar teklifte` : undefined}
            />

            <p className='mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--gl-muted)]'>
              <Info className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              Sonraki adımda anlaşmalı firmalar ve taşıma ağı üzerinden oluşan seçenekleri hemen değerlendirebilirsin.
            </p>
          </aside>
        </div>
      ) : null}

      <StepNav onBack={back} onNext={next} nextLabel='Teklifleri Gör' nextDisabled={!ready} />
    </div>
  )
}
