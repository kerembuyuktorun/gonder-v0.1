'use client'

import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  icon: ElementType
  selected?: boolean
  onClick: () => void
  className?: string
  /** Horizontal compact tile (icon + title inline) */
  compact?: boolean
}

export function SelectionTile({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
  className,
  compact = false,
}: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border bg-card text-left transition-colors',
        compact
          ? 'flex flex-row items-center gap-2.5 px-3 py-2.5'
          : 'flex flex-col items-start gap-2 p-3',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-foreground/30 hover:bg-muted/30',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          compact ? 'size-7' : 'size-8',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className={compact ? 'size-3.5' : 'size-4'} />
      </div>
      <div className='min-w-0'>
        <p className={cn('font-semibold leading-tight', compact ? 'text-sm' : 'text-sm')}>
          {title}
        </p>
        {!compact && description ? (
          <p className='mt-0.5 text-[11px] leading-snug text-muted-foreground'>{description}</p>
        ) : null}
      </div>
    </button>
  )
}
