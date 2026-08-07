'use client'

import { AlertTriangle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatDocWarningText } from '../_lib/query-couriers'
import type { CourierDocWarning } from '../_types/courier'

type Props = {
  warnings: CourierDocWarning[]
  /** `icon` — tablo/kompakt; `text` — detay header gibi doğrudan metin */
  variant?: 'icon' | 'text'
}

function severityClass(daysRemaining: number) {
  if (daysRemaining < 0) return 'border-rose-200 bg-rose-50 text-rose-700'
  if (daysRemaining <= 7) return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

function severityTextClass(daysRemaining: number) {
  if (daysRemaining < 0) return 'text-rose-700'
  if (daysRemaining <= 7) return 'text-amber-800'
  return 'text-slate-600'
}

function WarningBody({ warnings }: { warnings: CourierDocWarning[] }) {
  return (
    <ul className='space-y-1.5'>
      {warnings.map((warning) => (
        <li key={`${warning.kind}-${warning.daysRemaining}`} className='text-xs leading-relaxed'>
          {formatDocWarningText(warning.daysRemaining, warning.label)}
        </li>
      ))}
    </ul>
  )
}

export function CourierDocWarnings({ warnings, variant = 'icon' }: Props) {
  if (warnings.length === 0) {
    return <span className='text-sm text-muted-foreground'>—</span>
  }

  if (variant === 'text') {
    return (
      <div className='space-y-0.5'>
        {warnings.map((warning) => (
          <p
            key={`${warning.kind}-${warning.daysRemaining}`}
            className={cn(
              'text-sm font-semibold leading-snug',
              severityTextClass(warning.daysRemaining)
            )}
          >
            {formatDocWarningText(warning.daysRemaining, warning.label)}
          </p>
        ))}
      </div>
    )
  }

  const worst = warnings.reduce((prev, next) =>
    next.daysRemaining < prev.daysRemaining ? next : prev
  )
  const summary = formatDocWarningText(worst.daysRemaining, worst.label)
  const tone = severityClass(worst.daysRemaining)

  const trigger = (
    <button
      type='button'
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border transition-colors',
        tone
      )}
      aria-label={
        warnings.length > 1
          ? `${summary} ve ${warnings.length - 1} uyarı daha`
          : summary
      }
    >
      <AlertTriangle className='size-3.5 shrink-0' />
      {warnings.length > 1 ? (
        <span className='sr-only'>+{warnings.length - 1}</span>
      ) : null}
    </button>
  )

  return (
    <>
      <div className='hidden sm:block'>
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side='top' sideOffset={6} className='max-w-xs text-left'>
            <WarningBody warnings={warnings} />
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='sm:hidden'>
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align='start' className='w-64 p-3'>
            <p className='mb-2 text-xs font-semibold text-slate-700'>Uyarılar</p>
            <WarningBody warnings={warnings} />
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
