'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
  type ChartConfig,
} from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const volumeConfig = {
  shipments: { label: 'Gönderi', color: 'hsl(var(--primary))' },
  delivered: { label: 'Teslim', color: 'hsl(var(--chart-2, 173 58% 39%))' },
} satisfies ChartConfig

const costConfig = {
  costTry: { label: 'Maliyet', color: 'hsl(var(--chart-4, 43 74% 49%))' },
  revenueTry: { label: 'Ciro', color: 'hsl(var(--chart-2, 173 58% 39%))' },
} satisfies ChartConfig

type SeriesPoint = {
  label: string
  shipments?: number
  delivered?: number
  costTry?: number
  revenueTry?: number
  returns?: number
  count?: number
}

type Props = {
  title: string
  description?: string
  data: SeriesPoint[]
  variant?: 'volume' | 'cost' | 'returns' | 'bars'
  barKey?: string
  barLabel?: string
  className?: string
}

export function ReportTrendChart({
  title,
  description,
  data,
  variant = 'volume',
  barKey = 'count',
  barLabel = 'Adet',
  className,
}: Props) {
  if (variant === 'bars') {
    const config = {
      [barKey]: { label: barLabel, color: 'hsl(var(--primary))' },
    } satisfies ChartConfig

    return (
      <Card className={className ? `gap-0 py-0 shadow-sm ${className}` : 'gap-0 py-0 shadow-sm'}>
        <CardHeader className='space-y-0.5 px-4 pt-4 pb-2'>
          <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
          {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
        </CardHeader>
        <CardContent className='px-2 pb-3'>
          <ChartContainer config={config} className='aspect-auto h-[220px] w-full'>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={barKey} fill={`var(--color-${barKey})`} radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  const config = variant === 'cost' ? costConfig : volumeConfig
  const keys =
    variant === 'cost'
      ? (['costTry', 'revenueTry'] as const)
      : variant === 'returns'
        ? (['returns'] as const)
        : (['shipments', 'delivered'] as const)

  const returnsConfig = {
    returns: { label: 'İade', color: 'hsl(var(--chart-5, 27 87% 67%))' },
  } satisfies ChartConfig

  const activeConfig = variant === 'returns' ? returnsConfig : config

  return (
    <Card className={className ? `gap-0 py-0 shadow-sm ${className}` : 'gap-0 py-0 shadow-sm'}>
      <CardHeader className='space-y-0.5 px-4 pt-4 pb-2'>
        <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
        {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
      </CardHeader>
      <CardContent className='px-2 pb-3'>
        <ChartContainer config={activeConfig} className='aspect-auto h-[220px] w-full'>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {keys.map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={`var(--color-${key})`} stopOpacity={0.35} />
                  <stop offset='95%' stopColor={`var(--color-${key})`} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {keys.map((key) => (
              <Area
                key={key}
                type='monotone'
                dataKey={key}
                stroke={`var(--color-${key})`}
                fill={`url(#fill-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
