import { NextResponse } from 'next/server'
import {
  createInvoice,
  listInvoices,
  type CreateInvoiceInput,
} from '../_lib/finance/invoice-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await listInvoices(auth.tenantId)
  return NextResponse.json({ success: true, data: { items } })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as CreateInvoiceInput | null
  if (!body?.customerId || !body.customerName || !body.issueDate || !body.dueDate || !body.source) {
    return NextResponse.json({ success: false, error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ success: false, error: 'lines zorunlu' }, { status: 400 })
  }
  try {
    const invoice = await createInvoice(auth.tenantId, body)
    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hata'
    if (msg.startsWith('ORDER_ALREADY_INVOICED:')) {
      return NextResponse.json(
        { success: false, error: 'Sipariş zaten faturalı', code: 'ORDER_ALREADY_INVOICED' },
        { status: 409 }
      )
    }
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
