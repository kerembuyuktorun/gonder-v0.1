import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  unwrapListItems,
  upstreamErrorResponse,
} from '../_lib/lastmile-bff'

const LIST_QUERY_KEYS = [
  'page',
  'pageSize',
  'search',
  'type',
  'method',
  'statusGroup',
  'aggregatedStatus',
  'unassigned',
  'cancelled',
  'planningPool',
  'poolScope',
  'operationDate',
  'driverId',
  'routeId',
  'senderCustomerId',
  'receiverCustomerId',
  'orderOwner',
  'fromFacilityId',
  'toFacilityId',
  'targetDeliveryFrom',
  'targetDeliveryTo',
  'sourceType',
  'paymentType',
  'tenantId',
] as const

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown): {
  total: number
  page: number
  pageSize: number
} {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const total = Number(root.total ?? nested.total ?? 0)
  const page = Number(root.page ?? nested.page ?? 1)
  const pageSize = Number(root.pageSize ?? nested.pageSize ?? 20)

  return {
    total: Number.isFinite(total) ? total : 0,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 20,
  }
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of LIST_QUERY_KEYS) {
    const values = searchParams.getAll(key)
    for (const value of values) {
      if (value) upstreamParams.append(key, value)
    }
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '20')

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-orders${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const meta = pickPaginationMeta(upstream.data)

  return NextResponse.json({
    success: true,
    data: {
      orders: unwrapListItems(upstream.data),
      total: meta.total,
      page: meta.page,
      pageSize: meta.pageSize,
    },
  })
}

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    )
  }

  // Optional finance fields (Step 1 A): strip before upstream so unknown keys don't break ops API.
  // Pricing is optional — create still works without them.
  const root =
    body && typeof body === 'object' ? ({ ...(body as Record<string, unknown>) } as Record<string, unknown>) : {}
  const pricingSnapshot = root.pricingSnapshot ?? root.snapshot
  const payment = root.payment
  delete root.pricingSnapshot
  delete root.snapshot
  delete root.payment

  const upstream = await lastmileRest<unknown>(
    'api/v1/last-mile-orders',
    {
      method: 'POST',
      body: JSON.stringify(root),
    },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const order = unwrapEntity(upstream.data)
  const orderId = String(
    order.id ?? order.orderId ?? order.order_id ?? ''
  ).trim()

  let pricing:
    | { snapshot: unknown; payment: unknown }
    | undefined

  if (
    orderId &&
    pricingSnapshot &&
    typeof pricingSnapshot === 'object' &&
    payment &&
    typeof payment === 'object'
  ) {
    const { resolveFinanceTenantId } = await import('../_lib/finance/tenant')
    const { saveOrderPricing } = await import('../_lib/finance/order-pricing-service')
    const tenantId = await resolveFinanceTenantId(auth.accessToken, request)
    if (tenantId) {
      pricing = await saveOrderPricing(tenantId, orderId, {
        snapshot: pricingSnapshot as never,
        payment: payment as never,
      })
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      ...order,
      suggestInjectRouteIds: Array.isArray(order.suggestInjectRouteIds)
        ? order.suggestInjectRouteIds
        : [],
      dispatchedRouteId:
        typeof order.dispatchedRouteId === 'string' ? order.dispatchedRouteId : undefined,
      dispatchWarning:
        typeof order.dispatchWarning === 'string' ? order.dispatchWarning : undefined,
      ...(pricing ? { pricing } : {}),
    },
  })
}
