"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTablePagination,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Card, CardContent } from "@/components/ui/card"
import { deactivateUser, reactivateUser } from "../../../users/_api/users-api"
import { getUsersListColumns } from "../../../users/_columns/users-list-columns"
import type { LocationOption, UserRecord } from "../../../users/_types"
import { UserEditModal } from "../../../users/_components/user-edit-modal"

interface Props {
  data: UserRecord[]
  locations: LocationOption[]
}

export function RoleUsersSection({ data, locations }: Props) {
  const [rows, setRows] = useState<UserRecord[]>(data ?? [])
  const [table, setTable] = useState<TanStackTable<UserRecord> | null>(null)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)

  const columns = useMemo(
    () =>
      getUsersListColumns({
        onEdit: (user: UserRecord) => setEditingUser(user),
        onReactivate: async (user: UserRecord) => {
          const confirmed = window.confirm(
            `${user.firstName} ${user.lastName} adlı kullanıcı aktif yapılacak. Onaylıyor musunuz?`,
          )
          if (!confirmed) return    
          const updated = await reactivateUser(user.id)
          if (!updated) return
          setRows((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
        },
        onDeactivate: async (user: UserRecord) => {
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
    <div>
      {editingUser && (
        <UserEditModal
          open={!!editingUser}
          user={editingUser}
          locations={locations}
          onOpenChange={(open: boolean) => {
            if (!open) setEditingUser(null)
          }}
          onSaved={(updated: UserRecord) => {
            setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            setEditingUser(null)
          }}
        />
      )}

      <Card>
        <CardContent className="space-y-4">
          <DataTable
            data={rows}
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
