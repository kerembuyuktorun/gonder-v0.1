import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PriceListSimulationResult } from "../_types"
import { SimulationMatchedRuleCard } from "./simulation-matched-rule-card"

interface Props {
  result: PriceListSimulationResult
}

export function SimulationResultCard({ result }: Props) {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardHeader>
          <CardTitle className="text-base">Hesaplama Sonucu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Taşıma Ücreti</p>
            <p className="text-xl font-semibold text-slate-900">
              {result.transportFee.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">KDV (%20)</p>
            <p className="text-xl font-semibold text-slate-900">
              {result.kdvAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Genel Toplam</p>
            <p className="text-2xl font-bold text-emerald-700">
              {result.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </p>
          </div>
        </CardContent>
      </Card>

      <SimulationMatchedRuleCard priceList={result.matchedPriceList} rule={result.matchedRule} />
    </div>
  )
}
