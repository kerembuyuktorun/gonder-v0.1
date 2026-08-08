import { NextResponse } from 'next/server'
import {
  getCourierPayoutTerms,
  setCourierPayoutTerms,
} from '../../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'
import type { PayoutCycle } from '../../../../../(arf)/(workspaces)/lastmile/finance/_types'

type Ctx = { params: Promise<{ courierId: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const row = await getCourierPayoutTerms(auth.tenantId, courierId)
  return NextResponse.json({ success: true, data: row ?? null })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const body = (await request.json().catch(() => null)) as {
    payoutCycle?: PayoutCycle
    weeklyPayoutDay?: number
    monthlyPayoutDay?: number
    creditDays?: number
    notes?: string
  } | null
  if (!body?.payoutCycle) {
    return NextResponse.json({ success: false, error: 'payoutCycle zorunlu' }, { status: 400 })
  }
  try {
    const row = await setCourierPayoutTerms(auth.tenantId, courierId, {
      payoutCycle: body.payoutCycle,
      weeklyPayoutDay: body.weeklyPayoutDay,
      monthlyPayoutDay: body.monthlyPayoutDay,
      creditDays: body.creditDays,
      notes: body.notes,
    })
    return NextResponse.json({ success: true, data: row })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hata'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
