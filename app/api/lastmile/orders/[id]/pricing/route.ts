import { NextResponse } from 'next/server'
import {
  getOrderPricing,
  saveOrderPricing,
  type SaveOrderPricingInput,
} from '../../../_lib/finance/order-pricing-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type RouteContext = { params: Promise<{ id: string }> }

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

/**
 * GET /api/lastmile/orders/:id/pricing
 * → { snapshot?, payment? } | null body when empty
 *
 * Maps upstream contract GET /last-mile-orders/{id}/pricing
 */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireFinanceAuth(_request)
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'order id gerekli' }, { status: 400 })
  }

  const data = await getOrderPricing(auth.tenantId, id)
  return NextResponse.json({
    success: true,
    data: data ?? { snapshot: undefined, payment: undefined },
  })
}

/**
 * PUT /api/lastmile/orders/:id/pricing
 * Body: { snapshot, payment } (camelCase FE types)
 *
 * Prefer A: also accepted on POST /api/lastmile/orders as pricingSnapshot? + payment?
 */
export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'order id gerekli' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON' }, { status: 400 })
  }

  const root = asRecord(body)
  const snapshot = root.snapshot ?? root.pricingSnapshot
  const payment = root.payment

  if (!snapshot || typeof snapshot !== 'object') {
    return NextResponse.json(
      { success: false, error: 'snapshot zorunlu', code: 'SNAPSHOT_REQUIRED' },
      { status: 400 }
    )
  }
  if (!payment || typeof payment !== 'object') {
    return NextResponse.json(
      { success: false, error: 'payment zorunlu', code: 'PAYMENT_REQUIRED' },
      { status: 400 }
    )
  }

  const saved = await saveOrderPricing(auth.tenantId, id, {
    snapshot,
    payment,
  } as SaveOrderPricingInput)

  return NextResponse.json({ success: true, data: saved })
}
