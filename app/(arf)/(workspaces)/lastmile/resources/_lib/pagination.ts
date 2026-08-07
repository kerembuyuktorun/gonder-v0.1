export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function unwrapPaginationMeta(
  payload: Record<string, unknown>,
  fallbackPage: number,
  fallbackPageSize: number
) {
  const nested =
    payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : {}

  return {
    total: Number(payload.total ?? nested.total ?? 0),
    page: Number(payload.page ?? nested.page ?? fallbackPage),
    pageSize: Number(payload.pageSize ?? nested.pageSize ?? fallbackPageSize),
  }
}

export function hasMorePages<T>(state: PaginatedResult<T>) {
  return state.items.length < state.total
}
