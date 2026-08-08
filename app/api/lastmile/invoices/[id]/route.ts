import { NextResponse } from 'next/server'
import { getInvoice, patchInvoiceStatus } from '../../_lib/finance/invoice-service'
import { requireFinanceAuth } from '../../_lib/finance/tenant'
import type { LastmileInvoice } from '../../../../(arf)/(workspaces)/lastmile/finance/_types/invoice'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const invoice = await getInvoice(auth.tenantId, id)
  if (!invoice) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: invoice })
}

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: LastmileInvoice['status'] } | null
  if (!body?.status || !['taslak', 'kesildi', 'iptal'].includes(body.status)) {
    return NextResponse.json({ success: false, error: 'status geçersiz' }, { status: 400 })
  }
  const updated = await patchInvoiceStatus(auth.tenantId, id, body.status)
  if (!updated) return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}
