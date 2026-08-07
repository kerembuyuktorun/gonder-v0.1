'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { AssignmentSearchPicker } from '../../_components/assignment-search-picker'
import {
  getVehicleAssignmentConflict,
  isVehicleAssignableToCourier,
} from '../../_lib/assignment-validation'
import type { VehicleOption } from '../_lib/vehicle-options'
import type { LastmileCourier } from '../_types/courier'

type Props = {
  courier: Pick<LastmileCourier, 'id' | 'zimmetli_arac_id' | 'zimmetli_arac_plaka'>
  vehicleOptions: VehicleOption[]
  canChange?: boolean
  onAssign: (vehicleId: string | null) => void
  variant?: 'default' | 'table'
}

export function AssignedVehicleField({
  courier,
  vehicleOptions,
  canChange = true,
  onAssign,
  variant = 'default',
}: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const pickerOptions = useMemo(
    () =>
      vehicleOptions.map((vehicle) => {
        const isDisabled = !isVehicleAssignableToCourier(vehicle, courier.id)
        return {
          id: vehicle.id,
          label: vehicle.plaka,
          searchText: vehicle.plaka,
          disabled: isDisabled,
        }
      }),
    [courier.id, vehicleOptions]
  )

  const handleSelect = (vehicleId: string | null) => {
    if (vehicleId) {
      const vehicle = vehicleOptions.find((item) => item.id === vehicleId)
      if (vehicle) {
        const conflict = getVehicleAssignmentConflict(vehicle, courier.id)
        if (conflict) {
          toast.error(conflict)
          return
        }
      }
    }

    onAssign(vehicleId)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <AssignmentSearchPicker
        open={isEditing}
        onOpenChange={setIsEditing}
        value={courier.zimmetli_arac_id}
        placeholder='Araç seçin'
        searchPlaceholder='Plaka ara...'
        options={pickerOptions}
        onSelect={handleSelect}
        triggerClassName='font-mono'
      />
    )
  }

  const linkClassName =
    variant === 'table'
      ? 'font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
      : 'font-mono text-sm font-semibold text-slate-800 transition-colors hover:text-sky-700'

  const emptyClassName =
    variant === 'table'
      ? 'text-sm text-muted-foreground'
      : 'text-sm font-semibold text-slate-500'

  return (
    <div className='flex min-w-0 items-center gap-1.5'>
      {courier.zimmetli_arac_id && courier.zimmetli_arac_plaka ? (
        <Link
          href={ARF_ROUTES.lastmile.resources.vehicles.detail(courier.zimmetli_arac_id)}
          className={linkClassName}
        >
          {courier.zimmetli_arac_plaka}
        </Link>
      ) : (
        <span className={emptyClassName}>Atanmamış</span>
      )}
      {canChange ? (
        <button
          type='button'
          onClick={() => setIsEditing(true)}
          className={cn(
            'rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700',
            variant === 'table' && 'shrink-0'
          )}
          aria-label='Zimmetli araç değiştir'
        >
          <Pencil className='size-3.5' />
        </button>
      ) : null}
      {canChange && courier.zimmetli_arac_id ? (
        <button
          type='button'
          onClick={() => onAssign(null)}
          className={cn(
            'rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600',
            variant === 'table' && 'shrink-0'
          )}
          aria-label='Zimmeti kaldır'
        >
          <Trash2 className='size-3.5' />
        </button>
      ) : null}
    </div>
  )
}
