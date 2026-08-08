import { NextResponse } from 'next/server'
import { readTenantJson } from '../../_lib/finance/fs-json-store'
import { requireFinanceAuth } from '../../_lib/finance/tenant'
import type { CustomerPricingAssignment } from '../../../../(arf)/(workspaces)/lastmile/finance/_types'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const items = await readTenantJson<CustomerPricingAssignment[]>(
    auth.tenantId,
    'assignments.json',
    []
  )
  return NextResponse.json({ success: true, data: { items } })
}
