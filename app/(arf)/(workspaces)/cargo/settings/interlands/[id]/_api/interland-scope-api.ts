import type { InterlandScopeRow } from "../../_types"

// TODO: Remove mock when API is ready
export async function addScopeRow(scopeRows: InterlandScopeRow[], payload: Omit<InterlandScopeRow, "id">): Promise<InterlandScopeRow[]> {
  return [{ id: `scope-${Date.now()}`, ...payload }, ...scopeRows]
}

// TODO: Remove mock when API is ready
export async function updateScopeRow(scopeRows: InterlandScopeRow[], row: InterlandScopeRow): Promise<InterlandScopeRow[]> {
  return scopeRows.map((item) => (item.id === row.id ? row : item))
}

// TODO: Remove mock when API is ready
export async function deleteScopeRow(scopeRows: InterlandScopeRow[], id: string): Promise<InterlandScopeRow[]> {
  return scopeRows.filter((item) => item.id !== id)
}
