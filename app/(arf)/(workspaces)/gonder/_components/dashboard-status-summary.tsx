"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardStatusSummaryItem } from '../_types/dashboard'
import { shipmentStatusConfig } from './dashboard-status-config'

interface Props {
  items: DashboardStatusSummaryItem[]
}

export function DashboardStatusSummary({ items }: Props) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <Card className='min-w-0 gap-0 py-0 shadow-sm'>
      <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
        <CardTitle className='text-sm font-semibold'>Durum özeti</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 px-3 pb-3 pt-0'>
        {items.map((item) => {
          const status = shipmentStatusConfig[item.status]
          const width = Math.max(6, Math.round((item.count / total) * 100))

          return (
            <div key={item.status} className='space-y-1.5'>
              <div className='flex items-center justify-between gap-3'>
                <Badge variant='outline' className={status.className}>
                  {tDashboard(status.labelKey)}
                </Badge>
                <span className='text-sm font-semibold tabular-nums'>{item.count}</span>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-primary/70'
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
