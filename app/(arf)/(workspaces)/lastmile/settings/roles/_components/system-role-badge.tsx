'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RoleType } from '../_types/role'
import { ROLE_TYPE_LABELS } from '../_types/role'

const TYPE_CLASS: Record<RoleType, string> = {
  system: 'border-violet-200 bg-violet-50 text-violet-700',
  custom: 'border-slate-200 bg-white text-slate-600',
}

type Props = {
  roleType: RoleType
  className?: string
}

export function SystemRoleBadge({ roleType, className }: Props) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded-md px-2 py-0.5 text-xs font-medium shadow-none',
        TYPE_CLASS[roleType],
        className
      )}
    >
      {roleType === 'system' ? 'Sistem Rolü' : `${ROLE_TYPE_LABELS[roleType]} Rol`}
    </Badge>
  )
}
