'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
  type ChartConfig,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../_shared/routes'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardInsights, DashboardInsightsRange } from '../_types/dashboard'

const volumeConfig = {
  count: { label: 'Gönderi', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

const statusConfig = {
  count: { label: 'Adet', color: 'hsl(var(--chart-3, 197 37% 24%))' },
} satisfies ChartConfig

const RANGES: Array<{ id: DashboardInsightsRange; labelKey: string }> = [
  { id: '7d', labelKey: 'insights.range7d' },
  { id: '30d', labelKey: 'insights.range30d' },
  { id: '3m', labelKey: 'insights.range3m' },
]

type Props = {
  insights: DashboardInsights
  range: DashboardInsightsRange
  onRangeChange: (range: DashboardInsightsRange) => void
  className?: string
}

function ChartCard({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <Card className='min-w-0 gap-0 border py-0 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1'>
        <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
        <Button variant='ghost' size='sm' asChild className='h-7 gap-1 px-2 text-xs'>
          <Link href={href}>
            {tDashboard('insights.reports')}
            <ChevronRight className='size-3.5' />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className='px-2 pb-3'>{children}</CardContent>
    </Card>
  )
}

export function DashboardInsightsPanel({
  insights,
  range,
  onRangeChange,
  className,
}: Props) {
  const R = ARF_ROUTES.gonder.reports

  return (
    <Card className={cn('min-w-0 gap-0 border py-0 shadow-sm', className)}>
      <CardContent className='space-y-3 p-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='min-w-0'>
            <p className='text-sm font-semibold'>{tDashboard('insights.title')}</p>
            <p className='text-xs text-muted-foreground'>Grafikten raporlara drill-down</p>
          </div>
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
        </div>

        <div className='grid gap-2.5 sm:grid-cols-2'>
          <ChartCard title={tDashboard('insights.volume')} href={R.shipmentVolume}>
            <ChartContainer
              config={volumeConfig}
              className='aspect-auto h-[160px] w-full sm:h-[180px]'
            >
              <BarChart
                accessibilityLayer
                data={insights.shipmentSeries}
                margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} fontSize={10} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='count' fill='var(--color-count)' radius={3} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title={tDashboard('insights.status')} href={R.deliveryPerformance}>
            <ChartContainer
              config={statusConfig}
              className='aspect-auto h-[160px] w-full sm:h-[180px]'
            >
              <BarChart
                accessibilityLayer
                data={insights.statusBreakdown}
                margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} fontSize={10} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='count' fill='var(--color-count)' radius={3} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>
      </CardContent>
    </Card>
  )
}
