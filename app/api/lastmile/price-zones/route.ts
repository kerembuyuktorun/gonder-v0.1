import { NextResponse } from 'next/server'
import {
  createPriceZone,
  listPriceZones,
  type UpsertZoneInput,
} from '../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listPriceZones(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as UpsertZoneInput | null
  if (!body?.name?.trim() || !Array.isArray(body.scopes)) {
    return NextResponse.json({ success: false, error: 'name ve scopes zorunlu' }, { status: 400 })
  }
  const created = await createPriceZone(auth.tenantId, body)
  return NextResponse.json({ success: true, data: created }, { status: 201 })
}
