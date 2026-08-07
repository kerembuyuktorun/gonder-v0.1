'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export type ActiveFilterChip = {
  id: string
  label: string
  onRemove: () => void
}

type Props = {
  chips: ActiveFilterChip[]
  onClearAll?: () => void
}

export function ActiveFilterChips({ chips, onClearAll }: Props) {
  if (chips.length === 0) return null

  return (
    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
      {chips.map((chip) => (
        <Badge key={chip.id} variant='secondary' className='gap-1 font-normal'>
          {chip.label}
          <button
            type='button'
            onClick={chip.onRemove}
            className='rounded-sm hover:bg-foreground/10'
            aria-label={`${chip.label} filtresini kaldır`}
          >
            <X className='size-3' />
          </button>
        </Badge>
      ))}
      {onClearAll ? (
        <button
          type='button'
          onClick={onClearAll}
          className='inline-flex items-center gap-1 text-foreground hover:underline'
        >
          Filtreleri temizle
        </button>
      ) : null}
    </div>
  )
}
