import { NextResponse } from 'next/server'
import { listMovements } from '../../../_lib/finance/courier-cash-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ courierId: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const items = await listMovements(auth.tenantId, courierId)
  return NextResponse.json({ success: true, data: { items } })
}
