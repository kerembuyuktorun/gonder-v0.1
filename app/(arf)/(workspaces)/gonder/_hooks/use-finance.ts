'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  financeRepository,
  type FinanceListQuery,
} from '../_data/finance-repository'
import type { FinanceSettlementChannel, FinanceSummaryPeriod } from '../_types/finance'

const WALLET_QUERY_KEY = ['gonder', 'wallet'] as const

export const FINANCE_QUERY_KEY = ['gonder', 'finance'] as const

export function useFinanceSummary(period: FinanceSummaryPeriod = '30d') {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'summary', period],
    queryFn: () => financeRepository.getSummary(period),
  })
}

export function useFinanceTransactions(query: FinanceListQuery = {}) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'transactions', query],
    queryFn: () => financeRepository.listTransactions(query),
  })
}

export function useFinanceTransaction(id: string | undefined) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'transaction', id],
    queryFn: () => financeRepository.getTransactionById(id!),
    enabled: Boolean(id),
  })
}

export function useUpcomingPayments(query: FinanceListQuery = {}) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'upcoming', query],
    queryFn: () => financeRepository.listUpcoming(query),
  })
}

export function useUpcomingPayment(id: string | undefined) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'upcoming-item', id],
    queryFn: () => financeRepository.getUpcomingById(id!),
    enabled: Boolean(id),
  })
}

export function useUpcomingDueCount() {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'upcoming-due-count'],
    queryFn: () => financeRepository.countUpcomingDue(),
    staleTime: 15_000,
  })
}

export function useFinanceInvoices(query: FinanceListQuery = {}) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'invoices', query],
    queryFn: () => financeRepository.listInvoices(query),
  })
}

export function useFinanceInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, 'invoice', id],
    queryFn: () => financeRepository.getInvoiceById(id!),
    enabled: Boolean(id),
  })
}

export function usePayUpcoming() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: FinanceSettlementChannel }) =>
      financeRepository.payUpcoming(id, channel),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY }),
      ])
    },
  })
}
