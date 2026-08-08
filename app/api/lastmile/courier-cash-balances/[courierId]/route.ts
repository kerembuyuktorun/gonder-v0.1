import { NextResponse } from 'next/server'
import { getBalance } from '../../_lib/finance/courier-cash-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'

type Ctx = { params: Promise<{ courierId: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const balance = await getBalance(auth.tenantId, courierId)
  if (!balance) {
    return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: balance })
}
