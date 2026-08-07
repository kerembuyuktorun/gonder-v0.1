'use client'

import { useQuery } from '@tanstack/react-query'
import { desiAdjustmentsRepository } from '../_data/desi-adjustments-repository'
import type { DesiListQuery } from '../_data/desi-adjustments-repository'

export const DESI_QUERY_KEY = ['gonder', 'desi-adjustments'] as const

export function useDesiAdjustmentsList(query: DesiListQuery) {
  return useQuery({
    queryKey: [...DESI_QUERY_KEY, 'list', query],
    queryFn: () => desiAdjustmentsRepository.list(query),
  })
}

export function useDesiUnreviewedCount() {
  return useQuery({
    queryKey: [...DESI_QUERY_KEY, 'unreviewed-count'],
    queryFn: () => desiAdjustmentsRepository.countUnreviewed(),
    staleTime: 15_000,
  })
}
