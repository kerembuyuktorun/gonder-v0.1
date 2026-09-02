'use client'

import { useState } from 'react'
import { ChevronDown, Layers, Pencil, Plus, Trash2, Truck } from 'lucide-react'
import { BODY_TYPES, VEHICLE_TYPES, findBody, findVehicle } from '../_lib/catalog'
import { createEmptyVehicleRow, type VehicleRow } from '../_lib/order-types'
import { BodyArt, VehicleArt } from './order-art'
import { QuantityStepper } from './inputs'
import { SelectionCard } from './selection-card'
import { ExtrasBlock } from './extras-block'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

function rowIsComplete(row: VehicleRow) {
  return Boolean(row.vehicleTypeId && row.bodyTypeId && row.count > 0)
}

export function StepFtl() {
  const { draft, setDraft, next, back } = useWizard()
  const rows = draft.ftl.rows
  const [openRowId, setOpenRowId] = useState<string | null>(rows[0]?.id ?? null)

  const updateRow = (id: string, partial: Partial<VehicleRow>) => {
    setDraft((prev) => ({
      ...prev,
      ftl: { rows: prev.ftl.rows.map((row) => (row.id === id ? { ...row, ...partial } : row)) },
    }))
  }

  const addRow = () => {
    const row = createEmptyVehicleRow()
    setDraft((prev) => ({ ...prev, ftl: { rows: [...prev.ftl.rows, row] } }))
    setOpenRowId(row.id)
  }

  const removeRow = (id: string) => {
    setDraft((prev) => ({ ...prev, ftl: { rows: prev.ftl.rows.filter((row) => row.id !== id) } }))
    setOpenRowId((current) => (current === id ? null : current))
  }

  const allComplete = rows.length > 0 && rows.every(rowIsComplete)
  const totalVehicles = rows.reduce((sum, row) => sum + (rowIsComplete(row) ? row.count : 0), 0)

  return (
    <div>
      <StepHeader
        title='Araç ve kasa tipini eşleştir'
        description='Her araç için kasa tipini ayrı ayrı belirleyebilirsin. Birden fazla araç gerekiyorsa satır ekle.'
      />

      <div className='space-y-4'>
        {rows.map((row, index) => {
          const vehicle = findVehicle(row.vehicleTypeId)
          const body = findBody(row.bodyTypeId)
          const open = openRowId === row.id
          const complete = rowIsComplete(row)

          return (
            <div
              key={row.id}
              className={`overflow-hidden rounded-2xl border-2 transition-colors ${
                open ? 'border-[var(--gl-petrol)]' : 'border-[var(--gl-border)]'
              }`}
            >
              <div className='flex items-center gap-3 bg-white p-4'>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    complete ? 'bg-[var(--gl-petrol)] text-white' : 'bg-[var(--gl-subtle)] text-[var(--gl-muted)]'
                  }`}
                >
                  {index + 1}
                </span>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-[var(--gl-ink)]'>
                    {vehicle ? vehicle.label : 'Araç tipi seçilmedi'}
                    {body ? ` · ${body.label}` : ''}
                  </p>
                  <p className='truncate text-xs text-[var(--gl-muted)]'>
                    {complete ? `${row.count} araç · ${vehicle?.capacity}` : 'Araç ve kasa tipini seç'}
                  </p>
                </div>

                {rows.length > 1 ? (
                  <button
                    type='button'
                    onClick={() => removeRow(row.id)}
                    aria-label={`${index + 1}. aracı kaldır`}
                    className='shrink-0 rounded-lg p-2 text-[var(--gl-muted)] transition-colors hover:bg-[var(--gl-accent-soft)] hover:text-[var(--gl-accent)]'
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                ) : null}

                <button
                  type='button'
                  onClick={() => setOpenRowId(open ? null : row.id)}
                  aria-expanded={open}
                  className='inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--gl-petrol)] transition-colors hover:bg-[var(--gl-petrol-soft)]'
                >
                  {open ? (
                    <>
                      Kapat
                      <ChevronDown className='size-4' aria-hidden />
                    </>
                  ) : (
                    <>
                      <Pencil className='size-3.5' aria-hidden />
                      Düzenle
                    </>
                  )}
                </button>
              </div>

              {open ? (
                <div className='space-y-6 border-t border-[var(--gl-border)] bg-[var(--gl-bg-soft)] p-4 sm:p-5'>
                  <div>
                    <p className='flex items-center gap-2 text-sm font-semibold text-[var(--gl-ink)]'>
                      <Truck className='size-4 text-[var(--gl-petrol)]' aria-hidden />
                      Araç tipi
                    </p>
                    <div className='mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5'>
                      {VEHICLE_TYPES.map((option) => (
                        <SelectionCard
                          key={option.id}
                          selected={row.vehicleTypeId === option.id}
                          onSelect={() => updateRow(row.id, { vehicleTypeId: option.id })}
                          title={option.label}
                          hint={option.capacity}
                          art={<VehicleArt variant={option.id} />}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='flex items-center gap-2 text-sm font-semibold text-[var(--gl-ink)]'>
                      <Layers className='size-4 text-[var(--gl-petrol)]' aria-hidden />
                      Kasa tipi
                    </p>
                    <div className='mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
                      {BODY_TYPES.map((option) => (
                        <SelectionCard
                          key={option.id}
                          selected={row.bodyTypeId === option.id}
                          onSelect={() => updateRow(row.id, { bodyTypeId: option.id })}
                          title={option.label}
                          hint={option.hint}
                          art={<BodyArt variant={option.id} />}
                        />
                      ))}
                    </div>
                  </div>

                  <QuantityStepper
                    label='Bu konfigürasyondan kaç araç?'
                    value={row.count}
                    onChange={(v) => updateRow(row.id, { count: v })}
                    max={40}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <button
        type='button'
        onClick={addRow}
        className='mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--gl-border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--gl-petrol)] transition-colors hover:border-[var(--gl-petrol)] hover:bg-[var(--gl-petrol-soft)]'
      >
        <Plus className='size-4' aria-hidden />
        Farklı araç/kasa ekle
      </button>

      <div className='mt-8'>
        <ExtrasBlock />
      </div>

      <StepNav
        onBack={back}
        onNext={next}
        nextLabel='Teklifleri Gör'
        nextDisabled={!allComplete}
        helper={allComplete ? `Toplam ${totalVehicles} araç` : 'Her satır için araç ve kasa tipi seç'}
      />
    </div>
  )
}
