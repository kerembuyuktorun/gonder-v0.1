'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChannelAvatar } from '../../_components/channel-logo'
import { getOrderChannelById } from '../../_data/order-channels'
import {
  ORDER_CHANNEL_LABELS,
  type OrderChannelType,
} from '../../_types/orders'

const CHIP_TYPES = Object.keys(ORDER_CHANNEL_LABELS) as OrderChannelType[]

type Props = {
  selectedTypes: OrderChannelType[]
  selectedChannelId: string | null
  channelCounts?: Record<string, number>
  onSelectType: (type: OrderChannelType | null) => void
}

/**
 * Compact quick-filter strip for integration channels.
 * Reuses existing `channel` / `channelId` URL state — not a second filter system.
 */
export function OrdersChannelChipStrip({
  selectedTypes,
  selectedChannelId,
  channelCounts = {},
  onSelectType,
}: Props) {
  const connectionType = useMemo(() => {
    if (!selectedChannelId) return null
    return getOrderChannelById(selectedChannelId)?.type ?? null
  }, [selectedChannelId])

  return (
    <div
      className='flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      role='list'
      aria-label='Kanal hızlı filtre'
    >
      {CHIP_TYPES.map((type) => {
        const isActive =
          (!selectedChannelId && selectedTypes.length === 1 && selectedTypes[0] === type) ||
          connectionType === type
        const count = channelCounts[type] ?? 0

        return (
          <button
            key={type}
            type='button'
            role='listitem'
            aria-pressed={isActive}
            onClick={() => onSelectType(isActive ? null : type)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors',
              isActive
                ? 'border-primary/40 bg-primary/5 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <ChannelAvatar type={type} size='xs' className='rounded-full' />
            <span className='font-medium text-foreground/90'>{ORDER_CHANNEL_LABELS[type]}</span>
            <span className='tabular-nums text-muted-foreground'>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
