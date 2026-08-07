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

  const clearFilters = useCallback(() => {
    replaceParams({ status: null, search: null, carrier: null })
  }, [replaceParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (status) count += 1
    if (search.trim()) count += 1
    if (carrier) count += 1
    return count
  }, [carrier, search, status])

  return {
    view,
    status,
    search,
    carrier,
    setView,
    setSearch,
    setStatus,
    setCarrier,
    clearFilters,
    activeFilterCount,
    replaceParams,
  }
}
