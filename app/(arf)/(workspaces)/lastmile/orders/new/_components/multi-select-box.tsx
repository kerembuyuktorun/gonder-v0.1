'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Props = {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyLabel?: string
  invalid?: boolean
}

export function MultiSelectBox({
  options,
  value,
  onChange,
  placeholder = 'Seçim yapın',
  searchPlaceholder = 'Ara…',
  emptyLabel = 'Seçenek bulunamadı',
  invalid,
}: Props) {
  const [open, setOpen] = useState(false)

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option))
      return
    }
    onChange([...value, option])
  }

  const remove = (option: string) => {
    onChange(value.filter((item) => item !== option))
  }

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            className={cn(
              'h-10 w-full justify-between rounded-lg px-3 font-normal',
              value.length === 0 && 'text-muted-foreground',
              invalid && 'border-rose-300 focus-visible:ring-rose-200'
            )}
          >
            <span className='truncate'>
              {value.length === 0
                ? placeholder
                : value.length === 1
                  ? value[0]
                  : `${value.length} seçim`}
            </span>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[var(--radix-popover-trigger-width)] rounded-xl p-0' align='start'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const selected = value.includes(option)
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => toggle(option)}
                      className='cursor-pointer'
                    >
                      <span
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded border',
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {selected ? <Check className='size-3' /> : null}
                      </span>
                      {option}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className='flex flex-wrap gap-1.5'>
          {value.map((item) => (
            <span
              key={item}
              className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700'
            >
              {item}
              <button
                type='button'
                className='rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                aria-label={`${item} seçimini kaldır`}
                onClick={() => remove(item)}
              >
                <X className='size-3' />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
