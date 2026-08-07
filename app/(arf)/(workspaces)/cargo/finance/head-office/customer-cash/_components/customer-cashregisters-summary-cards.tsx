"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Banknote, FileText, AlertCircle, Clock, TrendingUp } from "lucide-react"
import type { CustomerCashregisterSummary } from "../_types"

interface Props {
  summary: CustomerCashregisterSummary
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
    key: "toplamAlacak" as const,
    label: "Toplam Alacak",
    icon: Banknote,
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
    valueClass: "text-foreground",
    format: (s: CustomerCashregisterSummary) => formatMoney(s.toplamAlacak),
  },
  {
    key: "toplamFaturalanmis" as const,
    label: "Toplam Faturalanmış",
    icon: FileText,
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
    valueClass: "text-foreground",
    format: (s: CustomerCashregisterSummary) => formatMoney(s.toplamFaturalanmis),
  },
  {
    key: "toplamAcikta" as const,
    label: "Toplam Açıkta",
    icon: AlertCircle,
    iconWrapClass: "bg-amber-50 text-amber-600 border-amber-200",
    valueClass: "text-amber-700",
    format: (s: CustomerCashregisterSummary) => formatMoney(s.toplamAcikta),
  },
  {
    key: "toplamGecikmis" as const,
    label: "Toplam Gecikmiş",
    icon: Clock,
    iconWrapClass: "bg-red-50 text-red-600 border-red-200",
    valueClass: "text-red-600",
    format: (s: CustomerCashregisterSummary) => formatMoney(s.toplamGecikmis),
  },
  {
    key: "tahsilatPerformansi" as const,
    label: "Tahsilat Performansı",
    icon: TrendingUp,
    iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    valueClass: "text-emerald-700",
    format: (s: CustomerCashregisterSummary) => `%${s.tahsilatPerformansi}`,
  },
]

export function CustomerCashregistersSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
