'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { defaultAnalyticsRange } from '../../_data/reports-analytics-repository'
import type { AnalyticsQuery, ReportPeriodPreset } from '../../_types/reports'

const PRESETS: Array<{ id: ReportPeriodPreset; label: string }> = [
  { id: '7d', label: '7 gün' },
  { id: '30d', label: '30 gün' },
  { id: '90d', label: '90 gün' },
]

function resolvePreset(raw: string | null): ReportPeriodPreset {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === 'custom') return raw
  return '30d'
}

export function useReportDateRangeQuery(): {
  query: AnalyticsQuery
  preset: ReportPeriodPreset
  setPreset: (preset: ReportPeriodPreset) => void
  setRange: (range: DateRange | undefined) => void
  dateRange: DateRange
} {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const preset = resolvePreset(searchParams.get('preset'))
  const defaults = defaultAnalyticsRange(preset === 'custom' ? '30d' : preset)
  const from = searchParams.get('from') ?? defaults.from
  const to = searchParams.get('to') ?? defaults.to

  const replace = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      Object.entries(patch).forEach(([key, value]) => {
        if (value == null || value === '') next.delete(key)
        else next.set(key, value)
      })
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setPreset = useCallback(
    (next: ReportPeriodPreset) => {
      if (next === 'custom') {
        replace({ preset: 'custom' })
        return
      }
      const range = defaultAnalyticsRange(next)
      replace({ preset: next, from: range.from, to: range.to })
    },
    [replace]
  )

  const setRange = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from || !range?.to) return
      replace({
        preset: 'custom',
        from: format(range.from, 'yyyy-MM-dd'),
        to: format(range.to, 'yyyy-MM-dd'),
      })
    },
    [replace]
  )

  const dateRange = useMemo<DateRange>(
    () => ({
      from: parseISO(from),
      to: parseISO(to),
    }),
    [from, to]
  )

  return {
    query: { from, to },
    preset,
    setPreset,
    setRange,
    dateRange,
  }
}

type ToolbarProps = {
  className?: string
}

export function ReportDateRangeToolbar({ className }: ToolbarProps) {
  const { preset, setPreset, setRange, dateRange, query } = useReportDateRangeQuery()

  const label =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, 'd MMM yyyy', { locale: tr })} – ${format(dateRange.to, 'd MMM yyyy', { locale: tr })}`
      : 'Tarih seçin'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className='flex rounded-lg border bg-muted/20 p-0.5'>
        {PRESETS.map((item) => (
          <Button
            key={item.id}
            type='button'
            size='sm'
            variant={preset === item.id ? 'secondary' : 'ghost'}
            className='h-8'
            onClick={() => setPreset(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={cn(
              'h-8 justify-start gap-2 font-normal',
              preset === 'custom' && 'border-primary/40'
            )}
          >
            <CalendarIcon className='size-3.5' />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            mode='range'
            numberOfMonths={2}
            selected={dateRange}
            onSelect={setRange}
            locale={tr}
            defaultMonth={dateRange.from}
          />
        </PopoverContent>
      </Popover>

      <span className='text-xs text-muted-foreground'>
        {query.from} → {query.to}
      </span>
    </div>
  )
}
