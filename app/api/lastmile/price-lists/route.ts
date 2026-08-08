import { NextResponse } from 'next/server'
import {
  clonePriceList,
  createPriceList,
  listPriceLists,
  type UpsertPriceListInput,
} from '../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

/** GET /api/lastmile/price-lists — maps to /last-mile-price-lists */
export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listPriceLists(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}

/** POST /api/lastmile/price-lists */
export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as UpsertPriceListInput | null
  if (!body?.name?.trim() || !body.distanceStructure) {
    return NextResponse.json({ success: false, error: 'name ve distanceStructure zorunlu' }, { status: 400 })
  }
  const created = await createPriceList(auth.tenantId, body)
  return NextResponse.json({ success: true, data: created }, { status: 201 })
}
