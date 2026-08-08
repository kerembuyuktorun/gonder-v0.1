import { NextResponse } from 'next/server'
import { setDefaultCourierCostList } from '../../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const item = await setDefaultCourierCostList(auth.tenantId, id)
  if (!item) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}
