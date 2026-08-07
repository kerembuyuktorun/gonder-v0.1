'use client'

import type { ComponentType, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type RowQuickAction = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'success' | 'danger' | 'warning'
}

const toneClass: Record<NonNullable<RowQuickAction['tone']>, string> = {
  default: '',
  success: 'text-emerald-700 hover:text-emerald-800',
  danger: 'text-rose-700 hover:text-rose-800',
  warning: 'text-amber-700 hover:text-amber-800',
}

type Props = {
  actions: RowQuickAction[]
  trailing?: ReactNode
}

export function RowQuickActions({ actions, trailing }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex justify-end gap-0.5'>
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className={cn('size-8', toneClass[action.tone ?? 'default'])}
                  disabled={action.disabled}
                  aria-label={action.label}
                  onClick={action.onClick}
                >
                  <Icon className='size-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          )
        })}
        {trailing}
      </div>
    </TooltipProvider>
  )
}
