'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserAccessStatus } from '../_types/user'
import { USER_STATUS_LABELS } from '../_lib/query-users'

const STATUS_CLASS: Record<UserAccessStatus, string> = {
  aktif: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pasif: 'border-rose-200 bg-rose-50 text-rose-700',
  davet: 'border-amber-200 bg-amber-50 text-amber-800',
  askida: 'border-orange-200 bg-orange-50 text-orange-800',
}

type Props = {
  status: UserAccessStatus
  className?: string
}

export function UserStatusBadge({ status, className }: Props) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded-md px-2 py-0.5 text-xs font-medium shadow-none',
        STATUS_CLASS[status],
        className
      )}
    >
      {USER_STATUS_LABELS[status]}
    </Badge>
  )
}
