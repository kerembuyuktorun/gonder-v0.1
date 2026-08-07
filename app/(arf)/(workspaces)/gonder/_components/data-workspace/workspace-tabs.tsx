'use client'

import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

export type WorkspaceTab<T extends string> = {
  id: T
  label: string
  count?: number
  icon?: ComponentType<{ className?: string }>
}

type Props<T extends string> = {
  tabs: Array<WorkspaceTab<T>>
  value: T
  onChange: (value: T) => void
}

/**
 * Horizontal-scroll tab strip so dual rows (operasyon + durum) and long TR labels
 * stay usable at 375px without wrapping into a tall, hard-to-scan stack.
 */
export function WorkspaceTabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className='-mx-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex w-max min-w-full flex-nowrap gap-0.5 border-b px-1' role='tablist'>
        {tabs.map((tab) => {
          const active = tab.id === value
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors sm:gap-2 sm:px-3 sm:py-2.5',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {Icon ? <Icon className='size-3.5 shrink-0' /> : null}
              <span className='max-w-[11rem] truncate sm:max-w-none'>{tab.label}</span>
              {typeof tab.count === 'number' ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                    active ? 'bg-primary/15 text-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
