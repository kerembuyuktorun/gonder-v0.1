"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { ExpenseSummary } from "../_types/expense"

interface Props {
  summary: ExpenseSummary
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface SummaryCardProps {
  label: string
  value: string
  icon: React.ReactNode
  iconClassName?: string
  valueClass?: string
}

function SummaryCard({ label, value, icon, iconClassName, valueClass }: SummaryCardProps) {
  return (
    <Card className="rounded-xl border border-slate-200 bg-slate-50/60 shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-slate-500">{label}</p>
          <p className={cn("truncate text-base font-semibold text-slate-900", valueClass)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExpensesSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Toplam Gider"
        value={formatMoney(summary.totalAmount)}
        icon={<FileText className="size-5" />}
      />
      <SummaryCard
        label="Ödenen Tutar"
        value={formatMoney(summary.paidAmount)}
        icon={<CheckCircle2 className="size-5" />}
        iconClassName="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
        valueClass="text-emerald-700"
      />
      <SummaryCard
        label="Ödenmemiş Tutar"
        value={formatMoney(summary.unpaidAmount)}
        icon={<Clock className="size-5" />}
        iconClassName={summary.unpaidAmount > 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-600" : undefined}
        valueClass={summary.unpaidAmount > 0 ? "text-amber-700" : undefined}
      />
      <SummaryCard
        label="Gecikmiş"
        value={summary.overdueCount > 0 ? `${summary.overdueCount} Fatura · ${formatMoney(summary.overdueAmount)}` : "Yok"}
        icon={<AlertTriangle className="size-5" />}
        iconClassName={summary.overdueCount > 0 ? "border-rose-500/20 bg-rose-500/10 text-rose-600" : undefined}
        valueClass={summary.overdueCount > 0 ? "text-rose-700" : undefined}
      />
    </div>
  )
}
