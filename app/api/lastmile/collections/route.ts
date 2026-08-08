import { NextResponse } from 'next/server'
import {
  createCollection,
  listCollections,
} from '../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'
import type { CollectionStatus } from '../../../(arf)/(workspaces)/lastmile/finance/_types'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { searchParams } = new URL(request.url)
  const data = await listCollections(auth.tenantId, {
    customerId: searchParams.get('customerId') ?? undefined,
    status: (searchParams.get('status') as CollectionStatus | null) ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  })
  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as {
    customerId?: string
    customerName?: string
    orderId?: string
    amount?: number
    method?: 'nakit' | 'havale' | 'kart' | 'diger' | 'kapida'
    paidAt?: string
    note?: string
  } | null
  if (!body?.customerId || body.amount == null || !body.method || !body.paidAt) {
    return NextResponse.json(
      { success: false, error: 'customerId, amount, method, paidAt zorunlu' },
      { status: 400 }
    )
  }
  const entry = await createCollection(auth.tenantId, {
    customerId: body.customerId,
    customerName: body.customerName,
    orderId: body.orderId,
    amount: Number(body.amount),
    method: body.method,
    paidAt: body.paidAt,
    note: body.note,
  })
  return NextResponse.json({ success: true, data: entry }, { status: 201 })
}
