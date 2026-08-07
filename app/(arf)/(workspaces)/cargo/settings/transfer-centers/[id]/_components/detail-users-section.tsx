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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Filter, Plus, Users } from "lucide-react"
import { usersColumns } from "../_columns/users-columns"
import type { TransferCenter } from "../_types"

interface Props {
  center: TransferCenter
}

export function DetailUsersSection({ center }: Props) {
  const [table, setTable] = useState<TanStackTable<(typeof center.users)[0]> | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const roleOptions = useMemo(
    () => [
      { label: "Yönetici", value: "yonetici" },
      { label: "Operatör", value: "operator" },
      { label: "Kurye", value: "kurye" },
    ],
    [],
  )

  const statusOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Pasif", value: "passive" },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Users className="size-4 text-slate-400" />
          Kullanıcılar
          {center.users.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
              {center.users.length}
            </span>
          )}
        </CardTitle>
        <Button size="sm" className="h-8 text-xs">
          <Plus className="mr-1.5 size-3.5" />
          Kullanıcı Ekle
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {center.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <Users className="size-8" />
            <p className="text-sm">Henüz kullanıcı eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {table && (
              <div className="flex items-center gap-2">
                {!showFilters && (
                  <DataTableExcelActions
                    table={table}
                    filename="kullanicilar"
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
                  column={table.getColumn("role")}
                  title="Rol"
                  options={roleOptions}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("status")}
                  title="Durum"
                  options={statusOptions}
                />
              </div>
            )}
            <DataTable columns={usersColumns} data={center.users} onTableReady={setTable} />
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
  )
}
