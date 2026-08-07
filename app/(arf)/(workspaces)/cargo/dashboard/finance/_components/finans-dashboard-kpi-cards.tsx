"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Wallet,
  CreditCard,
  AlertTriangle,
  Receipt,
  ArrowUpDown,
} from "lucide-react"
import type { FinansDashboardKpi } from "../_types/finans-dashboard"

const iconMap: Record<string, React.ElementType> = {
  "Toplam Gelir": TrendingUp,
  "Tahsil Edilen": Wallet,
  "Açık Bakiye": CreditCard,
  "Geciken Alacak": AlertTriangle,
  "Toplam Gider": Receipt,
  "Net Nakit Akışı": ArrowUpDown,
}

interface Props {
  kpiCards: FinansDashboardKpi[]
}

export function FinansDashboardKpiCards({ kpiCards }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((kpi) => {
        const Icon = iconMap[kpi.label] ?? Wallet
        return (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {kpi.label}
                  </span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {kpi.value}
                  </span>
                </div>
              </div>
              {kpi.change && (
                <div className="mt-3">
                  <Badge
                    variant="outline"
                    className={
                      kpi.changeType === "positive"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : kpi.changeType === "negative"
                          ? "border-red-500/20 bg-red-500/10 text-red-600"
                          : "border-slate-500/20 bg-slate-500/10 text-slate-600"
                    }
                  >
                    <span className="text-xs font-medium">{kpi.change}</span>
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
