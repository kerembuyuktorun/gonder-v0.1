'use client'

import type { ReactNode } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  activeFilterCount?: number
  onClearFilters?: () => void
  /** Aktif filtre chip / özet satırı */
  filterSummary?: ReactNode
  onOpenFilters?: () => void
  trailing?: ReactNode
}

export function WorkspaceListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Ara…',
  activeFilterCount = 0,
  onClearFilters,
  filterSummary,
  onOpenFilters,
  trailing,
}: Props) {
  return (
    <div className='space-y-2'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <div className='relative min-w-0 flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className='h-9 pl-9'
          />
        </div>
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

      {activeFilterCount > 0 || filterSummary ? (
        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          {filterSummary}
          {activeFilterCount > 0 ? (
            <>
              <Badge variant='secondary' className='gap-1 font-normal'>
                {activeFilterCount} filtre uygulanıyor
              </Badge>
              {onClearFilters ? (
                <button
                  type='button'
                  onClick={onClearFilters}
                  className='inline-flex items-center gap-1 text-foreground hover:underline'
                >
                  <X className='size-3' />
                  Filtreleri temizle
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
