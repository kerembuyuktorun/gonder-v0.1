"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Building2, CheckCircle2, Clock3, Wallet } from "lucide-react"
import type { BankAccountRecord } from "../_types"

interface Props {
  rows: BankAccountRecord[]
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function BankAccountsSummaryCards({ rows }: Props) {
  const activeCount = rows.filter((item) => item.status === "active").length
  const totalBalance = rows.reduce((sum, item) => sum + item.balance, 0)

  const oldestSyncDate = rows
    .map((item) => item.lastDataSyncAt)
    .filter((value): value is string => Boolean(value))
    .reduce<string | undefined>((oldest, current) => {
      if (!oldest) {
        return current
      }

      return new Date(current).getTime() < new Date(oldest).getTime() ? current : oldest
    }, undefined)

  const cards = [
    {
      key: "total" as const,
      label: "Toplam Hesap",
      icon: Building2,
      iconWrapClass: "bg-blue-50 text-blue-600 border-blue-200",
      valueClass: "text-slate-900",
      value: String(rows.length),
    },
    {
      key: "active" as const,
      label: "Aktif Hesap",
      icon: CheckCircle2,
      iconWrapClass: "bg-lime-50 text-lime-600 border-lime-200",
      valueClass: "text-lime-700",
      value: String(activeCount),
    },
    {
      key: "balance" as const,
      label: "Toplam Bakiye",
      icon: Wallet,
      iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
      valueClass: "text-emerald-700",
      value: formatMoney(totalBalance, "TRY"),
    },
    {
      key: "lastSync" as const,
      label: "En Eski Veri Güncelleme",
      icon: Clock3,
      iconWrapClass: "bg-violet-50 text-violet-600 border-violet-200",
      valueClass: "text-violet-700",
      value: formatDateTime(oldestSyncDate),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{card.label}</p>
                <p className={cn("mt-1 truncate text-xl font-semibold tabular-nums leading-tight", card.valueClass)}>
                  {card.value}
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