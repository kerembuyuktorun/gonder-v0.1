import { NextResponse } from 'next/server'
import {
  createCourierCostList,
  listCourierCostLists,
  type UpsertCourierCostListInput,
} from '../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listCourierCostLists(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as UpsertCourierCostListInput | null
  if (!body?.name?.trim() || !body.distanceStructure) {
    return NextResponse.json(
      { success: false, error: 'name ve distanceStructure zorunlu' },
      { status: 400 }
    )
  }
  const created = await createCourierCostList(auth.tenantId, body)
  return NextResponse.json({ success: true, data: created }, { status: 201 })
}
