import {
  AlertTriangle,
  CalendarCheck,
  CircleDollarSign,
  FileText,
} from "lucide-react"
import type { FinancialKpi } from "../_types/financial"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value)

export function FinancialKpiCards({ kpi }: { kpi: FinancialKpi }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Faturalaşmamış"
        value={formatCurrency(kpi.openCargoAmount)}
        icon={FileText}
      />
      <KpiCard
        label="Bekleyen Fatura Alacağı"
        value={formatCurrency(kpi.pendingInvoiceDebt)}
        icon={CircleDollarSign}
      />
      <KpiCard
        label="Gecikmiş Alacak"
        value={formatCurrency(kpi.overdueDebt)}
        icon={AlertTriangle}
        danger={kpi.overdueDebt > 0}
      />
      <KpiCard
        label="Son Tahsilat"
        value={formatCurrency(kpi.lastCollectionAmount)}
        sublabel={kpi.lastCollectionDate !== "-" ? kpi.lastCollectionDate : undefined}
        icon={CalendarCheck}
      />
    </div>
  )
}

function KpiCard({
  label,
  sublabel,
  value,
  icon: Icon,
  danger,
}: {
  label: string
  sublabel?: string
  value: string
  icon: React.ElementType
  danger?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-slate-400">{sublabel}</p>
          )}
        </div>
        <span
          className={
            danger
              ? "inline-flex size-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600"
              : "inline-flex size-7 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary"
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={
          danger
            ? "mt-1 text-xl font-semibold tracking-tight text-rose-600"
            : "mt-1 text-xl font-semibold tracking-tight text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  )
}
