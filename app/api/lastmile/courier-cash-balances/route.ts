import { NextResponse } from 'next/server'
import { listBalances } from '../_lib/finance/courier-cash-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listBalances(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}
