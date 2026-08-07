'use client'

import { useState } from 'react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  invalid?: boolean
}

export function ShipmentDateField({ label, value, onChange, invalid }: Props) {
  const [open, setOpen] = useState(false)

  const parsedDate = (() => {
    if (!value) return undefined
    try {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      return Number.isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  })()

  return (
    <div className='space-y-1.5'>
      <label className='text-sm font-medium'>{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm',
              !parsedDate && 'text-muted-foreground',
              invalid && 'border-destructive'
            )}
          >
            <span>
              {parsedDate
                ? format(parsedDate, 'd MMMM yyyy', { locale: tr })
                : 'Gönderi tarihi seçin'}
            </span>
            <CalendarDays className='size-4 text-muted-foreground' />
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-auto rounded-2xl p-0' align='start'>
          <Calendar
            mode='single'
            selected={parsedDate}
            onSelect={(date) => {
              onChange(date ? format(date, 'yyyy-MM-dd') : null)
              setOpen(false)
            }}
            locale={tr}
            disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
