'use client'

import type { LucideIcon } from 'lucide-react'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function FormSection({
  title,
  description,
  children,
  className,
  icon: Icon,
  step,
  id,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  icon?: LucideIcon
  step?: string
  id?: string
}) {
  return (
    <Card
      id={id}
      className={cn(
        'scroll-mt-24 overflow-hidden border-slate-200/80 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardHeader className='border-b border-slate-100 bg-slate-50/50 pb-4'>
        <div className='flex items-start gap-3'>
          {Icon ? (
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs'>
              <Icon className='size-4 text-slate-700' />
            </div>
          ) : null}
          <div className='min-w-0 space-y-1'>
            {step ? (
              <p className='text-[11px] font-semibold tracking-wider text-muted-foreground uppercase'>
                {step}
              </p>
            ) : null}
            <CardTitle className='text-base font-semibold tracking-tight'>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-5 pt-5'>{children}</CardContent>
    </Card>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className='flex h-5 items-center gap-1.5'>
        <Label
          htmlFor={htmlFor}
          className={cn('text-sm font-medium leading-none', error ? 'text-rose-700' : 'text-slate-800')}
        >
          {label}
        </Label>
        {hint ? <FieldHint label={label} hint={hint} /> : null}
      </div>
      {children}
      {error ? (
        <p className='text-xs font-medium text-rose-600' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function FieldHint({ label, hint }: { label: string; hint: string }) {
  const buttonClass =
    'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300'

  return (
    <>
      <div className='hidden sm:block'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type='button' className={buttonClass} aria-label={`${label} hakkında bilgi`}>
              <Info className='size-3.5' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='top' sideOffset={6} className='max-w-xs text-left leading-relaxed'>
            {hint}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='sm:hidden'>
        <Popover>
          <PopoverTrigger asChild>
            <button type='button' className={buttonClass} aria-label={`${label} hakkında bilgi`}>
              <Info className='size-3.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side='top'
            align='start'
            className='max-w-xs rounded-xl px-3 py-2 text-xs leading-relaxed text-slate-700'
          >
            {hint}
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
