'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ARF_ROUTES } from '../../../_shared/routes'
import { withLastmileDemo } from '../_lib/lastmile-demo-mode'
import type { RecentOrderRow } from '../_types/dashboard'

const statusConfig: Record<
  RecentOrderRow['status'],
  { label: string; className: string }
> = {
  atama_bekliyor: {
    label: 'Atama Bekliyor',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  hazirlaniyor: {
    label: 'Hazırlanıyor',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  yolda: {
    label: 'Yolda',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  teslim_edildi: {
    label: 'Teslim Edildi',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  iptal_edildi: {
    label: 'İptal',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  basarisiz: {
    label: 'Başarısız',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
}

interface Props {
  orders: RecentOrderRow[]
}

export function DashboardRecentOrders({ orders }: Props) {
  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <div>
          <CardTitle className='text-base font-medium'>Son Siparişler</CardTitle>
          <CardDescription className='text-sm'>Güncel last mile hareketleri</CardDescription>
        </div>
        <Button variant='ghost' size='sm' asChild>
          <Link href={withLastmileDemo(ARF_ROUTES.lastmile.orders.list, true)} className='gap-1'>
            Tümü
            <ChevronRight className='size-4' />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='divide-y divide-border'>
          {orders.map((order) => {
            const st = statusConfig[order.status]
            return (
              <div
                key={order.id}
                className='flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex size-9 items-center justify-center rounded-lg bg-muted'>
                    <Package className='size-4 text-muted-foreground' />
                  </div>
                  <div>
                    <Link
                      href={withLastmileDemo(ARF_ROUTES.lastmile.orders.detail(order.id), true)}
                      className='text-sm font-medium hover:underline'
                    >
                      {order.id}
                    </Link>
                    <p className='text-xs text-muted-foreground'>
                      {order.customer} · {order.district}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge variant='outline' className={st.className}>
                    {st.label}
                  </Badge>
                  <span className='hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex'>
                    <Clock className='size-3' />
                    {order.time}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
