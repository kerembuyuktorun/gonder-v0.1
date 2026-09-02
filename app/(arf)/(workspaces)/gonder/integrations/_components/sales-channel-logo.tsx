'use client'

import { cn } from '@/lib/utils'
import type { SalesChannelCatalogItem } from '../../_types/sales-channels'

type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'size-8 rounded-md text-[10px]',
  md: 'size-10 rounded-lg text-xs',
  lg: 'size-12 rounded-xl text-sm',
}

type Props = {
  channel: SalesChannelCatalogItem
  size?: Size
  className?: string
}

export function SalesChannelLogo({ channel, size = 'md', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold',
        channel.accentClass,
        SIZE_CLASS[size],
        className
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={channel.logoSrc} alt='' className='size-full object-cover' />
    </span>
  )
}
