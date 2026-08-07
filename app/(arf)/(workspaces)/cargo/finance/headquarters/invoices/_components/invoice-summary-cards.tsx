"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Banknote, CreditCard, AlertCircle, Clock, FileText } from "lucide-react"
import { fetchInvoiceSummary } from "../_api/invoices-api"
import type { InvoiceSummary } from "../_types/invoice"

interface Props {
  summary: InvoiceSummary
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

export function InvoiceSummaryCards({ summary }: Props) {
  const [currentSummary, setCurrentSummary] = useState(summary)

  useEffect(() => {
    const refresh = () => {
      void fetchInvoiceSummary().then(setCurrentSummary)
    }

    refresh()
    window.addEventListener("arf-headquarters-invoices-updated", refresh)

    return () => {
      window.removeEventListener("arf-headquarters-invoices-updated", refresh)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <SummaryCard
        label="Toplam Fatura Tutarı"
        value={formatMoney(currentSummary.totalAmount)}
        icon={<FileText className="size-5" />}
      />
      <SummaryCard
        label="Toplam Tahsilat"
        value={formatMoney(currentSummary.totalPaid)}
        icon={<Banknote className="size-5" />}
        iconClassName="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
        valueClass="text-emerald-700"
      />
      <SummaryCard
        label="Açık Alacak"
        value={formatMoney(currentSummary.openBalance)}
        icon={<CreditCard className="size-5" />}
        iconClassName={currentSummary.openBalance > 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-600" : undefined}
        valueClass={currentSummary.openBalance > 0 ? "text-amber-700" : undefined}
      />
      <SummaryCard
        label="Gecikmiş Alacak"
        value={formatMoney(currentSummary.overdueBalance)}
        icon={<AlertCircle className="size-5" />}
        iconClassName={currentSummary.overdueBalance > 0 ? "border-rose-500/20 bg-rose-500/10 text-rose-600" : undefined}
        valueClass={currentSummary.overdueBalance > 0 ? "text-rose-600" : undefined}
      />
        <SummaryCard
          label="Toplam Kesilen"
        value={`${currentSummary.thisMonthCount} Fatura`}
        icon={<Clock className="size-5" />}
      />
    </div>
  )
}
