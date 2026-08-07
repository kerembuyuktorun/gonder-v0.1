'use client'

import { useEffect, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { getSession } from '../../../(auth)/_api/auth-client'
import { getDisplayNameFromUser } from '../../../_shared/auth-me-user'
import {
  useDashboardInsights,
  useDashboardPerformance,
  useDashboardSnapshot,
} from '../_hooks/use-dashboard-snapshot'
import type { DashboardInsightsRange, PerformanceSummaryRange } from '../_types/dashboard'
import { DashboardActionSummaries } from './dashboard-action-summaries'
import { DashboardInsightsPanel } from './dashboard-insights-panel'
import { DashboardPerformanceStrip } from './dashboard-performance-strip'
import { DashboardQuickActions } from './dashboard-quick-actions'

export function GonderDashboardContent() {
  const [greetingName, setGreetingName] = useState<string | undefined>(undefined)
  const [insightsRange, setInsightsRange] = useState<DashboardInsightsRange>('30d')
  const [performanceRange, setPerformanceRange] = useState<PerformanceSummaryRange>('30d')
  const { data, isLoading, isError } = useDashboardSnapshot({ greetingName })
  const insightsQuery = useDashboardInsights(insightsRange)
  const performanceQuery = useDashboardPerformance(performanceRange)

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

      <div className='flex min-w-0 flex-1 flex-col gap-2.5 p-3 sm:p-4'>
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
            {performanceQuery.data ? (
              <DashboardPerformanceStrip
                summary={performanceQuery.data}
                range={performanceRange}
                onRangeChange={setPerformanceRange}
              />
            ) : (
              <div className='rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground'>
                Performans özeti yükleniyor…
              </div>
            )}

            <div className='grid min-w-0 gap-2.5 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]'>
              {insightsQuery.data ? (
                <DashboardInsightsPanel
                  insights={insightsQuery.data}
                  range={insightsRange}
                  onRangeChange={setInsightsRange}
                />
              ) : (
                <div className='rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground'>
                  Analitik yükleniyor…
                </div>
              )}

              {insightsQuery.data ? (
                <DashboardActionSummaries
                  newOrdersCount={insightsQuery.data.newOrdersCount}
                  newQuotesCount={insightsQuery.data.newQuotesCount}
                  ordersHref={insightsQuery.data.ordersHref}
                  quotesHref={insightsQuery.data.quotesHref}
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  )
}
