import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STOP_OPERATION_LABELS, type LineRecord } from "../_types"

interface Props {
  line: LineRecord
}

export function LineDetailTimeline({ line }: Props) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Güzergah ve İşlem Durakları</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {line.stops.map((stop, index) => (
            <li key={stop.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">
                  {index + 1}. Durak: {stop.locationName}
                </p>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {STOP_OPERATION_LABELS[stop.operationType]}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
