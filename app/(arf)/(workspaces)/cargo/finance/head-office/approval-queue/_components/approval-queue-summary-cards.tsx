"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Clock3, Wallet } from "lucide-react"
import type { ApprovalQueueSummary } from "../_types"

interface Props {
  summary: ApprovalQueueSummary
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
    key: "bekleyenAdet" as const,
    label: "Bekleyen Onay",
    icon: Clock3,
    iconWrapClass: "bg-amber-50 text-amber-600 border-amber-200",
    valueClass: "text-amber-700",
    value: (summary: ApprovalQueueSummary) => String(summary.bekleyenAdet),
  },
  {
    key: "bekleyenToplam" as const,
    label: "Bekleyen Transfer Toplamı",
    icon: Wallet,
    iconWrapClass: "bg-orange-50 text-orange-600 border-orange-200",
    valueClass: "text-orange-700",
    value: (summary: ApprovalQueueSummary) => formatMoney(summary.bekleyenToplam),
  },
]

export function ApprovalQueueSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
