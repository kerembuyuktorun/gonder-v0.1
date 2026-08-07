'use client'

import { useQuery } from '@tanstack/react-query'
import { returnsRepository } from '../_data/returns-repository'
import type { ReturnsListQuery } from '../_data/returns-repository'

export const RETURNS_QUERY_KEY = ['gonder', 'returns'] as const

export function useReturnsList(query: ReturnsListQuery) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'list', query],
    queryFn: () => returnsRepository.list(query),
  })
}

export function useReturnsActiveCount() {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'active-count'],
    queryFn: () => returnsRepository.countActive(),
    staleTime: 15_000,
  })
}
