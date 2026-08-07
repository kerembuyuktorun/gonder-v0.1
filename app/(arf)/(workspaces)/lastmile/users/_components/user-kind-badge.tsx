'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserKind } from '../_types/user'
import { USER_KIND_LABELS } from '../_lib/query-users'

const KIND_CLASS: Record<UserKind, string> = {
  ic_ekip: 'border-sky-200 bg-sky-50 text-sky-800',
  musteri: 'border-orange-200 bg-orange-50 text-orange-800',
}

type Props = {
  kind: UserKind
  className?: string
}

export function UserKindBadge({ kind, className }: Props) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded-md px-2 py-0.5 text-xs font-medium shadow-none',
        KIND_CLASS[kind],
        className
      )}
    >
      {USER_KIND_LABELS[kind]}
    </Badge>
  )
}
