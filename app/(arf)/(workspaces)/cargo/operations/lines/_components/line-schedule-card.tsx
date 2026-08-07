import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WORKDAY_LABELS, type LineRecord } from "../_types"

interface Props {
  line: LineRecord
}

export function LineScheduleCard({ line }: Props) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Operasyonel Zamanlama</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Çalışma Günleri</p>
          <div className="flex flex-wrap gap-2">
            {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((day) => {
              const active = line.schedule.workDays.includes(day)
              return (
                <Badge
                  key={day}
                  variant="outline"
                  className={
                    active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }
                >
                  {WORKDAY_LABELS[day]}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Sefer Kalkış Saati</p>
            <p className="text-lg font-semibold text-slate-900">{line.schedule.plannedDepartureTime}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Planlanan Varış Saati</p>
            <p className="text-lg font-semibold text-slate-900">{line.schedule.plannedArrivalTime}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
