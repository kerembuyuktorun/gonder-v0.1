'use client'

import { MapPin, MapPinned, Navigation } from 'lucide-react'
import { OperationScopeEditor } from '../../../../customers/[id]/_components/operation-scope-editor'
import type { OperationScopeRow } from '../../../../customers/[id]/_types/customer-detail'
import { AddressMapPreview } from '../../../../orders/new/_components/address-map-preview'
import { VEHICLE_START_STRATEGY_LABELS } from '../../_lib/query-vehicles'
import type { VehicleStartStrategy } from '../../_types/vehicle'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

export type VehicleStartLocationValues = {
  baslangic_stratejisi: VehicleStartStrategy
  park_konumu: string
  park_lat: number | null
  park_lng: number | null
}

type Props = {
  scopes: OperationScopeRow[]
  onScopesChange: (scopes: OperationScopeRow[]) => void
  startLocation: VehicleStartLocationValues
  readOnly?: boolean
}

export function TabOperations({ scopes, onScopesChange, startLocation, readOnly = false }: Props) {
  const isFixedPark = startLocation.baslangic_stratejisi === 'sabit_park'

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <OperationScopeEditor
        title='Hizmet Bölgesi'
        icon={MapPinned}
        tooltip='Kapsamı il → ilçe → mahalle düzeyinde satır satır ekleyin. Atama motoru aracı yalnızca bu bölgelerdeki işlere yönlendirir.'
        scopes={scopes}
        onChange={onScopesChange}
        readOnly={readOnly}
      />

      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
        <PanelHeader icon={MapPin} title='Başlangıç Konumu' />

        <div className='space-y-3 px-4 py-3.5'>
          <div>
            <SectionLabel>Strateji</SectionLabel>
            <div className='mt-1 divide-y divide-slate-100'>
              <InfoRow
                icon={MapPin}
                label='Başlangıç Stratejisi'
                value={VEHICLE_START_STRATEGY_LABELS[startLocation.baslangic_stratejisi]}
              />
              {isFixedPark ? (
                <InfoRow
                  icon={Navigation}
                  label='Park Konumu'
                  value={startLocation.park_konumu || null}
                />
              ) : null}
            </div>
          </div>

          {isFixedPark ? (
            <AddressMapPreview
              latitude={startLocation.park_lat}
              longitude={startLocation.park_lng}
              title={startLocation.park_konumu}
              kind='facility'
              tone='sky'
            />
          ) : (
            <p className='rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500'>
              Maliyet hesabı o gün araca atanan ilk alış noktasından başlar; park adresi
              gerekmez.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
