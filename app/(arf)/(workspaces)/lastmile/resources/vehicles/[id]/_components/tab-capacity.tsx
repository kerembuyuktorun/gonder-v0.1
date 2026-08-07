'use client'

import { Badge } from '@/components/ui/badge'
import { Box, Gauge, Scale, Sparkles } from 'lucide-react'
import { VehicleOccupancy } from '../../_components/vehicle-occupancy'
import { VEHICLE_SKILL_LABELS } from '../../_lib/query-vehicles'
import type { LastmileVehicle } from '../../_types/vehicle'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

type Props = {
  vehicle: LastmileVehicle
}

export function TabCapacity({ vehicle }: Props) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2'>
        <PanelHeader icon={Gauge} title='Kapasite Limitleri' />
        <div className='px-4 py-3.5'>
          <SectionLabel>Maksimum Değerler</SectionLabel>
          <div className='mt-1 divide-y divide-slate-100'>
            <InfoRow
              icon={Scale}
              label='Max Ağırlık'
              value={`${vehicle.max_agirlik_kg.toLocaleString('tr-TR')} kg`}
            />
            <InfoRow
              icon={Box}
              label='Max Hacim'
              value={`${vehicle.max_hacim_m3.toLocaleString('tr-TR')} m³`}
            />
          </div>
        </div>

        <div className='border-t border-slate-100 px-4 py-3.5'>
          <SectionLabel>Anlık Doluluk</SectionLabel>
          <div className='mt-3 rounded-xl bg-slate-50 px-3.5 py-3'>
            <VehicleOccupancy
              volumePct={vehicle.doluluk_hacim_pct}
              weightPct={vehicle.doluluk_agirlik_pct}
              maxVolumeM3={vehicle.max_hacim_m3}
              maxWeightKg={vehicle.max_agirlik_kg}
            />
          </div>
          <p className='mt-3 text-xs leading-relaxed text-slate-400'>
            Doluluk, üzerindeki siparişlerin hacim/ağırlık toplamının araç üst
            sınırına oranıdır. %80 ve üzeri kritik kabul edilir.
          </p>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={Sparkles} title='Donanım ve Yetenekler' />
        <div className='px-4 py-4'>
          {vehicle.yetenekler.length === 0 ? (
            <p className='text-sm text-slate-400'>Tanımlı yetenek yok.</p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {vehicle.yetenekler.map((skill) => (
                <Badge
                  key={skill}
                  variant='outline'
                  className='rounded-md border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-none'
                >
                  {VEHICLE_SKILL_LABELS[skill]}
                </Badge>
              ))}
            </div>
          )}
          <p className='mt-4 text-xs leading-relaxed text-slate-400'>
            Yetenekler rota motorunun sipariş gereksinimleriyle eşleşmesinde
            kullanılır.
          </p>
        </div>
      </section>
    </div>
  )
}
