import { NextResponse } from 'next/server'
import { listCourierEarnings } from '../_lib/finance/courier-cost-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response
  const { searchParams } = new URL(request.url)
  const items = await listCourierEarnings(
    auth.tenantId,
    searchParams.get('courierId') ?? undefined
  )
  return NextResponse.json({ success: true, data: { items } })
}
