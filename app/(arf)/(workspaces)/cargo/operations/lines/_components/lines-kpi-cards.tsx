import { Card, CardContent } from "@/components/ui/card"
import { GitBranch, MapPin, Route } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LineListKpi } from "../_types"

interface Props {
  kpi: LineListKpi
}

export function LinesKpiCards({ kpi }: Props) {
  const items = [
    {
      title: "Toplam Ana Hat",
      value: new Intl.NumberFormat("tr-TR").format(kpi.totalMain),
      icon: Route,
      iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
      valueClass: "text-foreground",
    },
    {
      title: "Toplam Merkez Hat",
      value: new Intl.NumberFormat("tr-TR").format(kpi.totalHub),
      icon: GitBranch,
      iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
      valueClass: "text-foreground",
    },
    {
      title: "Toplam Ara Hat",
      value: new Intl.NumberFormat("tr-TR").format(kpi.totalFeeder),
      icon: MapPin,
      iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
      valueClass: "text-foreground",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((card) => (
        <Card key={card.title} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">{card.title}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular-nums leading-tight", card.valueClass)}>{card.value}</p>
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
