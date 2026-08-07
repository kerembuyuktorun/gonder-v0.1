import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MatchedPriceRule, PriceListSummary } from "../_types"

interface Props {
  priceList: PriceListSummary
  rule: MatchedPriceRule
}

export function SimulationMatchedRuleCard({ priceList, rule }: Props) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Eşleşen Fiyat Tanımı</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Fiyat Listesi</p>
          <p className="text-xs text-slate-500">{priceList.code}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Mesafe Tanımı</p>
          <p className="font-medium">{rule.distanceDefinitionName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Gönderici</p>
          <p>{rule.originLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Alıcı</p>
          <p>{rule.destinationLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Desi Aralığı</p>
          <p className="font-medium">
            {rule.desiStart} - {rule.desiEnd}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Kargo Tipi</p>
          <p className="font-medium">{rule.shipmentType === "mixed" ? "Karma" : rule.shipmentType}</p>
        </div>
      </CardContent>
    </Card>
  )
}
