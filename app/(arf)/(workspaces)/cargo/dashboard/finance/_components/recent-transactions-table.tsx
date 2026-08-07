"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, Award, ArrowRightLeft } from "lucide-react"
import type { RecentFinansRow } from "../_types/finans-dashboard"

const typeIcons: Record<RecentFinansRow["type"], React.ElementType> = {
  fatura: FileText,
  gider: Receipt,
  hakedis: Award,
  transfer: ArrowRightLeft,
}

const typeLabels: Record<RecentFinansRow["type"], string> = {
  fatura: "Fatura",
  gider: "Gider",
  hakedis: "Hakediş",
  transfer: "Transfer",
}

interface Props {
  transactions: RecentFinansRow[]
}

export function RecentTransactionsTable({ transactions }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Son Finansal İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tür
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Açıklama
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Tutar
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Durum
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const Icon = typeIcons[tx.type]
                return (
                  <tr
                    key={tx.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[tx.type]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      ₺{tx.amount.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={tx.statusColor}>
                        {tx.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
