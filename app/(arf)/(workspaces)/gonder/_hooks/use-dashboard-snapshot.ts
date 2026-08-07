"use client"

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardRepository } from '../_data/dashboard-repository'
import type { DashboardSnapshot } from '../_types/dashboard'

export const DASHBOARD_SNAPSHOT_QUERY_KEY = ['gonder', 'dashboard', 'snapshot'] as const

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

export function useInvalidateDashboardSnapshot() {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY,
    })
}
