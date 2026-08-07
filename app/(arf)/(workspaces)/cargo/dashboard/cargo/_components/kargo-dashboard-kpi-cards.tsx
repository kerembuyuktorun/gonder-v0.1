"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { KargoDashboardKpi } from "../_types/kargo-dashboard"

const iconMap: Record<string, typeof Package> = {
  "Toplam Kargo": Package,
  "Teslim Edilen": CheckCircle2,
  "Dağıtımda": Truck,
  "Beklemede": Clock,
  "İptal Edilen": XCircle,
  "Teslimat Oranı": Target,
}

interface Props {
  kpiCards: KargoDashboardKpi[]
}

export function KargoDashboardKpiCards({ kpiCards }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((stat) => {
        const Icon = iconMap[stat.title] ?? Package
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                {stat.change && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : stat.changeType === "negative"
                          ? "border-red-500/20 bg-red-500/10 text-red-600"
                          : "border-slate-500/20 bg-slate-500/10 text-slate-600"
                    }`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="mr-1 size-3" />
                    ) : stat.changeType === "negative" ? (
                      <ArrowDownRight className="mr-1 size-3" />
                    ) : null}
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                  {stat.suffix && <span className="text-sm font-medium text-muted-foreground">{stat.suffix}</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.title} · {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
