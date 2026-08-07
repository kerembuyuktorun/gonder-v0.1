'use client'

import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { ARF_ROUTES } from '../../_shared/routes'
import { DashboardKpiCards } from './_components/dashboard-kpi-cards'
import { DashboardRecentOrders } from './_components/dashboard-recent-orders'
import { DashboardQuickActions } from './_components/dashboard-quick-actions'
import type { LastmileDashboardData } from './_types/dashboard'

const DashboardOrderStatusChart = dynamic(
  () =>
    import('./_components/dashboard-order-status-chart').then((m) => ({
      default: m.DashboardOrderStatusChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-64 items-center justify-center rounded-lg border bg-muted/30'>
        <span className='text-sm text-muted-foreground'>Grafik yükleniyor…</span>
      </div>
    ),
  }
)

const DashboardDeliveryTrendChart = dynamic(
  () =>
    import('./_components/dashboard-delivery-trend-chart').then((m) => ({
      default: m.DashboardDeliveryTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-64 items-center justify-center rounded-lg border bg-muted/30'>
        <span className='text-sm text-muted-foreground'>Grafik yükleniyor…</span>
      </div>
    ),
  }
)

const DashboardFleetChart = dynamic(
  () =>
    import('./_components/dashboard-fleet-chart').then((m) => ({
      default: m.DashboardFleetChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-48 items-center justify-center rounded-lg border bg-muted/30'>
        <span className='text-sm text-muted-foreground'>Grafik yükleniyor…</span>
      </div>
    ),
  }
)

interface Props {
  data: LastmileDashboardData
}

export default function LastmileDashboardContent({ data }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'KPI Metrikler' }]}
        searchPlaceholder='Sipariş, kurye veya rota ara...'
        searchShortcut={<>⌘K</>}
        notificationCount={data.alerts.length}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-semibold tracking-tight'>Operasyon Özeti</h1>
            <p className='text-sm text-muted-foreground'>
              Bugünkü sipariş, filo ve teslimat performansına anlık bakış
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={`${ARF_ROUTES.lastmile.orders.list}?demo=1`}>Demo siparişler</Link>
            </Button>
            <Button variant='outline' size='sm' asChild>
              <Link href={`${ARF_ROUTES.lastmile.resources.couriers.list}?demo=1`}>
                Demo kuryeler
              </Link>
            </Button>
            <Button variant='outline' size='sm' asChild>
              <Link href={`${ARF_ROUTES.lastmile.planning.routes}?demo=1`}>Demo rotalar</Link>
            </Button>
            <Button size='sm' className='bg-lime-400 text-black hover:bg-lime-300' asChild>
              <Link href={ARF_ROUTES.lastmile.dashboard.live}>Canlı izleme</Link>
            </Button>
          </div>
        </div>

        <DashboardKpiCards kpiCards={data.kpiCards} />

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <DashboardOrderStatusChart data={data.orderStatusDistribution} />
          </div>
          <DashboardFleetChart data={data.fleetDistribution} />
        </div>

        <DashboardDeliveryTrendChart data={data.dailyDeliveries} />

        <div className='grid gap-6 lg:grid-cols-3'>
          <DashboardRecentOrders orders={data.recentOrders} />
          <DashboardQuickActions actions={data.quickActions} alerts={data.alerts} />
        </div>
      </div>
    </>
  )
}
