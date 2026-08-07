'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type AssignmentSearchOption = {
  id: string
  label: string
  searchText?: string
  disabled?: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string | null
  placeholder: string
  searchPlaceholder: string
  noneLabel?: string
  options: AssignmentSearchOption[]
  onSelect: (id: string | null) => void
  triggerClassName?: string
}

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('tr-TR').replace(/\s+/g, '')
}

export function AssignmentSearchPicker({
  open,
  onOpenChange,
  value,
  placeholder,
  searchPlaceholder,
  noneLabel = 'Atanmamış',
  options,
  onSelect,
  triggerClassName,
}: Props) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const selectedLabel =
    value === null
      ? noneLabel
      : options.find((option) => option.id === value)?.label ?? placeholder

  const filteredOptions = useMemo(() => {
    const query = normalizeSearch(search.trim())
    if (!query) return options

    return options.filter((option) => {
      const haystack = normalizeSearch(option.searchText ?? option.label)
      return haystack.includes(query)
    })
  }, [options, search])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'border-input bg-background ring-offset-background focus:ring-ring flex h-8 min-w-[11rem] items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none',
            triggerClassName
          )}
        >
          <span className='truncate'>{selectedLabel}</span>
          <ChevronDown className='size-4 shrink-0 opacity-50' />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[var(--radix-popover-trigger-width)] min-w-[14rem] p-0'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className='h-9'
          />
          <CommandList className='max-h-60'>
            <CommandEmpty>Sonuç bulunamadı</CommandEmpty>
            <CommandItem
              value={noneLabel}
              onSelect={() => {
                onSelect(null)
                onOpenChange(false)
              }}
              className='gap-2'
            >
              <Check
                className={cn('size-4 shrink-0', value !== null && 'opacity-0')}
              />
              {noneLabel}
            </CommandItem>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.id}
                value={option.label}
                disabled={option.disabled}
                onSelect={() => {
                  if (option.disabled) return
                  onSelect(option.id)
                  onOpenChange(false)
                }}
                className={cn('gap-2', option.disabled && 'opacity-50')}
              >
                <Check
                  className={cn(
                    'size-4 shrink-0',
                    value !== option.id && 'opacity-0'
                  )}
                />
                <span className='truncate'>{option.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
