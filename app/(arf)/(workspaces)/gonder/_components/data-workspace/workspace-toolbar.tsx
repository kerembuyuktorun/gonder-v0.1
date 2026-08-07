'use client'

import type { ReactNode } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from './search-input'
import { ActiveFilterChips, type ActiveFilterChip } from './active-filter-chips'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  chips?: ActiveFilterChip[]
  onClearFilters?: () => void
  trailing?: ReactNode
  onOpenFilters?: () => void
}

export function WorkspaceToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  chips = [],
  onClearFilters,
  trailing,
  onOpenFilters,
}: Props) {
  return (
    <div className='space-y-2'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        <div className='flex shrink-0 flex-wrap items-center gap-1.5'>
          {onOpenFilters ? (
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='size-9 shrink-0'
              aria-label='Filtreler'
              onClick={onOpenFilters}
            >
              <Filter className='size-4' />
            </Button>
          ) : null}
          {trailing}
        </div>
      </div>
      <ActiveFilterChips chips={chips} onClearAll={onClearFilters} />
    </div>
  )
}
