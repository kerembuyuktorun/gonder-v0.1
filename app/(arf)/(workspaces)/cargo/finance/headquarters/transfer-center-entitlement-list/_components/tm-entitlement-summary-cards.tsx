"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle2, Package, Percent } from "lucide-react"
import type { TmEntitlementSummary } from "../_types"

interface Props {
  summary: TmEntitlementSummary
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const cards = [
  {
    key: "parcaBasiToplam" as const,
    label: "Parça Başı Toplam",
    icon: Package,
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
    valueClass: "text-foreground",
    format: (s: TmEntitlementSummary) => formatMoney(s.parcaBasiToplam),
  },
  {
    key: "yuzdelikToplam" as const,
    label: "Yüzdelik Toplam",
    icon: Percent,
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
    valueClass: "text-foreground",
    format: (s: TmEntitlementSummary) => formatMoney(s.yuzdelikToplam),
  },
  {
    key: "netToplamHakedis" as const,
    label: "Net Toplam Hakediş",
    icon: CheckCircle2,
    iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    valueClass: "text-emerald-700",
    format: (s: TmEntitlementSummary) => formatMoney(s.netToplamHakedis),
  },
]

export function TmEntitlementSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{card.label}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular-nums leading-tight", card.valueClass)}>
                  {card.format(summary)}
                </p>
              </div>
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl border", card.iconWrapClass)}>
                <card.icon className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
