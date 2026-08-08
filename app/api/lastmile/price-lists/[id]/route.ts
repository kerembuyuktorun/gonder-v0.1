import { NextResponse } from 'next/server'
import {
  getPriceList,
  setDefaultPriceList,
  setPriceListStatus,
  updatePriceList,
  type UpsertPriceListInput,
} from '../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const item = await getPriceList(auth.tenantId, id)
  if (!item) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as UpsertPriceListInput | null
  if (!body?.name?.trim() || !body.distanceStructure) {
    return NextResponse.json({ success: false, error: 'name ve distanceStructure zorunlu' }, { status: 400 })
  }
  const updated = await updatePriceList(auth.tenantId, id, body)
  if (!updated) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}
