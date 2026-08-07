'use client'

import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from 'lucide-react'
import {
  Area,
  AreaChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardPerformanceStrip } from '../_types/dashboard'

const chartConfig = {
  shipments: {
    label: 'Gönderi',
    color: 'hsl(var(--primary))',
  },
  revenueTry: {
    label: 'Ciro',
    color: 'hsl(var(--chart-2, 173 58% 39%))',
  },
} satisfies ChartConfig

type Props = {
  performance: DashboardPerformanceStrip
}

export function DashboardPerformanceStrip({ performance }: Props) {
  return (
    <Card className='gap-0 border py-0 shadow-sm'>
      <CardContent className='grid gap-3 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-center'>
        <div className='min-w-0 space-y-2.5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold'>{tDashboard('perf.title')}</p>
              <p className='text-xs text-muted-foreground'>{tDashboard('perf.period7d')}</p>
            </div>
            <Button variant='ghost' size='sm' asChild className='h-8 gap-1 px-2'>
              <Link href={performance.reportsHref}>
                {tDashboard('perf.reports')}
                <ChevronRight className='size-3.5' />
              </Link>
            </Button>
          </div>

          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
            {performance.metrics.map((metric) => {
              const DeltaIcon =
                metric.deltaTone === 'up'
                  ? ArrowUpRight
                  : metric.deltaTone === 'down'
                    ? ArrowDownRight
                    : Minus

              return (
                <div
                  key={metric.id}
                  className='rounded-lg border bg-muted/20 px-2.5 py-2'
                >
                  <p className='text-[11px] text-muted-foreground'>
                    {tDashboard(metric.labelKey)}
                  </p>
                  <p className='mt-0.5 text-base font-semibold tabular-nums tracking-tight'>
                    {metric.valueLabel}
                  </p>
                  {metric.deltaLabel ? (
                    <p
                      className={cn(
                        'mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium',
                        metric.deltaTone === 'up' && 'text-emerald-600',
                        metric.deltaTone === 'down' && 'text-rose-600',
                        metric.deltaTone === 'neutral' && 'text-muted-foreground'
                      )}
                    >
                      <DeltaIcon className='size-3' />
                      {metric.deltaLabel}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <ChartContainer config={chartConfig} className='h-[88px] w-full aspect-auto'>
          <AreaChart accessibilityLayer data={performance.series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id='gonderShipmentsFill' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-shipments)' stopOpacity={0.35} />
                <stop offset='95%' stopColor='var(--color-shipments)' stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <Area
              dataKey='shipments'
              type='monotone'
              fill='url(#gonderShipmentsFill)'
              stroke='var(--color-shipments)'
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
