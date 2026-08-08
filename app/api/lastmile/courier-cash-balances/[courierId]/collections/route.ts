import { NextResponse } from 'next/server'
import { recordCollection } from '../../../_lib/finance/courier-cash-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'
import type { CourierCashSource } from '../../../../../(arf)/(workspaces)/lastmile/finance/_types/courier-cash'

type Ctx = { params: Promise<{ courierId: string }> }

export async function POST(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const body = (await request.json().catch(() => null)) as {
    courierName?: string
    amount?: number
    occurredAt?: string
    source?: CourierCashSource
    orderId?: string | null
    takipNo?: string | null
    note?: string | null
  } | null
  if (body?.amount == null || !body.occurredAt || !body.source) {
    return NextResponse.json(
      { success: false, error: 'amount, occurredAt, source zorunlu' },
      { status: 400 }
    )
  }
  try {
    const movement = await recordCollection(auth.tenantId, {
      courierId,
      courierName: body.courierName,
      amount: Number(body.amount),
      occurredAt: body.occurredAt,
      source: body.source,
      orderId: body.orderId,
      takipNo: body.takipNo,
      note: body.note,
    })
    return NextResponse.json({ success: true, data: movement }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hata'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
