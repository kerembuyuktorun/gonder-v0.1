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
import { mockAssignableUsers } from "../_mock/branch-detail-mock-data"
import { getUsersColumns } from "../_columns/users-columns"
import type { BranchUser } from "../_types"
import { UserSelectModal } from "./user-select-modal"

interface Props {
  users: BranchUser[]
  onUsersChange: (users: BranchUser[]) => void
}

export function DetailUsersSection({ users, onUsersChange }: Props) {
  const [table, setTable] = useState<TanStackTable<BranchUser> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const roleOptions = useMemo(
    () => [
      { label: "Yönetici", value: "yonetici" },
      { label: "Operatör", value: "operator" },
      { label: "Kurye", value: "kurye" },
      { label: "Muhasebe", value: "muhasebe" },
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

  const handleToggleStatus = (user: BranchUser) => {
    onUsersChange(
      users.map((item) =>
        item.id === user.id ? { ...item, status: item.status === "active" ? "passive" : "active" } : item,
      ),
    )
  }

  const handleRemove = (user: BranchUser) => {
    if (!window.confirm(`${user.firstName} ${user.lastName} kullanıcısının bağlantısı kaldırılacak. Onaylıyor musunuz?`)) {
      return
    }
    onUsersChange(users.filter((item) => item.id !== user.id))
  }

  const columns = useMemo(() => getUsersColumns(handleToggleStatus, handleRemove), [users])

  return (
    <>
      <UserSelectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentUsers={users}
        availableUsers={mockAssignableUsers}
        onAdd={(selectedUsers) => onUsersChange([...users, ...selectedUsers])}
      />
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="size-4 text-slate-400" />
            Kullanıcılar
            {users.length > 0 && (
              <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
                {users.length}
              </span>
            )}
          </CardTitle>
          <Button size="sm" className="h-8 text-xs" onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 size-3.5" />
            Yeni Kullanıcı Seç
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {users.length === 0 ? (
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
                      filename="sube-kullanicilari"
                      exportSelected={false}
                      exportLabel="Dışarı Aktar"
                    />
                  )}
                  <DataTableToolbar table={table} showColumnSelector={!showFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                    <Button type="button" variant={showFilters ? "default" : "outline"} size="sm" className="mr-3 h-8" onClick={() => setShowFilters((value) => !value)}>
                      <Filter className="mr-2 size-4" />
                      Filtreler
                    </Button>
                  </DataTableToolbar>
                </div>
              )}
              {showFilters && table && (
                <div className="flex flex-wrap gap-2">
                  <DataTableFacetedFilter column={table.getColumn("role")} title="Rol" options={roleOptions} />
                  <DataTableFacetedFilter column={table.getColumn("status")} title="Durum" options={statusOptions} />
                </div>
              )}
              <DataTable columns={columns} data={users} onTableReady={setTable} />
              {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
