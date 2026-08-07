"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RecentTripRow } from "../_types/operasyon-dashboard"

const statusConfig: Record<
  RecentTripRow["status"],
  { label: string; className: string }
> = {
  on_road: {
    label: "Yolda",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-600",
  },
  created: {
    label: "Bekliyor",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  },
  completed: {
    label: "Tamamlandı",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  cancelled: {
    label: "İptal",
    className: "border-red-500/20 bg-red-500/10 text-red-600",
  },
}

const lineTypeLabels: Record<RecentTripRow["lineType"], string> = {
  main: "Ana Hat",
  hub: "Merkez Hat",
  feeder: "Ara Hat",
}

const lineTypeColors: Record<RecentTripRow["lineType"], string> = {
  main: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  hub: "border-purple-500/20 bg-purple-500/10 text-purple-600",
  feeder: "border-amber-500/20 bg-amber-500/10 text-amber-600",
}

interface Props {
  trips: RecentTripRow[]
}

export function RecentTripsTable({ trips }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Son Seferler</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Sefer No
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Hat
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Hat Tipi
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tedarikçi
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Plaka
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Parça
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Desi
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => {
                const sc = statusConfig[trip.status]
                return (
                  <tr
                    key={trip.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{trip.tripNo}</td>
                    <td className="px-4 py-3">{trip.lineName}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={lineTypeColors[trip.lineType]}
                      >
                        {lineTypeLabels[trip.lineType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {trip.supplierName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {trip.vehiclePlate}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {trip.totalPackageCount.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {trip.totalDesi.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={sc.className}>
                        {sc.label}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
