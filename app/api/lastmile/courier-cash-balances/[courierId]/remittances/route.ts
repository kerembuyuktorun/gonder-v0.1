import { NextResponse } from 'next/server'
import { recordRemittance } from '../../../_lib/finance/courier-cash-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ courierId: string }> }

export async function POST(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const body = (await request.json().catch(() => null)) as {
    courierName?: string
    amount?: number
    occurredAt?: string
    note?: string | null
  } | null
  if (body?.amount == null || !body.occurredAt) {
    return NextResponse.json(
      { success: false, error: 'amount ve occurredAt zorunlu' },
      { status: 400 }
    )
  }
  try {
    const movement = await recordRemittance(auth.tenantId, {
      courierId,
      courierName: body.courierName,
      amount: Number(body.amount),
      occurredAt: body.occurredAt,
      note: body.note,
    })
    return NextResponse.json({ success: true, data: movement }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hata'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
