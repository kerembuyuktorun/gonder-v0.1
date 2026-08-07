'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Route } from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import type { LastmileVehicle } from '../_types/vehicle'
import {
  formatVehicleRouteMeta,
  isVehicleActiveOnRoute,
} from '../_lib/vehicle-status-helpers'
import { VehicleStatusBadge } from './vehicle-status-badge'

export {
  formatVehicleRouteMeta,
  isVehicleActiveOnRoute,
  vehicleMatchesStatusScope,
} from '../_lib/vehicle-status-helpers'

export function VehicleStatusField({ vehicle }: { vehicle: LastmileVehicle }) {
  if (isVehicleActiveOnRoute(vehicle) && vehicle.aktif_rota_id) {
    const routeMeta = formatVehicleRouteMeta(vehicle)

    return (
      <Link
        href={ARF_ROUTES.lastmile.planning.routeDetail(vehicle.aktif_rota_id)}
        className='group inline-flex min-w-0 flex-col gap-1 rounded-lg transition-colors'
        title='Rota detayına git'
      >
        <Badge
          variant='outline'
          className='w-fit gap-1.5 whitespace-nowrap border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 shadow-none transition-colors group-hover:border-emerald-300 group-hover:bg-emerald-100/80'
        >
          <Route className='size-3 shrink-0 opacity-90' />
          <span className='font-mono tracking-tight'>#{vehicle.aktif_rota_id}</span>
        </Badge>
        {routeMeta ? (
          <span className='text-xs font-medium text-slate-500 transition-colors group-hover:text-emerald-700'>
            {routeMeta}
          </span>
        ) : null}
      </Link>
    )
  }

  return <VehicleStatusBadge status={vehicle.durum} />
}
