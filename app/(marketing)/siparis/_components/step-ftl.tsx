'use client'

import { useEffect, useMemo, useState } from 'react'
import { Layers, Plus, Sparkles, Trash2, Truck } from 'lucide-react'
import { BODY_TYPES, VEHICLE_TYPES, findBody, findVehicle } from '../_lib/catalog'
import { inferFtlConfig } from '../_lib/infer-load'
import { createEmptyVehicleRow, type VehicleRow } from '../_lib/order-types'
import { buildBreakdown } from '../_lib/pricing'
import { BodyArt, VehicleArt } from './order-art'
import { EstimateCard } from './estimate-card'
import { QuantityStepper } from './inputs'
import { SelectionCard } from './selection-card'
import { ExtrasBlock } from './extras-block'
import { SpeedTimingBlock } from './speed-timing-block'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

function rowIsComplete(row: VehicleRow) {
  return Boolean(row.vehicleTypeId && row.bodyTypeId && row.count > 0)
}

function defaultAiRow(signal: {
  quantity?: number
  weightKg?: number
  description?: string
}): VehicleRow {
  const ai = inferFtlConfig({
    quantity: signal.quantity,
    weightKg: signal.weightKg,
    text: signal.description,
  })
  return {
    id: `veh-${ai.vehicleTypeId}`,
    vehicleTypeId: ai.vehicleTypeId,
    bodyTypeId: ai.bodyTypeId,
    count: 1,
  }
}

export function StepFtl() {
  const { draft, setDraft, next, back, variant } = useWizard()
  const rows = draft.ftl.rows
  const panelPage = variant === 'shipment'
  const [aiSuggested, setAiSuggested] = useState(() =>
    rows.some((row) => row.vehicleTypeId && row.bodyTypeId)
  )

  const selectedVehicleIds = rows
    .map((row) => row.vehicleTypeId)
    .filter((id): id is string => Boolean(id))
  const primaryBodyId = rows.find((row) => row.bodyTypeId)?.bodyTypeId ?? 'tenteli'

  const setRows = (nextRows: VehicleRow[], suggested = false) => {
    setDraft((prev) => ({ ...prev, ftl: { rows: nextRows } }))
    setAiSuggested(suggested)
  }

  const applyAi = () => {
    setRows(
      [
        defaultAiRow({
          quantity: draft.ltl.loadKind === 'palet' ? draft.ltl.quantity : undefined,
          weightKg: draft.ltl.loadKind
            ? draft.ltl.weightKg * (draft.ltl.quantity || 1)
            : undefined,
          description: draft.ltl.description,
        }),
      ],
      true
    )
  }

  useEffect(() => {
    if (rows.some((row) => row.vehicleTypeId && row.bodyTypeId)) return
    applyAi()
    // İlk açılışta boş satırı AI önerisiyle doldur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleVehicle = (id: string) => {
    const exists = selectedVehicleIds.includes(id)
    const nextIds = exists ? selectedVehicleIds.filter((item) => item !== id) : [...selectedVehicleIds, id]
    if (nextIds.length === 0) {
      applyAi()
      return
    }
    const nextRows = nextIds.map((vehicleTypeId) => {
      const existing = rows.find((row) => row.vehicleTypeId === vehicleTypeId)
      return (
        existing ?? {
          id: `veh-${vehicleTypeId}`,
          vehicleTypeId,
          bodyTypeId: primaryBodyId,
          count: 1,
        }
      )
    })
    setRows(nextRows)
  }

  const selectBody = (id: string) => {
    const nextRows = (rows.length > 0 ? rows : [createEmptyVehicleRow()]).map((row) => ({
      ...row,
      bodyTypeId: id,
      vehicleTypeId: row.vehicleTypeId,
    }))
    setRows(nextRows)
  }

  const updateCount = (id: string, count: number) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, count } : row)))
  }

  const removeRow = (id: string) => {
    const nextRows = rows.filter((row) => row.id !== id)
    if (nextRows.length === 0) {
      applyAi()
      return
    }
    setRows(nextRows)
  }

  const addRow = () => {
    const unused = VEHICLE_TYPES.find((item) => !selectedVehicleIds.includes(item.id))
    if (unused) {
      toggleVehicle(unused.id)
      return
    }
    const row = createEmptyVehicleRow()
    setRows([...rows, { ...row, bodyTypeId: primaryBodyId }])
  }

  const allComplete = rows.length > 0 && rows.every(rowIsComplete)
  const totalVehicles = rows.reduce((sum, row) => sum + (rowIsComplete(row) ? row.count : 0), 0)
  const breakdown = useMemo(() => (allComplete ? buildBreakdown(draft) : null), [allComplete, draft])
  const vehicleSignature = rows.map((row) => `${row.vehicleTypeId}-${row.bodyTypeId}-${row.count}`).join('|')

  const handleNext = () => {
    if (!allComplete) applyAi()
    next()
  }

  return (
    <div>
      <StepHeader
        title='Araç ve kasa tipi'
        description='Gönder AI bir öneri doldurdu. Birden fazla araç seçebilir, kasa tipini tümüne uygulayabilirsin.'
      />

      <div className='mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--gl-petrol)]/30 bg-[var(--gl-petrol-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm font-medium text-[var(--gl-ink)]'>
          {aiSuggested ? 'AI önerisi — değiştirebilirsin' : 'Seçimini değiştirdin. İstersen AI yeniden önerir.'}
        </p>
        <button
          type='button'
          onClick={applyAi}
          className='inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--gl-petrol)] px-3 py-1.5 text-xs font-semibold text-white'
        >
          <Sparkles className='size-3.5' aria-hidden />
          Gönder AI seçsin
        </button>
      </div>

      <div>
        <p className='flex items-center gap-2 text-sm font-semibold text-[var(--gl-ink)]'>
          <Truck className='size-4 text-[var(--gl-petrol)]' aria-hidden />
          Araç tipi
          <span className='text-xs font-normal text-[var(--gl-muted)]'>Birden fazla seçebilirsin</span>
        </p>
        <div className='mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          {VEHICLE_TYPES.map((option) => (
            <SelectionCard
              key={option.id}
              selected={selectedVehicleIds.includes(option.id)}
              onSelect={() => toggleVehicle(option.id)}
              title={option.label}
              hint={option.capacity}
              art={<VehicleArt variant={option.id} />}
            />
          ))}
        </div>
      </div>

      <div className='mt-6'>
        <p className='flex items-center gap-2 text-sm font-semibold text-[var(--gl-ink)]'>
          <Layers className='size-4 text-[var(--gl-petrol)]' aria-hidden />
          Kasa tipi
          <span className='text-xs font-normal text-[var(--gl-muted)]'>Seçilen tüm araçlara uygulanır</span>
        </p>
        <div className='mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          {BODY_TYPES.map((option) => (
            <SelectionCard
              key={option.id}
              selected={primaryBodyId === option.id}
              onSelect={() => selectBody(option.id)}
              title={option.label}
              hint={option.hint}
              art={<BodyArt variant={option.id} />}
            />
          ))}
        </div>
      </div>

      {rows.length > 0 ? (
        <ul className='mt-6 space-y-2'>
          {rows.map((row) => {
            const vehicle = findVehicle(row.vehicleTypeId)
            const body = findBody(row.bodyTypeId)
            return (
              <li
                key={row.id}
                className='flex flex-col gap-3 rounded-xl border border-[var(--gl-border)] bg-white px-3 py-3 sm:flex-row sm:items-center'
              >
                <p className='min-w-0 flex-1 text-sm font-medium text-[var(--gl-ink)]'>
                  {vehicle?.label ?? 'Araç'} · {body?.label ?? 'Kasa'}
                </p>
                <QuantityStepper
                  label='Adet'
                  value={row.count}
                  onChange={(value) => updateCount(row.id, value)}
                  max={40}
                />
                {rows.length > 1 ? (
                  <button
                    type='button'
                    onClick={() => removeRow(row.id)}
                    aria-label='Bu aracı kaldır'
                    className='inline-flex items-center justify-center rounded-lg p-2 text-[var(--gl-muted)] hover:bg-[var(--gl-accent-soft)] hover:text-[var(--gl-accent)]'
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <button
        type='button'
        onClick={addRow}
        className='mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--gl-border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--gl-petrol)] transition-colors hover:border-[var(--gl-petrol)] hover:bg-[var(--gl-petrol-soft)]'
      >
        <Plus className='size-4' aria-hidden />
        Farklı araç/kasa ekle
      </button>

      <div className='mt-8'>
        <SpeedTimingBlock />
      </div>

      <div className='mt-8'>
        <ExtrasBlock />
      </div>

      {allComplete ? (
        <aside className='mt-6 max-w-sm rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-5'>
          <p className='gl-eyebrow'>Tahmini hesap</p>
          <EstimateCard
            total={breakdown?.total ?? null}
            signature={`${vehicleSignature}-${draft.deliverySpeed}-${draft.extras.forklift}-${draft.extras.temperatureControl}-${draft.extras.fragile}-${draft.extras.insurance}`}
            label='Tahmini navlun aralığı (KDV dahil)'
            hint={
              breakdown
                ? `${breakdown.distanceKm} km${panelPage ? '' : ' · kesin tutar teklifte'}`
                : undefined
            }
          />
        </aside>
      ) : null}

      <StepNav
        onBack={back}
        onNext={handleNext}
        nextLabel='Teklifleri Gör'
        helper={allComplete ? `Toplam ${totalVehicles} araç` : 'AI önerisiyle devam edebilirsin'}
      />
    </div>
  )
}
