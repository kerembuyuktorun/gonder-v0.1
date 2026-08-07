import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Route, Timer, Waypoints } from "lucide-react"
import type { LineRecord } from "../_types"
import { LineTypeBadge } from "./line-type-badge"

interface Props {
  line: LineRecord
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function LineProfileSection({ line }: Props) {
  const firstStop = line.stops[0]?.locationName ?? "-"
  const lastStop = line.stops[line.stops.length - 1]?.locationName ?? "-"

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Route className="size-4 text-slate-400" />
          Hat Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <section className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Hat Adı</dt>
              <dd className="text-sm font-medium text-slate-900">{line.name}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Hat Türü</dt>
              <dd className="mt-1">
                <LineTypeBadge type={line.type} />
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Durum</dt>
              <dd className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    line.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }
                >
                  {line.status === "active" ? "Aktif" : "Pasif"}
                </Badge>
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <Waypoints className="size-3" /> Durak Sayısı
              </dt>
              <dd className="text-sm font-medium text-slate-900">{line.stops.length}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <Timer className="size-3" /> Planlanan Saatler
              </dt>
              <dd className="text-sm font-medium text-slate-900">
                {line.schedule.plannedDepartureTime} → {line.schedule.plannedArrivalTime}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">İlk Durak</dt>
              <dd className="text-sm font-medium text-slate-900">{firstStop}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Son Durak</dt>
              <dd className="text-sm font-medium text-slate-900">{lastStop}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays className="size-3" /> Oluşturulma Zamanı
              </dt>
              <dd className="text-sm font-medium text-slate-900">{formatDate(line.createdAt)}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Son Güncelleme</dt>
              <dd className="text-sm font-medium text-slate-900">{formatDate(line.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}
