import { NextResponse } from 'next/server'
import { setPriceListStatus } from '../../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'
import type { PriceListStatus } from '../../../../../(arf)/(workspaces)/lastmile/finance/_types'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: PriceListStatus } | null
  if (body?.status !== 'active' && body?.status !== 'passive') {
    return NextResponse.json({ success: false, error: 'status active|passive olmalı' }, { status: 400 })
  }
  const item = await setPriceListStatus(auth.tenantId, id, body.status)
  if (!item) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}
