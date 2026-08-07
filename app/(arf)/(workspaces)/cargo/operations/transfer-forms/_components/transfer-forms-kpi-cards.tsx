import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ClipboardList, FileStack, Package } from "lucide-react"
import { formatNumber } from "../_lib/transfer-form-helpers"
import type { TransferFormListKpi } from "../_types"

interface Props {
  kpi: TransferFormListKpi
}

const ITEMS: Array<{
  key: keyof TransferFormListKpi
  label: string
  icon: React.ComponentType<{ className?: string }>
  valueClass: string
  iconWrapClass: string
  format?: (v: number) => string
}> = [
  {
    key: "totalKtf",
    label: "Toplam KTF",
    icon: ClipboardList,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "totalOpen",
    label: "Açık KTF",
    icon: FileStack,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "totalConsignments",
    label: "Toplam Zimmetlenen Parça",
    icon: Package,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
]

export function TransferFormsKpiCards({ kpi }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ITEMS.map((item) => (
        <Card key={item.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{item.label}</p>
                <p className={cn("mt-1 text-xl leading-tight font-semibold tabular-nums", item.valueClass)}>
                  {formatNumber(kpi[item.key])}
                </p>
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
