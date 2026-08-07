import { lastmileClientRequest } from './client'

export type CreateLastMileOrderResponse = {
  id?: string
  takip_no?: string
  trackingCode?: string
  trackingNo?: string
  code?: string
  referenceNo?: string
  suggestInjectRouteIds?: string[]
  dispatchedRouteId?: string
  dispatchWarning?: string
  [key: string]: unknown
}

export async function createLastMileOrder(payload: Record<string, unknown>) {
  return lastmileClientRequest<CreateLastMileOrderResponse>('/api/lastmile/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
