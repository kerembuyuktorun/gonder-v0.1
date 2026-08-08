import { NextResponse } from 'next/server'
import { quotePriceForTenant } from '../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'
import type { QuoteInput } from '../../../../(arf)/(workspaces)/lastmile/finance/_types'

/** POST /api/lastmile/pricing/quote — server-side single source (FE engine parity) */
export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as QuoteInput | null
  if (!body || typeof body.desi !== 'number' || !body.origin || !body.destination) {
    return NextResponse.json(
      { success: false, error: 'desi, origin, destination zorunlu' },
      { status: 400 }
    )
  }
  const result = await quotePriceForTenant(auth.tenantId, body)
  return NextResponse.json({ success: true, data: result })
}
