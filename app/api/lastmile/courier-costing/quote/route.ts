import { NextResponse } from 'next/server'
import { quoteCourierCostForTenant } from '../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'
import type { CourierCostQuoteInput } from '../../../../(arf)/(workspaces)/lastmile/finance/_types'

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as CourierCostQuoteInput | null
  if (!body || typeof body.desi !== 'number' || !body.origin || !body.destination) {
    return NextResponse.json(
      { success: false, error: 'desi, origin, destination zorunlu' },
      { status: 400 }
    )
  }
  const result = await quoteCourierCostForTenant(auth.tenantId, body)
  return NextResponse.json({ success: true, data: result })
}
