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
    <div className='flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2'>
      <p className='text-sm font-medium'>{selectedCount} seçili</p>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8'
        onClick={onClear}
        aria-label='Seçimi temizle'
      >
        <X className='size-4' />
      </Button>
      <div className='ml-auto flex flex-wrap items-center gap-1.5'>{children}</div>
    </div>
  )
}
