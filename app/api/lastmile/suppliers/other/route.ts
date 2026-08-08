import { NextResponse } from 'next/server'
import {
  createOtherSupplier,
  listOtherSuppliers,
} from '../../_lib/finance/supplier-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'
import type { UpsertOtherSupplierInput } from '../../../../(arf)/(workspaces)/lastmile/finance/_types/supplier'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listOtherSuppliers(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as UpsertOtherSupplierInput | null
  if (!body?.unvan?.trim()) {
    return NextResponse.json({ success: false, error: 'unvan zorunlu' }, { status: 400 })
  }
  const created = await createOtherSupplier(auth.tenantId, body)
  return NextResponse.json({ success: true, data: created }, { status: 201 })
}
