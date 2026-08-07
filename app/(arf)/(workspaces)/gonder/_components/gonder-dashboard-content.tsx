'use client'

import { useEffect, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { getSession } from '../../../(auth)/_api/auth-client'
import { getDisplayNameFromUser } from '../../../_shared/auth-me-user'
import { useDashboardSnapshot } from '../_hooks/use-dashboard-snapshot'
import { DashboardActiveShipments } from './dashboard-active-shipments'
import { DashboardBottomStrip } from './dashboard-bottom-strip'
import { DashboardPerformanceStrip } from './dashboard-performance-strip'
import { DashboardQuickActions } from './dashboard-quick-actions'
import { DashboardStatusSummary } from './dashboard-status-summary'

export function GonderDashboardContent() {
  const [greetingName, setGreetingName] = useState<string | undefined>(undefined)
  const { data, isLoading, isError } = useDashboardSnapshot({ greetingName })

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const session = await getSession()
      if (cancelled || !session.success) return
      setGreetingName(getDisplayNameFromUser(session.data?.user ?? null))
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Gönder' }, { label: 'Dashboard' }]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationCount={1}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-2.5 p-3 sm:p-4'>
        {isLoading ? (
          <div className='rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground'>
            Dashboard yükleniyor…
          </div>
        ) : isError || !data ? (
          <div className='rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground'>
            Dashboard verisi alınamadı. Lütfen yenileyin.
          </div>
        ) : (
          <>
            <DashboardQuickActions actions={data.quickActions} />
            <DashboardPerformanceStrip performance={data.performance} />

            <div className='grid gap-2.5 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.9fr)]'>
              <DashboardActiveShipments shipments={data.activeShipments} />
              <DashboardStatusSummary items={data.statusSummary} />
            </div>

            <DashboardBottomStrip
              pendingOrders={data.pendingOrders}
              integrations={data.integrations}
            />
          </>
        )}
      </div>
    </>
  )
}
