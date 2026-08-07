'use client'

import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReportKpi } from '../../_types/reports'

type Props = {
  kpis: ReportKpi[]
  className?: string
}

export function ReportKpiGrid({ kpis, className }: Props) {
  return (
    <div className={cn('grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5', className)}>
      {kpis.map((kpi) => {
        const DeltaIcon =
          kpi.deltaTone === 'up' ? ArrowUpRight : kpi.deltaTone === 'down' ? ArrowDownRight : Minus
        const body = (
          <Card className='h-full gap-0 border py-0 shadow-sm transition-colors hover:border-primary/30'>
            <CardContent className='space-y-1 p-3'>
              <p className='text-[11px] text-muted-foreground'>{kpi.label}</p>
              <p className='text-xl font-semibold tabular-nums tracking-tight'>{kpi.valueLabel}</p>
              {kpi.deltaLabel ? (
                <p
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[11px] font-medium',
                    kpi.deltaTone === 'up' && 'text-emerald-600',
                    kpi.deltaTone === 'down' && 'text-rose-600',
                    kpi.deltaTone === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  <DeltaIcon className='size-3' />
                  {kpi.deltaLabel}
                </p>
              ) : kpi.hint ? (
                <p className='text-[11px] text-muted-foreground'>{kpi.hint}</p>
              ) : null}
            </CardContent>
          </Card>
        )

        if (kpi.href) {
          return (
            <Link key={kpi.id} href={kpi.href} className='block'>
              {body}
            </Link>
          )
        }

        return (
          <div key={kpi.id} className='block'>
            {body}
          </div>
        )
      })}
    </div>
  )
}
