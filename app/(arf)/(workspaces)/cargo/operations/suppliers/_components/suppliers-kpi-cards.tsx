import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Building2, CheckCircle2, PowerOff } from "lucide-react"
import type { SupplierListKpi } from "../_types"

interface Props {
  kpi: SupplierListKpi
}

const ITEMS: Array<{
  key: keyof SupplierListKpi
  label: string
  valueClass: string
  iconWrapClass: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    key: "total",
    label: "Toplam Tedarikçi",
    icon: Building2,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "active",
    label: "Aktif",
    icon: CheckCircle2,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "passive",
    label: "Pasif",
    icon: PowerOff,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
]

export function SuppliersKpiCards({ kpi }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <Card key={item.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{item.label}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular-nums leading-tight", item.valueClass)}>{kpi[item.key]}</p>
              </div>
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl border", item.iconWrapClass)}>
                <item.icon className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
