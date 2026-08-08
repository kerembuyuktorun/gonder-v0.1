import { NextResponse } from 'next/server'
import {
  getCustomerPaymentTerms,
  setCustomerPaymentTerms,
} from '../../../_lib/finance/pricing-catalog-service'
import { requireFinanceAuth } from '../../../_lib/finance/tenant'
import type { CustomerPaymentTerms } from '../../../../../(arf)/(workspaces)/lastmile/finance/_types'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const row = await getCustomerPaymentTerms(auth.tenantId, id)
  return NextResponse.json({ success: true, data: row ?? null })
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as Omit<
    CustomerPaymentTerms,
    'customerId' | 'updatedAt'
  > | null
  if (!body?.settlementType || body.creditDays == null || !body.billingCycle) {
    return NextResponse.json(
      { success: false, error: 'settlementType, creditDays, billingCycle zorunlu' },
      { status: 400 }
    )
  }
  const row = await setCustomerPaymentTerms(auth.tenantId, id, body)
  return NextResponse.json({ success: true, data: row })
}
