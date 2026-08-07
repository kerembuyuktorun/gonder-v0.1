import { listCollections } from '../_api/pricing-api'
import { formatCurrency } from '../_lib/format'

export type CariBalanceLabel = 'tahsil_edilecek' | 'odenecek' | 'sifir'

export type CariBalance = {
  amount: number
  label: CariBalanceLabel
}

export function classifyBalance(signedAmount: number): CariBalance {
  if (Math.abs(signedAmount) < 0.005) {
    return { amount: 0, label: 'sifir' }
  }
  if (signedAmount > 0) {
    return { amount: signedAmount, label: 'tahsil_edilecek' }
  }
  return { amount: Math.abs(signedAmount), label: 'odenecek' }
}

export function balanceLabelText(label: CariBalanceLabel) {
  switch (label) {
    case 'tahsil_edilecek':
      return 'Tahsil Edilecek'
    case 'odenecek':
      return 'Ödenecek'
    default:
      return ''
  }
}

export function formatBalanceAmount(balance: CariBalance) {
  return formatCurrency(balance.amount)
}

/** Müşteri açık bakiyeleri (tahsil edilecek = pozitif). */
export async function getCustomerOpenBalances(): Promise<Record<string, number>> {
  const { payments } = await listCollections()
  const map: Record<string, number> = {}
  for (const payment of payments) {
    const open = Math.max(0, payment.amountDue - payment.amountPaid)
    if (open <= 0) continue
    map[payment.customerId] = (map[payment.customerId] ?? 0) + open
  }
  return map
}
