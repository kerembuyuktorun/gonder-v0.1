import { NextResponse } from 'next/server'
import { getCustomerFinanceSummary } from '../../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const summary = await getCustomerFinanceSummary(auth.tenantId, id)
  return NextResponse.json({ success: true, data: summary })
}
