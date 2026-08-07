"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
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
import { deactivateUser, reactivateUser } from "../_api/users-api"
import { getUsersListColumns } from "../_columns/users-list-columns"
import type { LocationOption, UserRecord } from "../_types"
import { USER_ROLE_LABELS } from "../_types"
import { CreateUserModal } from "./create-user-modal"
import { ExportUsersAction } from "./export-users-action"
import { UserEditModal } from "./user-edit-modal"
import { useUserRoleFilters } from "../_hooks/use-user-role-filters"

interface Props {
  data: UserRecord[]
  locations: LocationOption[]
}

const statusOptions = [
  { label: "Aktif", value: "active" },
  { label: "Pasif", value: "passive" },
  { label: "Askıya Alındı", value: "suspended" },
] as const

const roleOptions = (Object.entries(USER_ROLE_LABELS) as [string, string][]).map(
  ([value, label]) => ({ label, value }),
)

export function UsersTableSection({ data, locations }: Props) {
  const [rows, setRows] = useState<UserRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<UserRecord> | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""
  const roleFilter = searchParams.get("role") ?? "all"
  const locationFilter = searchParams.get("location") ?? "all"
  const statusFilter = searchParams.get("status") ?? "all"

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const filteredRows = useUserRoleFilters(rows, {
    q: query,
    role: roleFilter,
    location: locationFilter,
    status: statusFilter,
  })

  const selectedStatusOption = statusOptions.find((o) => o.value === statusFilter)
  const selectedRoleOption = roleOptions.find((o) => o.value === roleFilter)

  const columns = useMemo(
    () =>
      getUsersListColumns({
        onEdit: (user) => setEditingUser(user),
        onReactivate: async (user) => {
          const confirmed = window.confirm(
            `${user.firstName} ${user.lastName} adlı kullanıcı aktif yapılacak. Onaylıyor musunuz?`,
          )
          if (!confirmed) return
          const updated = await reactivateUser(user.id)
          if (!updated) return
          setRows((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
        },
        onDeactivate: async (user) => {
          const confirmed = window.confirm(
            `${user.firstName} ${user.lastName} adlı kullanıcı pasif yapılacak. Onaylıyor musunuz?`,
          )
          if (!confirmed) return
          const updated = await deactivateUser(user.id)
          if (!updated) return
          setRows((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
        },
      }),
    [],
  )

  return (
    <div className="space-y-6">
      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        locations={locations}
        onCreate={(created: UserRecord) => {
          setRows((prev) => [created, ...prev])
        }}
      />
      {editingUser && (
        <UserEditModal
          open={!!editingUser}
          user={editingUser}
          locations={locations}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null)
          }}
          onSaved={(updated) => {
            setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            setEditingUser(null)
          }}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kullanıcılar</h1>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {table && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {!showFacetedFilters && <ExportUsersAction rows={filteredRows} />}
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
                            Rol
                            {selectedRoleOption && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                  {selectedRoleOption.label}
                                </Badge>
                              </>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rol" />
                            <CommandList>
                              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                {roleOptions.map((option) => {
                                  const isSelected = roleFilter === option.value
                                  return (
                                    <CommandItem
                                      key={option.value}
                                      onSelect={() =>
                                        updateQueryParam(
                                          "role",
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
                              {selectedRoleOption && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => updateQueryParam("role", "all")}
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
            enableHorizontalScroll
            stickyFirstColumn
            stickyLastColumn
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}
