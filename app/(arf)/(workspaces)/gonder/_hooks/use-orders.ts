'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersRepository, type OrdersListQuery } from '../_data/orders-repository'

export const ORDERS_KEY = ['gonder', 'orders'] as const

export function useOrdersList(query: OrdersListQuery) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'list', query],
    queryFn: () => ordersRepository.list(query),
  })
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'detail', id],
    queryFn: () => (id ? ordersRepository.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  })
}
