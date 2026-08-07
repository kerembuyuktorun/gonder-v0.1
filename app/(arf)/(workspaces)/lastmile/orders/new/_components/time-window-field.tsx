'use client'

import { useMemo, useState } from 'react'
import { format, parse, isValid, startOfMonth } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CalendarDays, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Field } from './form-section'

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))
const MAX_WINDOW_MINUTES = 4 * 60

function normalizeMinute(minute: string): string {
  const numeric = Number(minute)
  if (Number.isNaN(numeric)) return '00'
  const snapped = Math.round(numeric / 5) * 5
  return String(Math.min(55, snapped)).padStart(2, '0')
}

function timeToMinutes(value: string): number | undefined {
  if (!value) return undefined
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(normalizeMinute(minuteText ?? '00'))
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return undefined
  return hour * 60 + minute
}

function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 55, totalMinutes))
  const hour = Math.floor(clamped / 60)
  const minute = Math.floor((clamped % 60) / 5) * 5
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function clampEndToMaxWindow(start: string, end: string): string {
  const startMinutes = timeToMinutes(start)
  if (startMinutes === undefined) return end
  const maxEnd = Math.min(startMinutes + MAX_WINDOW_MINUTES, 23 * 60 + 55)
  const endMinutes = timeToMinutes(end)
  if (endMinutes === undefined || endMinutes <= startMinutes || endMinutes > maxEnd) {
    return minutesToTime(Math.min(startMinutes + 60, maxEnd))
  }
  return end
}

type Props = {
  label: string
  required?: boolean
  hint?: string
  error?: string
  date: string
  start: string
  end: string
  onDateChange: (value: string) => void
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  dateId: string
  startId: string
  endId: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  /** Same-day schedule: only show start/end times (date managed separately). */
  hideDate?: boolean
  /** Denser start/end controls for side-by-side schedule rows. */
  compact?: boolean
}

function parseStoredDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : undefined
}

function formatStoredDate(value: string): string {
  const parsed = parseStoredDate(value)
  return parsed ? format(parsed, 'd MMMM yyyy', { locale: tr }) : 'Tarih seçin'
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index),
  label: format(new Date(2024, index, 1), 'LLLL', { locale: tr }),
}))

const CALENDAR_MIN_YEAR = 2026

function resolveCalendarBounds(minDate?: Date, maxDate?: Date) {
  const floor = startOfMonth(new Date(CALENDAR_MIN_YEAR, 0, 1))
  const endYear = Math.max(new Date().getFullYear(), CALENDAR_MIN_YEAR) + 30
  const ceiling = startOfMonth(maxDate ?? new Date(endYear, 11, 1))

  let start = floor
  if (minDate) {
    const min = startOfMonth(minDate)
    start = min > floor ? min : floor
  }

  let end = ceiling
  if (maxDate) {
    const max = startOfMonth(maxDate)
    end = max < start ? start : max
  }

  return { start, end }
}

function clampCalendarMonth(date: Date, start: Date, end: Date) {
  const normalized = startOfMonth(date)
  if (normalized < start) return start
  if (normalized > end) return end
  return normalized
}

function CalendarMonthYearNav({
  month,
  minDate,
  maxDate,
  onMonthChange,
}: {
  month: Date
  minDate?: Date
  maxDate?: Date
  onMonthChange: (month: Date) => void
}) {
  const bounds = useMemo(() => resolveCalendarBounds(minDate, maxDate), [minDate, maxDate])
  const currentYear = month.getFullYear()
  const currentMonth = month.getMonth()

  const years = useMemo(() => {
    const items: number[] = []
    for (let year = bounds.end.getFullYear(); year >= bounds.start.getFullYear(); year -= 1) {
      items.push(year)
    }
    return items
  }, [bounds.end, bounds.start])

  const availableMonths = useMemo(() => {
    return MONTH_OPTIONS.filter(({ value }) => {
      const monthIndex = Number(value)
      const candidate = startOfMonth(new Date(currentYear, monthIndex, 1))
      return candidate >= bounds.start && candidate <= bounds.end
    })
  }, [bounds.end, bounds.start, currentYear])

  const monthValue = availableMonths.some((option) => Number(option.value) === currentMonth)
    ? String(currentMonth)
    : availableMonths[0]?.value ?? String(currentMonth)

  return (
    <div className='flex items-center gap-2 border-b border-slate-100 px-3 py-2.5'>
      <Select
        value={monthValue}
        onValueChange={(value) => {
          onMonthChange(
            clampCalendarMonth(new Date(currentYear, Number(value), 1), bounds.start, bounds.end)
          )
        }}
      >
        <SelectTrigger className='h-9 min-w-0 flex-1 rounded-lg text-sm'>
          <SelectValue placeholder='Ay' />
        </SelectTrigger>
        <SelectContent className='z-1100 max-h-60'>
          {availableMonths.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(currentYear)}
        onValueChange={(value) => {
          onMonthChange(
            clampCalendarMonth(new Date(Number(value), currentMonth, 1), bounds.start, bounds.end)
          )
        }}
      >
        <SelectTrigger className='h-9 w-[5.75rem] shrink-0 rounded-lg px-2.5 text-sm'>
          <SelectValue placeholder='Yıl' />
        </SelectTrigger>
        <SelectContent className='z-1100 max-h-60'>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function TimeWindowField({
  label,
  required,
  hint,
  error,
  date,
  start,
  end,
  onDateChange,
  onStartChange,
  onEndChange,
  dateId,
  startId,
  endId,
  minDate,
  maxDate,
  disabled = false,
  hideDate = false,
  compact = false,
}: Props) {
  const handleStartChange = (value: string) => {
    onStartChange(value)
    onEndChange(clampEndToMaxWindow(value, end))
  }

  const endBounds = useMemo(() => {
    const startMinutes = timeToMinutes(start)
    if (startMinutes === undefined) return undefined
    return {
      minMinutes: startMinutes + 5,
      maxMinutes: Math.min(startMinutes + MAX_WINDOW_MINUTES, 23 * 60 + 55),
    }
  }, [start])

  const dense = hideDate && compact

  return (
    <Field
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={hideDate ? startId : dateId}
      className={dense ? 'min-w-0' : undefined}
    >
      {dense ? (
        <div className={cn('flex min-w-0 items-center gap-1.5', disabled && 'opacity-60')}>
          <TimePickerButton
            id={startId}
            value={start}
            placeholder='Başlangıç'
            invalid={Boolean(error)}
            disabled={disabled}
            compact
            onChange={handleStartChange}
          />
          <span className='shrink-0 text-sm text-slate-400' aria-hidden>
            –
          </span>
          <TimePickerButton
            id={endId}
            value={end}
            placeholder='Bitiş'
            invalid={Boolean(error)}
            disabled={disabled}
            compact
            minMinutes={endBounds?.minMinutes}
            maxMinutes={endBounds?.maxMinutes}
            onChange={onEndChange}
          />
        </div>
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 gap-2',
            hideDate ? 'sm:grid-cols-2' : 'sm:grid-cols-[1.3fr_0.85fr_0.85fr]',
            disabled && 'opacity-60'
          )}
        >
          {hideDate ? null : (
            <div className='space-y-1'>
              <span className='text-[11px] font-medium text-muted-foreground'>Tarih</span>
              <DatePickerButton
                id={dateId}
                value={date}
                invalid={Boolean(error)}
                minDate={minDate}
                maxDate={maxDate}
                disabled={disabled}
                onChange={onDateChange}
              />
            </div>
          )}
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground'>Başlangıç</span>
            <TimePickerButton
              id={startId}
              value={start}
              invalid={Boolean(error)}
              disabled={disabled}
              onChange={handleStartChange}
            />
          </div>
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground'>Bitiş</span>
            <TimePickerButton
              id={endId}
              value={end}
              invalid={Boolean(error)}
              disabled={disabled}
              minMinutes={endBounds?.minMinutes}
              maxMinutes={endBounds?.maxMinutes}
              onChange={onEndChange}
            />
          </div>
        </div>
      )}
    </Field>
  )
}

export function DatePickerButton({
  id,
  value,
  invalid,
  minDate,
  maxDate,
  disabled,
  onChange,
  className,
}: {
  id: string
  value: string
  invalid?: boolean
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  onChange: (value: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseStoredDate(value), [value])
  const initialMonth = selected ?? minDate ?? new Date()
  const [month, setMonth] = useState<Date>(initialMonth)

  const disabledMatchers = useMemo(() => {
    const matchers = []
    if (minDate) matchers.push({ before: minDate })
    if (maxDate) matchers.push({ after: maxDate })
    return matchers
  }, [minDate, maxDate])

  const calendarBounds = useMemo(() => resolveCalendarBounds(minDate, maxDate), [minDate, maxDate])

  const syncMonth = (candidate: Date) =>
    clampCalendarMonth(candidate, calendarBounds.start, calendarBounds.end)

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (disabled) return
        setOpen(next)
        if (next) setMonth(syncMonth(selected ?? minDate ?? new Date()))
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'h-10 w-full justify-between rounded-lg px-3 font-normal',
            !selected && 'text-muted-foreground',
            invalid && 'border-rose-300 focus-visible:ring-rose-200',
            className
          )}
        >
          <span className='truncate'>{formatStoredDate(value)}</span>
          <CalendarDays className='size-4 shrink-0 text-slate-400' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[min(100vw-2rem,18.5rem)] rounded-2xl p-0' align='start'>
        <CalendarMonthYearNav
          month={month}
          minDate={minDate}
          maxDate={maxDate}
          onMonthChange={setMonth}
        />
        <div className='px-3 pb-3'>
          <Calendar
            mode='single'
            hideNavigation
            month={month}
            onMonthChange={(next) => setMonth(syncMonth(next))}
            selected={selected}
            onSelect={(next) => {
              if (next) onChange(format(next, 'yyyy-MM-dd'))
              setOpen(false)
            }}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            startMonth={calendarBounds.start}
            endMonth={calendarBounds.end}
            locale={tr}
            showOutsideDays
            initialFocus
            className='w-full p-0 [--cell-size:calc(100%/7)]'
            classNames={{
              root: 'w-full',
              months: 'w-full',
              month: 'w-full gap-2',
              month_grid: 'w-full',
              month_caption: 'hidden',
              nav: 'hidden',
              weekdays: 'flex w-full',
              weekday: 'flex-1 text-center text-[0.8rem]',
              week: 'mt-2 flex w-full',
              day: 'relative flex-1 p-0 text-center aspect-square select-none',
              day_button: 'size-full min-w-0 aspect-square w-full',
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TimePickerButton({
  id,
  value,
  placeholder = 'Saat seçin',
  invalid,
  disabled,
  compact = false,
  minMinutes,
  maxMinutes,
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
  compact?: boolean
  minMinutes?: number
  maxMinutes?: number
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [hour = '09', minute = '00'] = value ? value.split(':') : ['09', '00']
  const selectedMinute = normalizeMinute(minute)

  const availableHours = useMemo(() => {
    if (minMinutes === undefined && maxMinutes === undefined) return HOURS
    return HOURS.filter((option) => {
      const hourValue = Number(option)
      const hourStart = hourValue * 60
      const hourEnd = hourStart + 55
      if (minMinutes !== undefined && hourEnd < minMinutes) return false
      if (maxMinutes !== undefined && hourStart > maxMinutes) return false
      return true
    })
  }, [minMinutes, maxMinutes])

  const availableMinutes = useMemo(() => {
    const hourValue = Number(hour)
    if (!Number.isInteger(hourValue)) return MINUTES
    return MINUTES.filter((option) => {
      const total = hourValue * 60 + Number(option)
      if (minMinutes !== undefined && total < minMinutes) return false
      if (maxMinutes !== undefined && total > maxMinutes) return false
      return true
    })
  }, [hour, minMinutes, maxMinutes])

  const setTime = (nextHour: string, nextMinute: string) => {
    let next = `${nextHour}:${normalizeMinute(nextMinute)}`
    const total = timeToMinutes(next)
    if (total !== undefined) {
      if (minMinutes !== undefined && total < minMinutes) next = minutesToTime(minMinutes)
      if (maxMinutes !== undefined && total > maxMinutes) next = minutesToTime(maxMinutes)
    }
    onChange(next)
  }

  return (
    <Popover open={disabled ? false : open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'h-10 min-w-0 flex-1 justify-between rounded-lg font-normal',
            compact ? 'px-2.5 text-sm' : 'px-3',
            !value && 'text-muted-foreground',
            invalid && 'border-rose-300 focus-visible:ring-rose-200'
          )}
        >
          <span className='truncate'>{value || placeholder}</span>
          <Clock3 className={cn('shrink-0 text-slate-400', compact ? 'size-3.5' : 'size-4')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[220px] rounded-2xl p-3' align='start'>
        <div className='mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground'>
          <span>Saat</span>
          <span>Dakika</span>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <ScrollArea className='h-48 rounded-xl border border-slate-200'>
            <div className='space-y-1 p-1.5'>
              {availableHours.map((option) => (
                <button
                  key={option}
                  type='button'
                  onClick={() => setTime(option, selectedMinute)}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors',
                    hour === option
                      ? 'bg-slate-900 font-semibold text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className='h-48 rounded-xl border border-slate-200'>
            <div className='space-y-1 p-1.5'>
              {availableMinutes.map((option) => (
                <button
                  key={option}
                  type='button'
                  onClick={() => {
                    setTime(hour, option)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors',
                    selectedMinute === option
                      ? 'bg-slate-900 font-semibold text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
