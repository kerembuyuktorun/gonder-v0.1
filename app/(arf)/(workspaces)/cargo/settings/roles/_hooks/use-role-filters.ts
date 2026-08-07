import { useMemo } from "react"
import type { RoleRecord } from "../_types"

interface Params {
  q: string
  status: string
  type: string
  sortBy: string
}

export function useRoleFilters(rows: RoleRecord[], params: Params): RoleRecord[] {
  const { q, status, type, sortBy } = params

  return useMemo(() => {
    const query = q.trim().toLocaleLowerCase("tr-TR")

    const filtered = rows.filter((row) => {
      if (query) {
        const haystack = `${row.name} ${row.description ?? ""}`.toLocaleLowerCase("tr-TR")
        if (!haystack.includes(query)) return false
      }
      if (status !== "all" && row.status !== status) return false
      if (type !== "all" && row.roleType !== type) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === "createdAt") return Date.parse(b.createdAt) - Date.parse(a.createdAt)
      if (sortBy === "userCount") return b.userCount - a.userCount
      return b.userCount - a.userCount
    })
  }, [rows, q, status, type, sortBy])
}
