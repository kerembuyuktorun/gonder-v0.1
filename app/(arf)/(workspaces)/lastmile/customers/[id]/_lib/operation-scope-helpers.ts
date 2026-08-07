import type { OperationScopeRow } from '../_types/customer-detail'

export function formatScopeRow(row: OperationScopeRow): string {
  const mahalleLabel = row.tum_mahalleler
    ? 'Tüm mahalleler'
    : row.mahalleler.length === 1
      ? row.mahalleler[0]
      : `${row.mahalleler.length} mahalle`
  return `${row.il} · ${row.ilce} · ${mahalleLabel}`
}

export function formatScopeSummary(rows: OperationScopeRow[]): string {
  if (rows.length === 0) return 'Tanımsız'
  if (rows.length === 1) return formatScopeRow(rows[0])
  return `${rows.length} kapsam satırı`
}

export function countScopeDistricts(rows: OperationScopeRow[]): number {
  return new Set(rows.map((row) => `${row.il}-${row.ilce}`)).size
}

export function scopeRowKey(row: Pick<OperationScopeRow, 'il' | 'ilce'>) {
  return `${row.il}::${row.ilce}`
}

export function hasOperationRegions(
  giden: OperationScopeRow[],
  gelen: OperationScopeRow[]
): boolean {
  return giden.length > 0 || gelen.length > 0
}
