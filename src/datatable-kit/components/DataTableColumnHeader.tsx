'use client'

/**
 * DataTableColumnHeader - Sortable Column Header
 *
 * Sıralanabilir kolon başlığı (asc → desc → none)
 * Multi-sort desteği (shift+click)
 * Kolon bazlı arama desteği (mercek ikonu)
 */

import React from 'react'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DataTableColumnHeaderProps } from '../types'

function DataTableColumnHeaderComponent<TData>({
  column,
  title,
  className,
  enableSearch = true,
}: DataTableColumnHeaderProps<TData>) {
  const [showSearch, setShowSearch] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  if (!column.getCanSort()) {
    return <div className={cn('whitespace-nowrap font-medium', className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    column.setFilterValue(value || undefined)
  }

  const handleClearSearch = () => {
    setSearchValue('')
    column.setFilterValue(undefined)
    setShowSearch(false)
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className='flex items-center gap-1 whitespace-nowrap'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent'
            >
              <span className='whitespace-nowrap'>{title}</span>
              {sorted === 'desc' ? (
                <ArrowDownIcon className='ml-2 h-4 w-4 shrink-0' />
              ) : sorted === 'asc' ? (
                <ArrowUpIcon className='ml-2 h-4 w-4 shrink-0' />
              ) : (
                <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start'>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Artan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Azalan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <ChevronsUpDownIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Sıralamayı temizle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {enableSearch && (
          <Button
            variant='ghost'
            size='sm'
            className={cn('h-6 w-6 shrink-0 p-0', showSearch && 'bg-accent text-accent-foreground')}
            onClick={() => {
              if (showSearch) {
                handleClearSearch()
              } else {
                setShowSearch(true)
              }
            }}
          >
            <SearchIcon className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>

      {enableSearch && showSearch && (
        <div className='relative'>
          <Input
            autoFocus
            placeholder={`${title} ara...`}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
            className='h-7 pr-6 text-xs'
          />
          {searchValue && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const DataTableColumnHeader = React.memo(DataTableColumnHeaderComponent) as typeof DataTableColumnHeaderComponent
