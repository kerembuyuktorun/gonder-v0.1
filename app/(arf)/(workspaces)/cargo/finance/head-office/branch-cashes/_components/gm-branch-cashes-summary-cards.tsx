"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Wallet, Clock3, TrendingUp } from "lucide-react"
import type { GmBranchCashSummary } from "../_types"

interface Props {
  summary: GmBranchCashSummary
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
    key: "toplamSubeAlacagi" as const,
    label: "Toplam Şube Alacağı",
    icon: Wallet,
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
    valueClass: "text-foreground",
    value: (summary: GmBranchCashSummary) => formatMoney(summary.toplamSubeAlacagi),
  },
  {
    key: "onayBekleyenTransferAdet" as const,
    label: "Onay Bekleyen Transfer",
    icon: Clock3,
    iconWrapClass: "bg-amber-50 text-amber-600 border-amber-200",
    valueClass: "text-amber-700",
    value: (summary: GmBranchCashSummary) => String(summary.onayBekleyenTransferAdet),
  },
  {
    key: "onayBekleyenTransferToplami" as const,
    label: "Onay Bekleyen Transfer Toplamı",
    icon: Clock3,
    iconWrapClass: "bg-orange-50 text-orange-600 border-orange-200",
    valueClass: "text-orange-700",
    value: (summary: GmBranchCashSummary) => formatMoney(summary.onayBekleyenTransferToplami),
  },
  {
    key: "son30GunOnaylananToplam" as const,
    label: "Son 30 Gün Onaylanan",
    icon: TrendingUp,
    iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    valueClass: "text-emerald-700",
    value: (summary: GmBranchCashSummary) => formatMoney(summary.son30GunOnaylananToplam),
  },
]

export function GmBranchCashesSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{card.label}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular-nums leading-tight", card.valueClass)}>
                  {card.value(summary)}
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
