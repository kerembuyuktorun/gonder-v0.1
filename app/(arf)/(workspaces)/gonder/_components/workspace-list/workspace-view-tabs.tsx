'use client'

import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type WorkspaceViewTab<T extends string> = {
  id: T
  label: string
  count?: number
  icon?: ComponentType<{ className?: string }>
}

type Props<T extends string> = {
  tabs: Array<WorkspaceViewTab<T>>
  value: T
  onChange: (value: T) => void
}

export function WorkspaceViewTabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className='flex flex-wrap gap-1 border-b'>
      {tabs.map((tab) => {
        const active = tab.id === value
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon ? <Icon className='size-3.5' /> : null}
            <span>{tab.label}</span>
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
  )
}

type HeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function WorkspaceListHeader({ title, description, actions }: HeaderProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0'>
        <h1 className='text-xl font-semibold tracking-tight'>{title}</h1>
        {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
      </div>
      {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
    </div>
  )
}
