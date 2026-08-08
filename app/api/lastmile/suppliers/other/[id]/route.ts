import { NextResponse } from 'next/server'
import {
  deleteOtherSupplier,
  getOtherSupplier,
  updateOtherSupplier,
} from '../../../_lib/finance/supplier-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'
import type { UpsertOtherSupplierInput } from '../../../../../(arf)/(workspaces)/lastmile/finance/_types/supplier'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const item = await getOtherSupplier(auth.tenantId, id)
  if (!item) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as UpsertOtherSupplierInput | null
  if (!body?.unvan?.trim()) {
    return NextResponse.json({ success: false, error: 'unvan zorunlu' }, { status: 400 })
  }
  const updated = await updateOtherSupplier(auth.tenantId, id, body)
  if (!updated) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const ok = await deleteOtherSupplier(auth.tenantId, id)
  if (!ok) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: { ok: true } })
}
