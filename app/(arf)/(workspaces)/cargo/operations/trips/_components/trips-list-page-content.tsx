"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { OnChangeFn, PaginationState } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchTripListKpi } from "../_api/trips-list-api"
import { startTripFromModal } from "../_api/trip-start-api"
import type { DriverOption, SupplierOption, TripLineOption, TripListKpi, TripRecord, TripStartFormState, VehicleOption } from "../_types"
import { TripStartModal } from "./trip-start-modal"
import { TripsKpiCards } from "./trips-kpi-cards"
import { TripsTableSection } from "./trips-table-section"

interface Props {
  trips: TripRecord[]
  kpi: TripListKpi
  lines: TripLineOption[]
  suppliers: SupplierOption[]
  vehicles: VehicleOption[]
  drivers: DriverOption[]
}

export function TripsListPageContent({ trips, kpi, lines, suppliers, vehicles, drivers }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rows, setRows] = useState(trips)
  const [summary, setSummary] = useState(kpi)
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const datePreset = searchParams.get("datePreset") ?? "all"
  const status = searchParams.get("status") ?? "all"
  const supplierType = searchParams.get("supplierType") ?? "all"
  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? "5"))

  function setQuery(next: Record<string, string | null>) {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const query = current.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const stableRows = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const weekStart = new Date(todayStart)
    const day = weekStart.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + mondayOffset)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) {
        return false
      }

      if (supplierType !== "all" && row.supplierType !== supplierType) {
        return false
      }

      const createdAt = new Date(row.createdAt)
      if (datePreset === "all") {
        return true
      }

      if (datePreset === "today") {
        return createdAt >= todayStart && createdAt < todayEnd
      }
      if (datePreset === "week") {
        return createdAt >= weekStart && createdAt < weekEnd
      }
      if (datePreset === "custom") {
        if (fromDate && createdAt < fromDate) return false
        if (toDate && createdAt > toDate) return false
      }

      return true
    })
  }, [dateFrom, datePreset, dateTo, rows, status, supplierType])

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize])

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater
    setQuery({
      page: String(next.pageIndex + 1),
      pageSize: String(next.pageSize),
    })
  }

  async function refreshKpi() {
    const refreshedKpi = await fetchTripListKpi()
    setSummary(refreshedKpi)
  }

  async function handleCreateTrip(payload: TripStartFormState) {
    const created = await startTripFromModal(payload)
    setRows((prev) => [created, ...prev])
    await refreshKpi()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sefer Listesi</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsSummaryVisible((prev) => !prev)}>
            {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
          </Button>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Sefer Başlat
          </Button>
        </div>
      </div>

      {isSummaryVisible && <TripsKpiCards kpi={summary} />}

      <TripsTableSection
        rows={stableRows}
        onRowsChange={setRows}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        filters={{ datePreset, status, supplierType, dateFrom, dateTo }}
        onFilterChange={setQuery}
        onMutation={refreshKpi}
      />

      <TripStartModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        lines={lines}
        suppliers={suppliers}
        vehicles={vehicles}
        drivers={drivers}
        onSubmit={handleCreateTrip}
      />
    </div>
  )
}
