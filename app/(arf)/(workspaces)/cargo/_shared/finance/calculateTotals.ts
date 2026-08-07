import { calculateKdv } from "./calculateKdv"
import { calculateTevkifat } from "./calculateTevkifat"

export type FinanceWithholdingBase = "base" | "kdv"

export interface FinanceTotalsInput {
  baseAmount: number
  kdvRate: number
  tevkifat: string
  withholdingBase: FinanceWithholdingBase
}

export interface FinanceTotals {
  kdvTutar: number
  tevkifatTutar: number
  toplamTutar: number
}

export function calculateTotals({ baseAmount, kdvRate, tevkifat, withholdingBase }: FinanceTotalsInput): FinanceTotals {
  if (withholdingBase === "kdv") {
    const kdvTutar = calculateKdv(baseAmount, kdvRate)
    const tevkifatTutar = calculateTevkifat(kdvTutar, tevkifat)

    return {
      kdvTutar,
      tevkifatTutar,
      toplamTutar: baseAmount + kdvTutar - tevkifatTutar,
    }
  }

  const tevkifatTutar = calculateTevkifat(baseAmount, tevkifat)
  const taxableAmount = baseAmount - tevkifatTutar
  const kdvTutar = calculateKdv(taxableAmount, kdvRate)

  return {
    kdvTutar,
    tevkifatTutar,
    toplamTutar: taxableAmount + kdvTutar,
  }
}
