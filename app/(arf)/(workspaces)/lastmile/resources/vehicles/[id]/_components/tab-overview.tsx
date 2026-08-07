'use client'

import {
  Building2,
  CalendarDays,
  CarFront,
  Hash,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VehicleStatusBadge } from '../../_components/vehicle-status-badge'
import { VehicleTypeLabel } from '../../_components/vehicle-type-label'
import {
  VEHICLE_BODY_LABELS,
  VEHICLE_CLASS_LABELS,
  VEHICLE_OWNERSHIP_LABELS,
} from '../../_lib/query-vehicles'
import type { LastmileVehicle } from '../../_types/vehicle'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

type Props = {
  vehicle: LastmileVehicle
}

function SoftChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className='rounded-xl bg-slate-50 px-3.5 py-3'>
      <div className='flex items-center gap-2 text-slate-500'>
        <Icon className='size-3.5' />
        <p className='text-[10px] font-semibold uppercase tracking-[0.1em]'>{label}</p>
      </div>
      <p className='mt-1.5 text-sm font-semibold text-slate-900'>{value}</p>
    </div>
  )
}

export function TabOverview({ vehicle }: Props) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2'>
        <PanelHeader icon={CarFront} title='Araç Kimliği' />
        <div className='px-4 py-3.5'>
          <SectionLabel>Temel Bilgiler</SectionLabel>
          <div className='mt-1 divide-y divide-slate-100'>
            <InfoRow icon={Hash} label='Plaka' value={vehicle.plaka} mono copyable />
            <InfoRow icon={Building2} label='Marka' value={vehicle.marka} />
            <InfoRow
              icon={CarFront}
              label='Model'
              value={`${vehicle.model} · ${vehicle.model_yili}`}
            />
            <InfoRow
              icon={Shield}
              label='Mülkiyet'
              value={VEHICLE_OWNERSHIP_LABELS[vehicle.mulkiyet]}
            />
          </div>
        </div>

        <div className='border-t border-slate-100 px-4 py-3.5'>
          <SectionLabel>Fiziksel Profil</SectionLabel>
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <VehicleTypeLabel
              aracTipi={vehicle.arac_tipi}
              kasaTipi={vehicle.kasa_tipi}
            />
            <Badge
              variant='outline'
              className='rounded-md border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-none'
            >
              {VEHICLE_CLASS_LABELS[vehicle.arac_tipi]}
            </Badge>
            {vehicle.kasa_tipi ? (
              <Badge
                variant='outline'
                className='rounded-md border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-none'
              >
                {VEHICLE_BODY_LABELS[vehicle.kasa_tipi]}
              </Badge>
            ) : null}
          </div>
        </div>
      </section>

      <section className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={CalendarDays} title='Durum Özeti' />
        <div className='space-y-3 px-4 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-sm text-slate-500'>Operasyonel Durum</span>
            <VehicleStatusBadge status={vehicle.durum} />
          </div>
          <SoftChip
            icon={Shield}
            label='Mülkiyet'
            value={
              vehicle.mulkiyet === 'oz_mal'
                ? 'Öz Mal'
                : vehicle.mulkiyet === 'esnaf_kurye'
                  ? 'Esnaf Kurye'
                  : 'Kiralık'
            }
          />
          <SoftChip
            icon={CarFront}
            label='Araç Tipi'
            value={VEHICLE_CLASS_LABELS[vehicle.arac_tipi]}
          />
          <SoftChip
            icon={Hash}
            label='Model Yılı'
            value={String(vehicle.model_yili)}
          />
        </div>
      </section>
    </div>
  )
}
