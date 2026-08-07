'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
  type ChartConfig,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { tDashboard } from '../_data/dashboard-labels'
import type {
  PerformanceMetricKey,
  PerformanceSummary,
  PerformanceSummaryRange,
} from '../_types/dashboard'

const METRIC_LABEL_KEYS: Record<PerformanceMetricKey, string> = {
  shipments: 'perf.shipments',
  revenue: 'perf.revenue',
  deliveryRate: 'perf.deliveryRate',
  avgCost: 'perf.avgCost',
}

const RANGES: Array<{ id: PerformanceSummaryRange; labelKey: string }> = [
  { id: '7d', labelKey: 'perf.range7d' },
  { id: '30d', labelKey: 'perf.range30d' },
  { id: '3m', labelKey: 'perf.range3m' },
]

type Props = {
  summary: PerformanceSummary
  range: PerformanceSummaryRange
  onRangeChange: (range: PerformanceSummaryRange) => void
}

function formatChange(change: number) {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1).replace('.', ',')}%`
}

function formatMetricValue(key: PerformanceMetricKey, value: number) {
  if (key === 'revenue' || key === 'avgCost') {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }
  if (key === 'deliveryRate') {
    return `%${value.toFixed(1).replace('.', ',')}`
  }
  return new Intl.NumberFormat('tr-TR').format(Math.round(value))
}

export function DashboardPerformanceStrip({ summary, range, onRangeChange }: Props) {
  const [selectedKey, setSelectedKey] = useState<PerformanceMetricKey>('shipments')

  const chartConfig = useMemo(
    () =>
      ({
        [selectedKey]: {
          label: tDashboard(METRIC_LABEL_KEYS[selectedKey]),
          color: 'hsl(var(--primary))',
        },
      }) satisfies ChartConfig,
    [selectedKey]
  )

  const averageValue = useMemo(() => {
    if (!summary.series.length) return 0
    const total = summary.series.reduce((sum, point) => sum + point[selectedKey], 0)
    return total / summary.series.length
  }, [selectedKey, summary.series])

  const chartData = useMemo(
    () =>
      summary.series.map((point, index) => {
        const previous = index > 0 ? summary.series[index - 1]![selectedKey] : null
        const current = point[selectedKey]
        const delta = previous == null ? null : current - previous
        return {
          ...point,
          value: current,
          previous,
          delta,
        }
      }),
    [selectedKey, summary.series]
  )

  return (
    <Card className='gap-0 border py-0 shadow-sm'>
      <CardContent className='space-y-3 p-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <p className='text-sm font-semibold'>{tDashboard('perf.title')}</p>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex rounded-lg border bg-muted/20 p-0.5'>
              {RANGES.map((item) => (
                <Button
                  key={item.id}
                  type='button'
                  size='sm'
                  variant={range === item.id ? 'secondary' : 'ghost'}
                  className='h-7 px-2.5 text-xs'
                  onClick={() => onRangeChange(item.id)}
                >
                  {tDashboard(item.labelKey)}
                </Button>
              ))}
            </div>
            <Button variant='ghost' size='sm' asChild className='h-7 gap-1 px-2'>
              <Link href={summary.reportsHref}>
                {tDashboard('perf.reports')}
                <ChevronRight className='size-3.5' />
              </Link>
            </Button>
          </div>
        </div>

        <div className='grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-stretch'>
          <div className='grid grid-cols-2 gap-2 content-start'>
            {summary.metrics.map((metric) => {
              const selected = metric.key === selectedKey
              const isPositiveGood = metric.key !== 'avgCost'
              const up = metric.change > 0
              const down = metric.change < 0
              const DeltaIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
              const deltaTone =
                metric.change === 0
                  ? 'neutral'
                  : isPositiveGood
                    ? up
                      ? 'up'
                      : 'down'
                    : up
                      ? 'down'
                      : 'up'

              return (
                <button
                  key={metric.key}
                  type='button'
                  onClick={() => setSelectedKey(metric.key)}
                  className={cn(
                    'rounded-lg border px-2.5 py-2 text-left transition-colors',
                    selected
                      ? 'border-primary/40 bg-primary/10 shadow-sm'
                      : 'bg-muted/20 hover:border-border hover:bg-muted/40'
                  )}
                >
                  <p className='text-[11px] text-muted-foreground'>
                    {tDashboard(METRIC_LABEL_KEYS[metric.key])}
                  </p>
                  <p className='mt-0.5 text-base font-semibold tabular-nums tracking-tight'>
                    {metric.formatted}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium',
                      deltaTone === 'up' && 'text-emerald-600',
                      deltaTone === 'down' && 'text-rose-600',
                      deltaTone === 'neutral' && 'text-muted-foreground'
                    )}
                  >
                    <DeltaIcon className='size-3' />
                    {formatChange(metric.change)}
                  </p>
                </button>
              )
            })}
          </div>

          <div className='min-w-0 rounded-lg border bg-muted/10 p-2'>
            <div className='mb-1 flex items-center justify-between gap-2 px-1'>
              <p className='text-xs font-medium text-muted-foreground'>
                {tDashboard(METRIC_LABEL_KEYS[selectedKey])}
              </p>
              <p className='text-[11px] text-muted-foreground'>
                {tDashboard('perf.chartAvg')}: {formatMetricValue(selectedKey, averageValue)}
              </p>
            </div>
            <ChartContainer
              config={chartConfig}
              className='aspect-auto h-[180px] w-full sm:h-[200px]'
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='perfMetricFill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={`var(--color-${selectedKey})`} stopOpacity={0.35} />
                    <stop offset='95%' stopColor={`var(--color-${selectedKey})`} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  width={selectedKey === 'revenue' ? 44 : 36}
                  tickFormatter={(value: number) =>
                    selectedKey === 'deliveryRate'
                      ? `${value}`
                      : selectedKey === 'revenue' || selectedKey === 'avgCost'
                        ? `${Math.round(value / 1000)}k`
                        : String(Math.round(value))
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator='line'
                      formatter={(value, _name, item) => {
                        const payload = item?.payload as {
                          delta?: number | null
                          previous?: number | null
                        }
                        const numeric = typeof value === 'number' ? value : Number(value)
                        const delta = payload?.delta
                        const deltaLabel =
                          delta == null
                            ? null
                            : `${delta > 0 ? '+' : ''}${formatMetricValue(selectedKey, delta)}`
                        return (
                          <div className='flex flex-col gap-0.5'>
                            <span className='font-medium tabular-nums'>
                              {formatMetricValue(selectedKey, numeric)}
                            </span>
                            {deltaLabel ? (
                              <span className='text-[11px] text-muted-foreground'>
                                Önceki: {deltaLabel}
                              </span>
                            ) : null}
                          </div>
                        )
                      }}
                    />
                  }
                />
                <Area
                  type='monotone'
                  dataKey={selectedKey}
                  stroke={`var(--color-${selectedKey})`}
                  fill='url(#perfMetricFill)'
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
