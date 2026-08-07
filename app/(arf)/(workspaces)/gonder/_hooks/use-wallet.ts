'use client'

import { useQuery } from '@tanstack/react-query'
import {
  walletRepository,
  type WalletLedgerQuery,
} from '../_data/wallet-repository'

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
