"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTablePagination,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getScopeColumns, type InterlandScopeGroupedRow } from "../_columns/scope-columns"
import type { InterlandAuditLog, InterlandDetail, InterlandScopeRow } from "../../_types"
import { ScopeUpdateModal } from "./scope-update-modal"

interface Props {
  interland: InterlandDetail
  onInterlandChange: (next: InterlandDetail) => void
  onAuditAppend: (entry: Omit<InterlandAuditLog, "id" | "createdAt">) => void
}

export function DetailOverviewSection({ interland, onInterlandChange, onAuditAppend }: Props) {
  const [table, setTable] = useState<TanStackTable<InterlandScopeGroupedRow> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<InterlandScopeGroupedRow | undefined>(undefined)

  const cities = useMemo(() => new Set(interland.scopeRows.map((item) => item.city)).size, [interland.scopeRows])
  const districts = useMemo(
    () => new Set(interland.scopeRows.map((item) => `${item.city}-${item.district}`)).size,
    [interland.scopeRows],
  )

  const groupedRows = useMemo<InterlandScopeGroupedRow[]>(() => {
    const grouped = new Map<
      string,
      { city: string; district: string; neighborhoods: string[]; sourceRows: InterlandScopeRow[] }
    >()

    for (const item of interland.scopeRows) {
      const key = `${item.city}-${item.district}`
      const existing = grouped.get(key)

      if (!existing) {
        grouped.set(key, {
          city: item.city,
          district: item.district,
          neighborhoods: [item.neighborhood],
          sourceRows: [item],
        })
        continue
      }

      if (!existing.neighborhoods.includes(item.neighborhood)) {
        existing.neighborhoods.push(item.neighborhood)
      }
      existing.sourceRows.push(item)
    }

    return Array.from(grouped.values())
      .map((group) => ({
        id: `${group.city}-${group.district}`,
        city: group.city,
        district: group.district,
        neighborhoods: group.neighborhoods.sort((a, b) => a.localeCompare(b, "tr")),
        neighborhood:
          group.neighborhoods.length === 1
            ? group.neighborhoods[0]
            : `${group.neighborhoods.length} mahalle seçili`,
        sourceRows: group.sourceRows,
      }))
      .sort((a, b) => `${a.city}-${a.district}`.localeCompare(`${b.city}-${b.district}`, "tr"))
  }, [interland.scopeRows])

  const updateInterlandRows = (updatedRows: InterlandScopeRow[]) => {
    onInterlandChange({
      ...interland,
      scopeRows: updatedRows,
      cityCount: new Set(updatedRows.map((item) => item.city)).size,
      districtCount: new Set(updatedRows.map((item) => `${item.city}-${item.district}`)).size,
      neighborhoodCount: updatedRows.length,
    })
  }

  const columns = useMemo(
    () =>
      getScopeColumns(
        (row) => {
          setEditingRow(row)
          setModalOpen(true)
        },
        (row) => {
          void (async () => {
            if (!window.confirm("Kapsam satırı silinecek. Onaylıyor musunuz?")) {
              return
            }

            const sourceIds = new Set(row.sourceRows.map((item) => item.id))
            const updatedRows = interland.scopeRows.filter((item) => !sourceIds.has(item.id))
            updateInterlandRows(updatedRows)

            onAuditAppend({
              actionType: "scope_delete",
              oldValue: `${row.city} / ${row.district} / ${row.neighborhoods.join(", ")}`,
              newValue: "-",
              actorId: "current-user",
              actorName: "Mevcut Kullanıcı",
            })
          })()
        },
      ),
    [interland, onAuditAppend],
  )

  return (
    <div className="space-y-4">
      <ScopeUpdateModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setEditingRow(undefined)
          }
        }}
        initial={
          editingRow
            ? {
                city: editingRow.city,
                districts: [editingRow.district],
                neighborhoods: editingRow.neighborhoods,
                sourceIds: editingRow.sourceRows.map((item) => item.id),
              }
            : undefined
        }
        scopeRows={interland.scopeRows}
        onSave={async (payload) => {
          const sourceIds = new Set(payload.sourceIds ?? [])
          const remainingRows =
            sourceIds.size > 0
              ? interland.scopeRows.filter((item) => !sourceIds.has(item.id))
              : interland.scopeRows

          const nextRows: InterlandScopeRow[] = payload.districts.flatMap((district, districtIndex) => {
            const uniqueNeighborhoods = Array.from(new Set(payload.neighborhoodsByDistrict[district] ?? [])).sort((a, b) =>
              a.localeCompare(b, "tr"),
            )

            return uniqueNeighborhoods.map((neighborhood, neighborhoodIndex) => ({
              id: `scope-${Date.now()}-${districtIndex}-${neighborhoodIndex}`,
              city: payload.city,
              district,
              neighborhood,
            }))
          })

          const dedupedByKey = new Map<string, InterlandScopeRow>()
          for (const row of [...nextRows, ...remainingRows]) {
            const key = `${row.city}__${row.district}__${row.neighborhood}`
            if (!dedupedByKey.has(key)) {
              dedupedByKey.set(key, row)
            }
          }

          const updatedRows = Array.from(dedupedByKey.values())
          updateInterlandRows(updatedRows)

          onAuditAppend({
            actionType: payload.sourceIds?.length ? "scope_update" : "scope_add",
            oldValue:
              payload.sourceIds?.length && editingRow
                ? `${editingRow.city} / ${editingRow.district} / ${editingRow.neighborhoods.join(", ")}`
                : "-",
            newValue: `${payload.city} / ${payload.districts.join(", ")} / ${payload.districts
              .flatMap((district) => payload.neighborhoodsByDistrict[district] ?? [])
              .join(", ")}`,
            actorId: "current-user",
            actorName: "Mevcut Kullanıcı",
          })
        }}
      />

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">Şehir: <span className="font-semibold">{cities}</span></div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">İlçe: <span className="font-semibold">{districts}</span></div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">Mahalle: <span className="font-semibold">{interland.scopeRows.length}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">Kapsam</CardTitle>
          <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
            Ekle
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <DataTable data={groupedRows} columns={columns} onTableReady={setTable} />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}
