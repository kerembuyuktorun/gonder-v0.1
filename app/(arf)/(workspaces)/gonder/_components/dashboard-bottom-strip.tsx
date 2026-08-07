'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../_shared/routes'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardIntegration, DashboardPendingOrder } from '../_types/dashboard'

const integrationStatusClass: Record<DashboardIntegration['status'], string> = {
  connected: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  disconnected: 'border-slate-500/20 bg-slate-500/10 text-slate-600',
}

interface Props {
  pendingOrders: DashboardPendingOrder[]
  integrations: DashboardIntegration[]
}

export function DashboardBottomStrip({ pendingOrders, integrations }: Props) {
  return (
    <div className='grid gap-2.5 lg:grid-cols-2'>
      <Card className='min-w-0 gap-0 py-0 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Gönderi bekleyen siparişler</CardTitle>
          <Button variant='ghost' size='sm' asChild className='h-8'>
            <Link href={ARF_ROUTES.gonder.orders.needsShipment} className='gap-1'>
              Tümü
              <ChevronRight className='size-4' />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className='space-y-1 px-3 pb-3 pt-0'>
          {pendingOrders.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Bekleyen sipariş yok</p>
          ) : (
            pendingOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={order.href}
                className='flex items-center justify-between rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/40'
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{order.reference}</p>
                  {order.source ? (
                    <p className='text-xs text-muted-foreground'>{order.source}</p>
                  ) : null}
                </div>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className='min-w-0 gap-0 py-0 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Entegrasyon durumu</CardTitle>
          <Button variant='ghost' size='sm' asChild className='h-8'>
            <Link href={ARF_ROUTES.gonder.integrations.root} className='gap-1'>
              Yönet
              <ChevronRight className='size-4' />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className='space-y-1.5 px-3 pb-3 pt-0'>
          {integrations.map((integration) => (
            <div key={integration.id} className='flex items-center justify-between gap-3'>
              <span className='text-sm'>{integration.name}</span>
              <Badge variant='outline' className={integrationStatusClass[integration.status]}>
                {tDashboard(`integration.${integration.status}`)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
