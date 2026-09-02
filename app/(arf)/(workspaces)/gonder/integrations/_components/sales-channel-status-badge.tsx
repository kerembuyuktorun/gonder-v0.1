'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  SALES_CHANNEL_STATUS_LABELS,
  type SalesChannelStatus,
} from '../../_types/sales-channels'

const STATUS_CLASS: Record<SalesChannelStatus, string> = {
  connected: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  disconnected: 'border-slate-500/20 bg-slate-500/10 text-slate-600',
  error: 'border-amber-500/25 bg-amber-500/10 text-amber-700',
}

type Props = {
  status: SalesChannelStatus
  className?: string
}

export function SalesChannelStatusBadge({ status, className }: Props) {
  return (
    <Badge variant='outline' className={cn('font-medium', STATUS_CLASS[status], className)}>
      {SALES_CHANNEL_STATUS_LABELS[status]}
    </Badge>
  )
}
