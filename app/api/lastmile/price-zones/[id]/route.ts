import { NextResponse } from 'next/server'
import {
  deletePriceZone,
  getPriceZone,
  updatePriceZone,
  type UpsertZoneInput,
} from '../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const item = await getPriceZone(auth.tenantId, id)
  if (!item) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as UpsertZoneInput | null
  if (!body?.name?.trim() || !Array.isArray(body.scopes)) {
    return NextResponse.json({ success: false, error: 'name ve scopes zorunlu' }, { status: 400 })
  }
  const updated = await updatePriceZone(auth.tenantId, id, body)
  if (!updated) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const ok = await deletePriceZone(auth.tenantId, id)
  if (!ok) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: { id } })
}
