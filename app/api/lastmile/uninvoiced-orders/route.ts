import { NextResponse } from 'next/server'
import { getOrderInvoiceMap } from '../_lib/finance/invoice-service'
import { getOrderPricing } from '../_lib/finance/order-pricing-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'
import { lastmileRest, unwrapListItems } from '../_lib/lastmile-bff'
import type { UninvoicedOrderRow } from '../../../(arf)/(workspaces)/lastmile/finance/_types/invoice'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickStr(...vals: unknown[]) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

/**
 * GET /api/lastmile/uninvoiced-orders?customerId&search
 * Hybrid: upstream orders + finance pricing + invoice map
 */
export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId') ?? undefined
  const search = searchParams.get('search')?.trim().toLowerCase()

  const params = new URLSearchParams({ page: '1', pageSize: '200' })
  if (customerId) params.set('orderOwner', customerId)

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-orders?${params.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  const map = await getOrderInvoiceMap(auth.tenantId)
  const rows: UninvoicedOrderRow[] = []

  if (upstream.ok) {
    for (const item of unwrapListItems(upstream.data)) {
      const o = asRecord(item)
      const id = pickStr(o.id, o.orderId, o.order_id)
      if (!id) continue
      const durum = pickStr(o.durum, o.status, o.aggregatedStatus)
      if (durum === 'iptal_edildi' || durum === 'cancelled') continue
      if (map[id]) continue
      const musteriId = pickStr(o.musteri_id, o.customerId, o.senderCustomerId)
      if (customerId && musteriId && musteriId !== customerId) continue
      const takipNo = pickStr(o.takip_no, o.trackingNo, o.trackingCode)
      const referansNo = pickStr(o.referans_no, o.referenceNo)
      const musteri = pickStr(o.musteri, o.customerName)
      if (search) {
        const hay = `${takipNo} ${referansNo} ${musteri}`.toLowerCase()
        if (!hay.includes(search)) continue
      }

      const pricing = await getOrderPricing(auth.tenantId, id)
      let amount = 0
      let hasPricing = false
      if (pricing?.payment && typeof pricing.payment.amountDue === 'number') {
        amount = pricing.payment.amountDue
        hasPricing = true
      } else if (pricing?.snapshot?.breakdown?.total != null) {
        amount = pricing.snapshot.breakdown.total
        hasPricing = true
      } else if (pricing) {
        hasPricing = true
      }

      rows.push({
        orderId: id,
        takipNo,
        referansNo,
        customerId: musteriId || customerId || '',
        customerName: musteri,
        createdAt: pickStr(o.olusturulma_zamani, o.createdAt),
        amount,
        hasPricing,
        durum: pickStr(o.durum_etiketi, durum),
      })
    }
  }

  return NextResponse.json({ success: true, data: { items: rows } })
}
