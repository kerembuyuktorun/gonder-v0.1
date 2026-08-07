"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Filter, GitBranch, Navigation, Truck } from "lucide-react"
import { routesColumns } from "../_columns/routes-columns"
import type { TransferCenter } from "../_types"

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconClass?: string
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={cn("rounded-xl p-2.5", iconClass ?? "bg-slate-100")}>
            <Icon className="size-5 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface Props {
  center: TransferCenter
}

export function DetailRoutesSection({ center }: Props) {
  const [table, setTable] = useState<TanStackTable<(typeof center.routes)[0]> | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const typeOptions = useMemo(
    () => [
      { label: "Ana Hat", value: "ana" },
      { label: "Merkez Hat", value: "merkez" },
      { label: "Ara Hat", value: "ara" },
    ],
    [],
  )

  const anaHatCount = center.routes.filter((r) => r.routeType === "ana").length
  const merkezHatCount = center.routes.filter((r) => r.routeType === "merkez").length
  const araHatCount = center.routes.filter((r) => r.routeType === "ara").length

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Toplam Ana Hat"
          value={String(anaHatCount)}
          icon={Truck}
          iconClass="bg-emerald-50"
        />
        <StatCard
          label="Toplam Merkez Hat"
          value={String(merkezHatCount)}
          icon={Navigation}
          iconClass="bg-blue-50"
        />
        <StatCard
          label="Toplam Ara Hat"
          value={String(araHatCount)}
          icon={GitBranch}
          iconClass="bg-amber-50"
        />
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Hat Listesi
            {center.routes.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {center.routes.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {center.routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <Truck className="size-8" />
              <p className="text-sm">Henüz hat tanımlanmamış</p>
            </div>
          ) : (
            <div className="space-y-3">
              {table && (
                <div className="flex items-center gap-2">
                  {!showFilters && (
                    <DataTableExcelActions
                      table={table}
                      filename="hatlar"
                      exportSelected={false}
                      exportLabel="Dışarı Aktar"
                    />
                  )}
                  <DataTableToolbar
                    table={table}
                    showColumnSelector={!showFilters}
                    viewLabel="Görünüm"
                    columnsLabel="Sütunlar"
                    resetLabel="Sıfırla"
                  >
                    <Button
                      type="button"
                      variant={showFilters ? "default" : "outline"}
                      size="sm"
                      className="mr-3 h-8"
                      onClick={() => setShowFilters((p) => !p)}
                    >
                      <Filter className="mr-2 size-4" />
                      Filtrele
                    </Button>
                  </DataTableToolbar>
                </div>
              )}
              {showFilters && table && (
                <div className="flex flex-wrap gap-2">
                  <DataTableFacetedFilter
                    column={table.getColumn("routeType")}
                    title="Hat Tipi"
                    options={typeOptions}
                  />
                </div>
              )}
              <DataTable
                columns={routesColumns}
                data={center.routes}
                onTableReady={setTable}
              />
              {table && (
                <DataTablePagination
                  table={table as TanStackTable<unknown>}
                  pageSizeOptions={[5, 10, 20]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
