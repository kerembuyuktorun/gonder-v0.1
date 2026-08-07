'use client'

import { Info } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const buttonClass =
    'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300'

  return (
    <div
      className={cn(
        'flex min-h-16 items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
        checked ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'
      )}
    >
      <div className='flex min-w-0 items-center gap-1.5'>
        <p className='text-sm font-medium text-slate-900'>{label}</p>
        <div className='hidden sm:block'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type='button' className={buttonClass} aria-label={`${label} hakkında bilgi`}>
                <Info className='size-3.5' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={6} className='max-w-xs text-left leading-relaxed'>
              {description}
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
              {description}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
