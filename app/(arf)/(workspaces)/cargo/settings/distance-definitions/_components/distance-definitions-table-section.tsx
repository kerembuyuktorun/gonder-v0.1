"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { OnChangeFn, PaginationState, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CheckIcon, Filter, Plus, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createDistanceDefinition,
  deleteDistanceDefinition,
  setDistanceDefinitionStatus,
  updateDistanceDefinition,
} from "../_api/distance-definitions-api"
import { getDistanceDefinitionsListColumns } from "../_columns/distance-definitions-list-columns"
import type { DistanceDefinitionRecord, DistanceSlaTarget } from "../_types"
import { DISTANCE_SLA_LABELS } from "../_types"
import { CreateDistanceDefinitionModal } from "./create-distance-definition-modal"
import { DistanceDefinitionFormModal } from "./distance-definition-form-modal"

interface Props {
  data: DistanceDefinitionRecord[]
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR")
}

const statusOptions = [
  { label: "Aktif", value: "active" },
  { label: "Pasif", value: "passive" },
] as const

const slaOptions: { label: string; value: DistanceSlaTarget }[] = [
  { label: DISTANCE_SLA_LABELS["24h"], value: "24h" },
  { label: DISTANCE_SLA_LABELS["48h"], value: "48h" },
  { label: DISTANCE_SLA_LABELS["72h"], value: "72h" },
]

export function DistanceDefinitionsTableSection({ data }: Props) {
  const [rows, setRows] = useState<DistanceDefinitionRecord[]>([...data].sort((a, b) => a.minKm - b.minKm))
  const [table, setTable] = useState<TanStackTable<DistanceDefinitionRecord> | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editRow, setEditRow] = useState<DistanceDefinitionRecord | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""
  const statusFilter = searchParams.get("status") ?? "all"
  const slaFilter = searchParams.get("sla") ?? "all"
  const pageParam = Number(searchParams.get("page") ?? "0")
  const currentPage = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: currentPage,
    pageSize: 10,
  })

  const selectedStatusOption = statusOptions.find((option) => option.value === statusFilter)
  const selectedSlaOption = slaOptions.find((option) => option.value === slaFilter)

  const filteredRows = useMemo(() => {
    const q = normalize(query.trim())

    return [...rows]
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false
        if (slaFilter !== "all" && row.slaTarget !== slaFilter) return false
        if (!q) return true

        const haystack = normalize(`${row.name} ${row.description ?? ""}`)
        return haystack.includes(q)
      })
      .sort((a, b) => a.minKm - b.minKm)
  }, [query, rows, slaFilter, statusFilter])

  const updateQueryParam = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    if (resetPage) {
      params.delete("page")
    }

    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const handlePaginationChange: OnChangeFn<PaginationState> = (next) => {
    setPagination((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next
      if (resolved.pageIndex === prev.pageIndex && resolved.pageSize === prev.pageSize) {
        return prev
      }

      const params = new URLSearchParams(searchParams.toString())
      if (resolved.pageIndex > 0) {
        params.set("page", String(resolved.pageIndex))
      } else {
        params.delete("page")
      }

      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
      return resolved
    })
  }

  const columns = useMemo(
    () =>
      getDistanceDefinitionsListColumns({
        onEdit: (row) => setEditRow(row),
        onDelete: async (row) => {
          const confirmed = window.confirm(`${row.name} Tanımi silinecek. Onaylıyor musunuz?`)
          if (!confirmed) return
          await deleteDistanceDefinition(row.id)
          setRows((prev) => prev.filter((item) => item.id !== row.id))
        },
        onToggleStatus: async (row) => {
          const next = row.status === "active" ? "passive" : "active"
          try {
            const updated = await setDistanceDefinitionStatus(row.id, next)
            if (!updated) return
            setRows((prev) => prev.map((item) => (item.id === row.id ? updated : item)))
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Durum değişikliği kaydedilemedi")
          }
        },
      }),
    [],
  )

  useEffect(() => {
    setRows([...data].sort((a, b) => a.minKm - b.minKm))
  }, [data])

  useEffect(() => {
    setPagination((prev) => {
      if (prev.pageIndex === currentPage) return prev
      return { ...prev, pageIndex: currentPage }
    })
  }, [currentPage])

  return (
    <div className="space-y-6">
      <CreateDistanceDefinitionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (payload) => {
          const created = await createDistanceDefinition(payload)
          setRows((prev) => [created, ...prev].sort((a, b) => a.minKm - b.minKm))
        }}
      />

      {editRow && (
        <DistanceDefinitionFormModal
          open={!!editRow}
          mode="edit"
          initial={editRow}
          onOpenChange={(open) => {
            if (!open) setEditRow(null)
          }}
          onSubmit={async (payload) => {
            const updated = await updateDistanceDefinition(editRow.id, payload)
            if (!updated) return
            setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            setEditRow(null)
          }}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mesafe Tanımları</h1>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Mesafe Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {table && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {!showFacetedFilters && (
                  <DataTableExcelActions table={table} filename="mesafe-tanimlari" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}
                <DataTableToolbar table={table} showColumnSelector={!showFacetedFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button
                    type="button"
                    variant={showFacetedFilters ? "default" : "outline"}
                    size="sm"
                    className="mr-3 h-8"
                    onClick={() => setShowFacetedFilters((previous) => !previous)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtreler
                  </Button>

                  {showFacetedFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Durum
                            {selectedStatusOption && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                  {selectedStatusOption.label}
                                </Badge>
                              </>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Durum" />
                            <CommandList>
                              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                {statusOptions.map((option) => {
                                  const isSelected = statusFilter === option.value
                                  return (
                                    <CommandItem
                                      key={option.value}
                                      onSelect={() => updateQueryParam("status", isSelected ? "all" : option.value)}
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                          isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible",
                                        )}
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                      </div>
                                      <span>{option.label}</span>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                              {selectedStatusOption && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup>
                                    <CommandItem onSelect={() => updateQueryParam("status", "all")} className="justify-center text-center">
                                      Filtreleri Temizle
                                    </CommandItem>
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            SLA
                            {selectedSlaOption && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                  {selectedSlaOption.label}
                                </Badge>
                              </>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="SLA" />
                            <CommandList>
                              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                {slaOptions.map((option) => {
                                  const isSelected = slaFilter === option.value
                                  return (
                                    <CommandItem
                                      key={option.value}
                                      onSelect={() => updateQueryParam("sla", isSelected ? "all" : option.value)}
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                          isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible",
                                        )}
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                      </div>
                                      <span>{option.label}</span>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                              {selectedSlaOption && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup>
                                    <CommandItem onSelect={() => updateQueryParam("sla", "all")} className="justify-center text-center">
                                      Filtreleri Temizle
                                    </CommandItem>
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </DataTableToolbar>
              </div>
            </div>
          )}

          <DataTable
            data={filteredRows}
            columns={columns}
            onTableReady={setTable}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}
