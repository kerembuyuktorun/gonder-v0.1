'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type ParamsMap = Record<string, string | null | undefined>

export function useWorkspaceListUrlState<TView extends string>(options: {
  defaultView: TView
  validViews: readonly TView[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const viewParam = searchParams.get('view')
  const view = (
    options.validViews.includes(viewParam as TView) ? (viewParam as TView) : options.defaultView
  ) as TView

  const status = searchParams.get('status')
  const search = searchParams.get('search') ?? ''
  const carrier = searchParams.get('carrier')
  const channel = searchParams.get('channel')
  const channelId = searchParams.get('channelId')
  const layoutParam = searchParams.get('layout')
  const layout: 'table' | 'board' = layoutParam === 'board' ? 'board' : 'table'
  const operationParam = searchParams.get('operation')
  const validOperations = ['all', 'parcel', 'courier', 'logistics'] as const
  const operation = (
    validOperations.includes(operationParam as (typeof validOperations)[number])
      ? (operationParam as (typeof validOperations)[number])
      : 'all'
  ) as 'all' | 'parcel' | 'courier' | 'logistics'

  const replaceParams = useCallback(
    (patch: ParamsMap) => {
      const next = new URLSearchParams(searchParams.toString())
      Object.entries(patch).forEach(([key, value]) => {
        if (value == null || value === '') next.delete(key)
        else next.set(key, value)
      })
      const query = next.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setView = useCallback(
    (nextView: TView) => {
      replaceParams({
        view: nextView === options.defaultView ? null : nextView,
      })
    },
    [options.defaultView, replaceParams]
  )

  const setSearch = useCallback(
    (value: string) => {
      replaceParams({ search: value.trim() || null })
    },
    [replaceParams]
  )

  const setStatus = useCallback(
    (value: string | null) => {
      replaceParams({ status: value })
    },
    [replaceParams]
  )

  const setCarrier = useCallback(
    (value: string | null) => {
      replaceParams({ carrier: value })
    },
    [replaceParams]
  )

  const setChannel = useCallback(
    (value: string | null) => {
      replaceParams({ channel: value, channelId: null })
    },
    [replaceParams]
  )

  const setChannelId = useCallback(
    (value: string | null) => {
      replaceParams({ channelId: value, channel: null })
    },
    [replaceParams]
  )

  const setChannels = useCallback(
    (values: string[]) => {
      replaceParams({
        channel: values.length ? values.join(',') : null,
        channelId: null,
      })
    },
    [replaceParams]
  )

  const setLayout = useCallback(
    (value: 'table' | 'board') => {
      replaceParams({ layout: value === 'table' ? null : value })
    },
    [replaceParams]
  )

  const setOperation = useCallback(
    (value: 'all' | 'parcel' | 'courier' | 'logistics') => {
      replaceParams({ operation: value === 'all' ? null : value })
    },
    [replaceParams]
  )

  const clearFilters = useCallback(() => {
    replaceParams({
      status: null,
      search: null,
      carrier: null,
      channel: null,
      channelId: null,
    })
  }, [replaceParams])

  const channelList = useMemo(
    () => (channel ? channel.split(',').map((item) => item.trim()).filter(Boolean) : []),
    [channel]
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (status) count += 1
    if (search.trim()) count += 1
    if (carrier) count += 1
    if (channelList.length) count += 1
    if (channelId) count += 1
    if (operation !== 'all') count += 1
    return count
  }, [carrier, channelId, channelList.length, operation, search, status])

  return {
    view,
    status,
    search,
    carrier,
    channel,
    channelId,
    channelList,
    layout,
    operation,
    setView,
    setSearch,
    setStatus,
    setCarrier,
    setChannel,
    setChannelId,
    setChannels,
    setLayout,
    setOperation,
    clearFilters,
    activeFilterCount,
    replaceParams,
  }
}
