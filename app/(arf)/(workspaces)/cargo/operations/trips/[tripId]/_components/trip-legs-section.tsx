"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Boxes, CalendarClock, ChevronDown, CheckCircle2, MapPin, PackageSearch, Printer } from "lucide-react"
import type { TripLegRecord, TripManifestItem } from "../../_types"
import { PLANNED_OPERATION_LABELS, TRIP_LEG_STATUS_CLASSES, TRIP_LEG_STATUS_LABELS, formatDateTime, formatNumber } from "../../_lib/trip-status-helpers"
import { TripManifestSection } from "./trip-manifest-section"

interface Props {
  legs: TripLegRecord[]
  items: TripManifestItem[]
  onPrintTti?: () => void
  onCompleteLeg?: () => void
  isActioning?: boolean
}

export function TripLegsSection({ legs, items, onPrintTti, onCompleteLeg, isActioning }: Props) {
  const [openLegId, setOpenLegId] = useState<string | null>(null)

  function matchesLegOperation(item: TripManifestItem, leg: TripLegRecord) {
    if (leg.plannedOperation === "pickup_only") {
      return item.transportStatus === "loaded"
    }

    if (leg.plannedOperation === "dropoff_only") {
      return item.transportStatus === "unloaded"
    }

    return item.transportStatus === "loaded" || item.transportStatus === "unloaded"
  }

  const legCards = useMemo(
    () =>
      legs.map((leg) => {
        const relatedItems = items.filter((item) => item.relatedLegIds.includes(leg.id) && matchesLegOperation(item, leg))
        const relatedCargoCount = relatedItems.length
        const relatedPieceCount = relatedItems.reduce((total, item) => total + item.totalQuantity, 0)
        const relatedDesi = relatedItems.reduce((total, item) => total + item.totalDesi, 0)

        return {
          leg,
          relatedItems,
          relatedCargoCount,
          relatedPieceCount,
          relatedDesi,
        }
      }),
    [items, legs],
  )

  if (!legCards.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">Ayak kaydı bulunamadı.</div>
  }

  return (
    <div className="space-y-4">
      {legCards.map(({ leg, relatedItems, relatedCargoCount, relatedPieceCount, relatedDesi }) => (
        <Card key={leg.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpenLegId(openLegId === leg.id ? null : leg.id)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left transition-colors hover:text-slate-900 py-1"
              >
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shrink-0">
                  Ayak {leg.order}
                </Badge>
                <span className="text-sm text-slate-300">•</span>
                <p className="text-sm font-semibold text-slate-900 truncate">{leg.locationName}</p>
                <span className="text-sm text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-sm shrink-0">
                  <span className={`inline-block size-2.5 shrink-0 rounded-full ${TRIP_LEG_STATUS_CLASSES[leg.status]}`} />
                  <span className="text-slate-700 font-medium">{TRIP_LEG_STATUS_LABELS[leg.status]}</span>
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                {onPrintTti && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg px-2.5"
                    disabled={isActioning}
                    onClick={() => onPrintTti()}
                  >
                    <Printer className="size-3.5" />
                    <span className="ml-1 text-xs">TTİ</span>
                  </Button>
                )}
                {onCompleteLeg && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-lg px-2.5"
                    disabled={isActioning}
                    onClick={() => onCompleteLeg()}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span className="ml-1 text-xs">Tamamla</span>
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setOpenLegId(openLegId === leg.id ? null : leg.id)}
                  className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label={openLegId === leg.id ? "Ayak detayını kapat" : "Ayak detayını aç"}
                >
                  <ChevronDown
                    className={`size-5 transition-transform duration-200 ${
                      openLegId === leg.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {openLegId === leg.id && (
            <CardContent className="space-y-5 border-t border-slate-200 p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <CalendarClock className="size-3.5" />
                    Başlama Zamanı
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{formatDateTime(leg.actualTimestamp)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <CalendarClock className="size-3.5" />
                    Bitiş Zamanı
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{formatDateTime(leg.actualTimestamp)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <MapPin className="size-3.5" />
                    Yapılacak İşlem
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{PLANNED_OPERATION_LABELS[leg.plannedOperation]}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MetricBox icon={PackageSearch} label="Toplam Kargo" value={formatNumber(relatedCargoCount)} />
                <MetricBox icon={Boxes} label="Toplam Parça" value={formatNumber(relatedPieceCount)} />
                <MetricBox icon={Activity} label="Toplam Desi" value={formatNumber(relatedDesi)} />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Parça Listesi</h4>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                    {formatNumber(relatedCargoCount)} kayıt
                  </Badge>
                </div>
                <TripManifestSection items={relatedItems} selectedLegId={null} />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
