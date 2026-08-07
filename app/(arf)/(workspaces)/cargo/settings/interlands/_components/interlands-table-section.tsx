"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter } from "lucide-react"
import { createBlockedInterland } from "../_api/create-blocked-interland-api"
import { createInterland } from "../_api/create-interland-api"
import { blockedInterlandStore, mockBranches } from "../_mock/interlands-mock-data"
import { getInterlandsListColumns } from "../_columns/interlands-list-columns"
import type { BlockedInterlandRecord, InterlandRecord } from "../_types"
import { CreateBlockedInterlandModal } from "./create-blocked-interland-modal"
import { CreateInterlandModal } from "./create-interland-modal"

interface Props {
  data: InterlandRecord[]
}

export function InterlandsTableSection({ data }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [rows, setRows] = useState<InterlandRecord[]>(data)
  const [blockedRows, setBlockedRows] = useState<BlockedInterlandRecord[]>(() => [...blockedInterlandStore])
  const [table, setTable] = useState<TanStackTable<InterlandRecord> | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createBlockedOpen, setCreateBlockedOpen] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const typeQuery = searchParams.get("type") ?? "all"

  const columns = useMemo(
    () =>
      getInterlandsListColumns(
        (id: string) => {
          if (!window.confirm("İnterland durumu değiştirilecek. Onaylıyor musunuz?")) {
            return
          }
          setRows((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: item.status === "active" ? "passive" : "active",
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          )
        },
        (id: string) => {
          if (!window.confirm("İnterland kaydı silinecek. Onaylıyor musunuz?")) {
            return
          }
          setRows((prev) => prev.filter((item) => item.id !== id))
        },
      ),
    [],
  )

  const blockedAsRows = useMemo<InterlandRecord[]>(
    () =>
      blockedRows.map((item) => ({
        id: item.id,
        name: item.name,
        branchId: item.branchId,
        branchName: item.branchName,
        status: "passive",
        cityCount: 1,
        districtCount: 1,
        neighborhoodCount: 1,
        updatedAt: new Date().toISOString(),
      })),
    [blockedRows],
  )

  const filteredRows = useMemo(() => {
    if (typeQuery === "interlands") {
      return rows
    }
    if (typeQuery === "blocked") {
      return blockedAsRows
    }
    return [...rows, ...blockedAsRows]
  }, [blockedAsRows, rows, typeQuery])

  const updateTypeQuery = (value: "all" | "interlands" | "blocked") => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const statusOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Pasif", value: "passive" },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <CreateInterlandModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        branches={mockBranches.map((item) => ({ id: item.id, name: item.name }))}
        onCreate={async (payload) => {
          const newRecord = await createInterland(payload)
          setRows((prev) => [newRecord, ...prev])
          return newRecord
        }}
      />
      <CreateBlockedInterlandModal
        open={createBlockedOpen}
        onOpenChange={setCreateBlockedOpen}
        branches={mockBranches.map((item) => ({ id: item.id, name: item.name }))}
        onCreate={async (payload) => {
          const created = await createBlockedInterland(payload)
          setBlockedRows((prev) => [created, ...prev])
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">İnterlandlar</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/arf/cargo/operations/interland-units">İnterland Birimleri</Link>
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>İnterland Oluştur</Button>
          <Button size="sm" variant="outline" onClick={() => setCreateBlockedOpen(true)}>
            Yasaklı İnterland Oluştur
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={typeQuery === "all" ? "default" : "outline"} onClick={() => updateTypeQuery("all")}>Tümü</Button>
            <Button variant={typeQuery === "interlands" ? "default" : "outline"} onClick={() => updateTypeQuery("interlands")}>İnterlandlar</Button>
            <Button variant={typeQuery === "blocked" ? "default" : "outline"} onClick={() => updateTypeQuery("blocked")}>Yasaklı İnterlandlar</Button>
          </div>

          {table && (
            <div className="flex items-center gap-2">
              {!showFacetedFilters && (
                <DataTableExcelActions table={table} filename="interlandlar" exportSelected={false} exportLabel="Dışarı Aktar" />
              )}

              <DataTableToolbar
                table={table}
                showColumnSelector={!showFacetedFilters}
                viewLabel="Görünüm"
                columnsLabel="Sütunlar"
                resetLabel="Sıfırla"
              >
                <Button
                  type="button"
                  variant={showFacetedFilters ? "default" : "outline"}
                  size="sm"
                  className="mr-3 h-8"
                  onClick={() => setShowFacetedFilters((previous) => !previous)}
                >
                  <Filter className="mr-2 size-4" />
                  Filtreler
                </Button>

                {showFacetedFilters && (
                  <div className="flex flex-wrap items-center gap-2">
                    <DataTableFacetedFilter
                      column={table.getColumn("status")}
                      title="Durum"
                      options={statusOptions}
                    />
                  </div>
                )}
              </DataTableToolbar>
            </div>
          )}

          <DataTable data={filteredRows} columns={columns} onTableReady={setTable} />

          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}
