'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  selectedCount: number
  onClear: () => void
  children: ReactNode
}

export function BulkActionBar({ selectedCount, onClear, children }: Props) {
  if (selectedCount <= 0) return null

  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-muted/30 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center'>
      <div className='flex min-w-0 items-center gap-2'>
        <p className='truncate text-sm font-medium'>{selectedCount} seçili</p>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8 shrink-0'
          onClick={onClear}
          aria-label='Seçimi temizle'
        >
          <X className='size-4' />
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-1.5 sm:ml-auto'>{children}</div>
    </div>
  )
}
