import { NextResponse } from 'next/server'
import {
  getCourierCostAssignment,
  setCourierCostAssignment,
} from '../../../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'

type Ctx = { params: Promise<{ courierId: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const row = await getCourierCostAssignment(auth.tenantId, courierId)
  return NextResponse.json({ success: true, data: row ?? null })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { courierId } = await context.params
  const body = (await request.json().catch(() => null)) as { costListId?: string | null } | null
  const row = await setCourierCostAssignment(
    auth.tenantId,
    courierId,
    body?.costListId === undefined ? null : body.costListId
  )
  return NextResponse.json({ success: true, data: row ?? null })
}
