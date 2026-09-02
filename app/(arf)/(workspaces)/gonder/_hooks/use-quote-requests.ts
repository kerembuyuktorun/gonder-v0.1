'use client'

import { useQuery } from '@tanstack/react-query'
import { quoteRequestsRepository } from '../_data/quote-requests-repository'
import type { QuoteRequestsListQuery } from '../_data/quote-requests-repository'

export const QUOTE_REQUESTS_KEY = ['gonder', 'quote-requests'] as const

export function useQuoteRequestsList(query: QuoteRequestsListQuery) {
  return useQuery({
    queryKey: [...QUOTE_REQUESTS_KEY, 'list', query],
    queryFn: () => quoteRequestsRepository.list(query),
    staleTime: 0,
  })
}

export function useQuoteRequest(id: string | null) {
  return useQuery({
    queryKey: [...QUOTE_REQUESTS_KEY, 'detail', id],
    queryFn: () => (id ? quoteRequestsRepository.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useQuoteActionRequiredCount() {
  return useQuery({
    queryKey: [...QUOTE_REQUESTS_KEY, 'action-count'],
    queryFn: () => quoteRequestsRepository.countActionRequired(),
    staleTime: 15_000,
  })
}
