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
  activateRole,
  deleteRole,
  fetchRoleDetail,
  fetchRoles,
  suspendRole,
} from "../_api/roles-api"
import { getRolesListColumns } from "../_columns/roles-list-columns"
import { useRoleFilters } from "../_hooks/use-role-filters"
import type { RoleDetail, RoleRecord } from "../_types"
import { CreateRoleModal } from "./create-role-modal"

interface Props {
  data: RoleRecord[]
}

const statusOptions = [
  { label: "Aktif", value: "active" },
  { label: "Pasif", value: "passive" },
] as const

const typeOptions = [
  { label: "Sistem", value: "system" },
  { label: "Özel", value: "custom" },
] as const

export function RolesTableSection({ data }: Props) {
  const [rows, setRows] = useState<RoleRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<RoleRecord> | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<RoleDetail | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""
  const statusFilter = searchParams.get("status") ?? "all"
  const typeFilter = searchParams.get("type") ?? "all"
  const sortBy = searchParams.get("sortBy") ?? "userCount"
  const pageParam = Number(searchParams.get("page") ?? "0")
  const currentPage = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: currentPage,
    pageSize: 10,
  })

  const filteredRows = useRoleFilters(rows, {
    q: query,
    status: statusFilter,
    type: typeFilter,
    sortBy,
  })

  const selectedStatusOption = statusOptions.find((o) => o.value === statusFilter)
  const selectedTypeOption = typeOptions.find((o) => o.value === typeFilter)

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

  async function refreshRows() {
    const fresh = await fetchRoles()
    setRows(fresh)
  }

  const columns = useMemo(
    () =>
      getRolesListColumns({
        onEdit: async (role) => {
          const detail = await fetchRoleDetail(role.id)
          if (!detail) return
          setEditRole(detail)
        },
        onSuspend: async (role) => {
          const updated =
            role.status === "active" ? await suspendRole(role.id) : await activateRole(role.id)
          if (!updated) return
          setRows((prev) => prev.map((item) => (item.id === role.id ? updated : item)))
        },
        onDelete: async (role) => {
          const confirmed = window.confirm(`${role.name} adlı rol silinecek. Onaylıyor musunuz?`)
          if (!confirmed) return
          const result = await deleteRole(role.id)
          if (!result.ok) {
            window.alert(result.reason ?? "Rol silinemedi")
            return
          }
          setRows((prev) => prev.filter((item) => item.id !== role.id))
        },
      }),
    [],
  )

  useEffect(() => {
    setRows(data)
  }, [data])

  useEffect(() => {
    setPagination((prev) => {
      if (prev.pageIndex === currentPage) return prev
      return { ...prev, pageIndex: currentPage }
    })
  }, [currentPage])

  return (
    <div className="space-y-6">
      <CreateRoleModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => void refreshRows()}
      />

      {editRole && (
        <CreateRoleModal
          open={!!editRole}
          mode="edit"
          initialRole={editRole}
          onOpenChange={(open) => {
            if (!open) setEditRole(null)
          }}
          onSaved={() => {
            setEditRole(null)
            void refreshRows()
          }}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roller</h1>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Yeni Rol Oluştur
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {table && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {!showFacetedFilters && (
                  <DataTableExcelActions
                    table={table}
                    filename="roller"
                    exportSelected={false}
                    exportLabel="Dışarı Aktar"
                  />
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
                    onClick={() => setShowFacetedFilters((prev) => !prev)}
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
                                      onSelect={() =>
                                        updateQueryParam(
                                          "status",
                                          isSelected ? "all" : option.value,
                                        )
                                      }
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
                                    <CommandItem
                                      onSelect={() => updateQueryParam("status", "all")}
                                      className="justify-center text-center"
                                    >
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
                            Tip
                            {selectedTypeOption && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                  {selectedTypeOption.label}
                                </Badge>
                              </>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Tip" />
                            <CommandList>
                              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                {typeOptions.map((option) => {
                                  const isSelected = typeFilter === option.value
                                  return (
                                    <CommandItem
                                      key={option.value}
                                      onSelect={() =>
                                        updateQueryParam(
                                          "type",
                                          isSelected ? "all" : option.value,
                                        )
                                      }
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
                              {selectedTypeOption && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => updateQueryParam("type", "all")}
                                      className="justify-center text-center"
                                    >
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
            stickyFirstColumn
            stickyLastColumn
            enableHorizontalScroll
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}

