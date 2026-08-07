import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Ban, CheckCircle2, Clock3, Package, Truck } from "lucide-react"
import type { TripListKpi } from "../_types"
import { formatNumber } from "../_lib/trip-status-helpers"

interface Props {
  kpi: TripListKpi
}

const ITEMS: Array<{
  key: keyof TripListKpi
  label: string
  icon: React.ComponentType<{ className?: string }>
  valueClass: string
  iconWrapClass: string
}> = [
  {
    key: "total",
    label: "Toplam",
    icon: Package,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "onRoad",
    label: "Yolda",
    icon: Truck,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "waiting",
    label: "Bekleyen",
    icon: Clock3,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "completed",
    label: "Tamamlanan",
    icon: CheckCircle2,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
  {
    key: "cancelled",
    label: "İptal Edilen",
    icon: Ban,
    valueClass: "text-foreground",
    iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
  },
]

export function TripsKpiCards({ kpi }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {ITEMS.map((item) => (
        <Card key={item.key} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{item.label}</p>
                <p className={cn("mt-1 text-xl leading-tight font-semibold tabular-nums", item.valueClass)}>{formatNumber(kpi[item.key])}</p>
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
