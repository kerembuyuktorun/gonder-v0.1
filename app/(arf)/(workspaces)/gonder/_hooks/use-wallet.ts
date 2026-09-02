'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeRepository } from '../_data/finance-repository'
import {
  walletRepository,
  type WalletLedgerQuery,
} from '../_data/wallet-repository'
import type { WalletTopUpDraft } from '../_types/wallet'
import { FINANCE_QUERY_KEY } from './use-finance'

export const WALLET_QUERY_KEY = ['gonder', 'wallet'] as const

export function useWalletAccount() {
  return useQuery({
    queryKey: [...WALLET_QUERY_KEY, 'account'],
    queryFn: () => walletRepository.getAccount(),
  })
}

export function useWalletBalance() {
  return useQuery({
    queryKey: [...WALLET_QUERY_KEY, 'balance'],
    queryFn: () => walletRepository.getBalanceTry(),
    staleTime: 15_000,
  })
}

export function useWalletLedger(query: WalletLedgerQuery = {}) {
  return useQuery({
    queryKey: [...WALLET_QUERY_KEY, 'ledger', query],
    queryFn: () => walletRepository.listLedger(query),
  })
}

export function useWalletLedgerEntry(id: string | undefined) {
  return useQuery({
    queryKey: [...WALLET_QUERY_KEY, 'ledger-entry', id],
    queryFn: () => walletRepository.getLedgerEntryById(id!),
    enabled: Boolean(id),
  })
}

export function useWalletTopUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (draft: WalletTopUpDraft) => {
      const result = await walletRepository.topUp(draft)
      if (draft.amountTry && draft.method) {
        await financeRepository.recordWalletTopUp({
          amountTry: draft.amountTry,
          method: draft.method,
          note: draft.note,
        })
      }
      return result
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY }),
      ])
    },
  })
}
