import { useMemo } from "react"
import type { IntegrationRecord } from "../_types"

interface FilterParams {
  category: string
  status: string
  q: string
}

export function useIntegrationFilters(rows: IntegrationRecord[], params: FilterParams): IntegrationRecord[] {
  const { category, status, q } = params

  return useMemo(() => {
    const query = q.trim().toLocaleLowerCase("tr-TR")
    return rows.filter((row) => {
      if (category !== "all" && row.platform?.category !== category) return false
      if (status !== "all" && row.status !== status) return false
      if (!query) return true
      const haystack = `${row.platform?.name ?? ""} ${row.platform?.code ?? ""}`.toLocaleLowerCase("tr-TR")
      return haystack.includes(query)
    })
  }, [rows, category, status, q])
}
