import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PriceBreakdownRow } from "../_types"

interface Props {
  rows: PriceBreakdownRow[]
}

export function SimulationPriceBreakdown({ rows }: Props) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Fiyat Kırılımı</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-lg px-3 py-2 even:bg-slate-50">
            <span className={row.highlight ? "font-semibold text-slate-900" : "text-sm text-slate-600"}>{row.label}</span>
            <span className={row.highlight ? "text-base font-semibold text-slate-900" : "text-sm font-medium text-slate-700"}>
              {row.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
