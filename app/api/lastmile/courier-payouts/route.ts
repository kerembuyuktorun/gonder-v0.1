import { NextResponse } from 'next/server'
import {
  createCourierPayout,
  listCourierPayouts,
} from '../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'
import type { PayoutMethod, PayoutStatus } from '../../../(arf)/(workspaces)/lastmile/finance/_types'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { searchParams } = new URL(request.url)
  const data = await listCourierPayouts(auth.tenantId, {
    courierId: searchParams.get('courierId') ?? undefined,
    status: (searchParams.get('status') as PayoutStatus | null) ?? undefined,
  })
  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as {
    courierId?: string
    courierName?: string
    ledgerId?: string
    amount?: number
    method?: PayoutMethod
    paidAt?: string
    note?: string
  } | null
  if (!body?.courierId || body.amount == null || !body.method || !body.paidAt) {
    return NextResponse.json(
      { success: false, error: 'courierId, amount, method, paidAt zorunlu' },
      { status: 400 }
    )
  }
  const entry = await createCourierPayout(auth.tenantId, {
    courierId: body.courierId,
    courierName: body.courierName,
    ledgerId: body.ledgerId,
    amount: Number(body.amount),
    method: body.method,
    paidAt: body.paidAt,
    note: body.note,
  })
  return NextResponse.json({ success: true, data: entry }, { status: 201 })
}
