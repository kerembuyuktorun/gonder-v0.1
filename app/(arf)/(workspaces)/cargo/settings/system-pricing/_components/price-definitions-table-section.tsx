"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, Plus } from "lucide-react"
import {
  clonePricingDefinition,
  createPricingDefinition,
  setPricingDefinitionStatus,
  updatePricingDefinition,
  type UpsertPriceDefinitionInput,
} from "../_api/price-definitions-api"
import { getPriceDefinitionsListColumns } from "../_columns/price-definitions-list-columns"
import type { PriceDefinitionDetail, PriceDefinitionRecord } from "../_types"
import { CreatePriceDefinitionModal } from "./create-price-definition-modal"

interface Props {
  data: PriceDefinitionRecord[]
}

function isExpired(validTo: string): boolean {
  return validTo < new Date().toISOString().slice(0, 10)
}

function matchesSearch(row: PriceDefinitionRecord, query: string): boolean {
  const normalized = query.toLocaleLowerCase("tr-TR")
  const validFrom = new Date(row.validFrom).toLocaleDateString("tr-TR")
  const validTo = new Date(row.validTo).toLocaleDateString("tr-TR")

  return `${row.name} ${row.code} ${row.validFrom} ${row.validTo} ${validFrom} ${validTo}`
    .toLocaleLowerCase("tr-TR")
    .includes(normalized)
}

function toRecord(detail: PriceDefinitionDetail): PriceDefinitionRecord {
  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    type: detail.type,
    isDefault: detail.isDefault,
    validFrom: detail.validFrom,
    validTo: detail.validTo,
    status: detail.status,
    ruleCount: detail.rules.length,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    createdBy: detail.createdBy,
    createdByName: detail.createdByName,
  }
}

export function PriceDefinitionsTableSection({ data }: Props) {
  const [rows, setRows] = useState<PriceDefinitionRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<PriceDefinitionRecord> | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<PriceDefinitionDetail | undefined>(undefined)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? "all"
  const type = searchParams.get("type") ?? "all"
  const isDefault = searchParams.get("isDefault") ?? "all"

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (q && !matchesSearch(row, q)) {
        return false
      }
      if (status !== "all" && row.status !== status) {
        return false
      }
      if (type !== "all" && row.type !== type) {
        return false
      }
      if (isDefault !== "all") {
        const required = isDefault === "true"
        if (row.isDefault !== required) {
          return false
        }
      }
      return true
    })
  }, [isDefault, q, rows, status, type])

  const columns = useMemo(
    () =>
      getPriceDefinitionsListColumns({
        onClone: async (id) => {
          const cloned = await clonePricingDefinition(id)
          if (!cloned) {
            return
          }
          setRows((prev) => [toRecord(cloned), ...prev])
        },
        onToggleStatus: async (row) => {
          const next = row.status === "active" ? "passive" : "active"
          const updated = await setPricingDefinitionStatus(row.id, next)
          if (!updated) {
            return
          }
          setRows((prev) => prev.map((item) => (item.id === row.id ? toRecord(updated) : item)))
        },
      }),
    [],
  )

  const onSubmit = async (payload: UpsertPriceDefinitionInput & { id?: string }) => {
    if (payload.id) {
      const updated = await updatePricingDefinition(payload.id, payload)
      if (updated) {
        setRows((prev) => prev.map((item) => (item.id === updated.id ? toRecord(updated) : item)))
      }
      return
    }

    const created = await createPricingDefinition(payload)
    setRows((prev) => [toRecord(created), ...prev])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fiyat Tanımları</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="size-4" />
          Fiyat Tanımla
        </Button>
      </div>

      <CreatePriceDefinitionModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setEditingDetail(undefined)
          }
        }}
        initialValue={editingDetail}
        onSubmit={onSubmit}
      />

      <Card>
        <CardContent className="space-y-4">
          {table && (
            <div className="flex items-center gap-2">
              <DataTableExcelActions table={table} filename="fiyat-tanimlari" exportSelected={false} exportLabel="Dışarı Aktar" />
              <DataTableToolbar table={table} showColumnSelector viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-3 h-8"
                  onClick={() => router.replace(pathname)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreler
                </Button>
              </DataTableToolbar>
            </div>
          )}
          <DataTable
            data={filtered}
            columns={columns}
            onTableReady={setTable}
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}

          <div className="hidden">
            {filtered.some((item) => isExpired(item.validTo)) ? "expired-present" : "no-expired"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
