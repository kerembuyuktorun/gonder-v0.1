import { useMemo } from "react"
import type { UserRecord } from "../_types"

interface FilterParams {
  q: string
  role: string
  location: string
  status: string
}

function matchesSearch(row: UserRecord, query: string): boolean {
  const q = query.toLocaleLowerCase("tr-TR")
  return [row.firstName, row.lastName, row.email, row.phoneNumber]
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes(q)
}

export function useUserRoleFilters(rows: UserRecord[], params: FilterParams): UserRecord[] {
  const { q, role, location, status } = params

  return useMemo(() => {
    return rows.filter((row) => {
      if (q && !matchesSearch(row, q)) return false
      if (role !== "all" && row.role !== role) return false
      if (location !== "all" && row.locationId !== location) return false
      if (status !== "all" && row.status !== status) return false
      return true
    })
  }, [rows, q, role, location, status])
}
