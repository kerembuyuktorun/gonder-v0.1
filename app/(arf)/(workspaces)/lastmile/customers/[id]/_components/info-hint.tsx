'use client'

import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  label: string
  content: string
}

export function InfoHint({ label, content }: Props) {
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
          <TooltipContent
            side='top'
            sideOffset={6}
            className='max-w-sm text-left text-xs leading-relaxed'
          >
            {content}
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
            {content}
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
