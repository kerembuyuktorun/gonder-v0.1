import { NextResponse } from 'next/server'
import { listCollections } from '../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'

/** GET /api/lastmile/collections/kpi */
export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { payments, entries } = await listCollections(auth.tenantId)
  const toCollect = payments.reduce((s, p) => s + Math.max(0, p.amountDue - p.amountPaid), 0)
  const collected = entries.reduce((s, e) => s + e.amount, 0)
  const overdue = payments
    .filter((p) => p.collectionStatus === 'gecikti')
    .reduce((s, p) => s + Math.max(0, p.amountDue - p.amountPaid), 0)
  const openOrderCount = payments.filter((p) => p.amountPaid < p.amountDue).length
  return NextResponse.json({
    success: true,
    data: { toCollect, collected, overdue, openOrderCount },
  })
}
