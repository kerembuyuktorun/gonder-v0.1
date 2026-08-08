import { NextResponse } from 'next/server'
import {
  getCustomerPricingAssignment,
  setCustomerPricingAssignment,
} from '../../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const row = await getCustomerPricingAssignment(auth.tenantId, id)
  return NextResponse.json({ success: true, data: row ?? null })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { priceListId?: string | null } | null
  try {
    const row = await setCustomerPricingAssignment(
      auth.tenantId,
      id,
      body?.priceListId === undefined ? null : body.priceListId
    )
    return NextResponse.json({ success: true, data: row })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hata'
    const status = msg === 'PRICE_LIST_NOT_FOUND' ? 404 : 400
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
