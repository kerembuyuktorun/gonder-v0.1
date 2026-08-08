import { NextResponse } from 'next/server'
import { cloneCourierCostList } from '../../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const cloned = await cloneCourierCostList(auth.tenantId, id)
  if (!cloned) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: cloned }, { status: 201 })
}
