"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Banknote, Clock, CheckCircle2, Wallet } from "lucide-react"
import type { BranchCashSummary } from "../_types"

interface Props {
  summary: BranchCashSummary
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
    key: "toplamSubeBorcu" as const,
    label: "Toplam Şube Borcu",
    icon: Banknote,
    iconWrapClass: "bg-red-50 text-red-600 border-red-200",
    valueClass: "text-red-600",
    format: (s: BranchCashSummary) => formatMoney(s.toplamSubeBorcu),
  },
  {
    key: "onayBekleyenTransfer" as const,
    label: "Onay Bekleyen Transfer",
    icon: Clock,
    iconWrapClass: "bg-amber-50 text-amber-600 border-amber-200",
    valueClass: "text-amber-600",
    format: (s: BranchCashSummary) => String(s.onayBekleyenTransfer),
  },
  {
    key: "onayBekleyenTransferToplami" as const,
    label: "Onay Bekleyen Transfer Toplamı",
    icon: Wallet,
    iconWrapClass: "bg-orange-50 text-orange-600 border-orange-200",
    valueClass: "text-orange-700",
    format: (s: BranchCashSummary) => formatMoney(s.onayBekleyenTransferToplami),
  },
  {
    key: "son30GunOnaylanan" as const,
    label: "Son 30 Gün Onaylanan",
    icon: CheckCircle2,
    iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    valueClass: "text-emerald-700",
    format: (s: BranchCashSummary) => formatMoney(s.son30GunOnaylanan),
  },
]

export function BranchCashSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
