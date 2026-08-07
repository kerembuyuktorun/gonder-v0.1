'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RoleStatus } from '../_types/role'
import { ROLE_STATUS_LABELS } from '../_types/role'

const STATUS_CLASS: Record<RoleStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  passive: 'border-slate-200 bg-slate-100 text-slate-600',
}

type Props = {
  status: RoleStatus
  className?: string
}

export function RoleStatusBadge({ status, className }: Props) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded-md px-2 py-0.5 text-xs font-medium shadow-none',
        STATUS_CLASS[status],
        className
      )}
    >
      {ROLE_STATUS_LABELS[status]}
    </Badge>
  )
}
