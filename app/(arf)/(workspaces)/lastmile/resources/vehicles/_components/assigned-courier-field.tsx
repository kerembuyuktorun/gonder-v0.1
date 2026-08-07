'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { AssignmentSearchPicker } from '../../_components/assignment-search-picker'
import {
  getCourierAssignmentConflict,
  isCourierAssignableToVehicle,
} from '../../_lib/assignment-validation'
import type { CourierOption } from '../_lib/map-vehicle'
import type { LastmileVehicle } from '../_types/vehicle'

type Props = {
  vehicle: Pick<LastmileVehicle, 'id' | 'zimmetli_surucu_id' | 'zimmetli_surucu'>
  courierOptions: CourierOption[]
  canChange?: boolean
  onAssign: (courierId: string | null) => void
  variant?: 'default' | 'table'
}

export function AssignedCourierField({
  vehicle,
  courierOptions,
  canChange = true,
  onAssign,
  variant = 'default',
}: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const pickerOptions = useMemo(
    () =>
      courierOptions.map((courier) => {
        const isDisabled = !isCourierAssignableToVehicle(courier, vehicle.id)
        return {
          id: courier.id,
          label: courier.name,
          searchText: courier.name,
          disabled: isDisabled,
        }
      }),
    [courierOptions, vehicle.id]
  )

  const handleSelect = (courierId: string | null) => {
    if (courierId) {
      const courier = courierOptions.find((item) => item.id === courierId)
      if (courier) {
        const conflict = getCourierAssignmentConflict(courier, vehicle.id)
        if (conflict) {
          toast.error(conflict)
          return
        }
      }
    }

    onAssign(courierId)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <AssignmentSearchPicker
        open={isEditing}
        onOpenChange={setIsEditing}
        value={vehicle.zimmetli_surucu_id}
        placeholder='Kurye seçin'
        searchPlaceholder='Kurye ara...'
        options={pickerOptions}
        onSelect={handleSelect}
      />
    )
  }

  const linkClassName =
    variant === 'table'
      ? 'truncate text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
      : 'truncate text-sm font-semibold text-slate-800 transition-colors hover:text-sky-700'

  const emptyClassName =
    variant === 'table'
      ? 'text-sm text-muted-foreground'
      : 'text-sm font-semibold text-slate-400'

  return (
    <div className='flex min-w-0 items-center gap-1.5'>
      {vehicle.zimmetli_surucu_id && vehicle.zimmetli_surucu ? (
        <Link
          href={ARF_ROUTES.lastmile.resources.couriers.detail(vehicle.zimmetli_surucu_id)}
          className={linkClassName}
        >
          {vehicle.zimmetli_surucu}
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
          aria-label='Zimmetli kurye değiştir'
        >
          <Pencil className='size-3.5' />
        </button>
      ) : null}
      {canChange && vehicle.zimmetli_surucu_id ? (
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
