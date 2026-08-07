"use client"

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardRepository } from '../_data/dashboard-repository'
import type {
  DashboardInsights,
  DashboardInsightsRange,
  DashboardSnapshot,
  PerformanceSummary,
  PerformanceSummaryRange,
} from '../_types/dashboard'

export const DASHBOARD_SNAPSHOT_QUERY_KEY = ['gonder', 'dashboard', 'snapshot'] as const
export const DASHBOARD_INSIGHTS_QUERY_KEY = ['gonder', 'dashboard', 'insights'] as const
export const DASHBOARD_PERFORMANCE_QUERY_KEY = ['gonder', 'dashboard', 'performance'] as const

type UseDashboardSnapshotOptions = {
  greetingName?: string
  enabled?: boolean
}

export function useDashboardSnapshot(options?: UseDashboardSnapshotOptions) {
  return useQuery<DashboardSnapshot>({
    queryKey: [...DASHBOARD_SNAPSHOT_QUERY_KEY, options?.greetingName ?? null],
    queryFn: () => dashboardRepository.getSnapshot({ greetingName: options?.greetingName }),
    enabled: options?.enabled ?? true,
  })
}

export function useDashboardInsights(range: DashboardInsightsRange) {
  return useQuery<DashboardInsights>({
    queryKey: [...DASHBOARD_INSIGHTS_QUERY_KEY, range],
    queryFn: () => dashboardRepository.getInsights(range),
  })
}

export function useDashboardPerformance(range: PerformanceSummaryRange) {
  return useQuery<PerformanceSummary>({
    queryKey: [...DASHBOARD_PERFORMANCE_QUERY_KEY, range],
    queryFn: () => dashboardRepository.getPerformanceSummary(range),
  })
}

export function useInvalidateDashboardSnapshot() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: DASHBOARD_INSIGHTS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: DASHBOARD_PERFORMANCE_QUERY_KEY })
  }
}
