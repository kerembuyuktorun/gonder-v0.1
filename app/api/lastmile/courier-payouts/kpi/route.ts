import { NextResponse } from 'next/server'
import { listCourierPayouts } from '../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { kpi } = await listCourierPayouts(auth.tenantId)
  return NextResponse.json({ success: true, data: kpi })
}
