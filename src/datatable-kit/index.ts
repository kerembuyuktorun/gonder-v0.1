/**
 * DataTable Kit
 * 
 * TanStack Table-based data table components with sorting, filtering, pagination.
 * 
 * @status Sprint 2 Complete (Advanced Features)
 * @version 1.1.0
 */

// Core component
export { DataTable } from './components/DataTable'

// Sub-components
export { DataTablePagination } from './components/DataTablePagination'
export { DataTableColumnHeader } from './components/DataTableColumnHeader'
export { DataTableToolbar } from './components/DataTableToolbar'
export { DataTableViewOptions } from './components/DataTableViewOptions'
export { DataTableBulkActions } from './components/DataTableBulkActions'
export { DataTableFacetedFilter } from './components/DataTableFacetedFilter'
export { DataTableExcelActions } from './components/DataTableExcelActions'

// Utilities
export { createSelectionColumn } from './components/SelectionColumn'
export {
  exportToExcel,
  importFromExcel,
  downloadExcelTemplate,
  validateExcelFile,
} from './utils/excel'
export {
  getPageNumbers,
  getPageNumbersWithEllipsis,
  getPaginationInfo,
} from './utils/get-page-numbers'

// Hooks
export { useTableUrlState } from './hooks/useTableUrlState'
export { useDataTableSync } from './hooks/useDataTableSync'

// Types
export type {
  DataTableProps,
  DataTablePaginationProps,
  DataTableColumnHeaderProps,
  DataTableToolbarProps,
  DataTableViewOptionsProps,
  DataTableBulkActionsProps,
  DataTableFacetedFilterProps,
  DataTableExcelActionsProps,
  ExcelExportOptions,
  FacetedFilterOption,
} from './types'
export type {
  ExcelImportOptions,
  ExcelImportSecurityOptions,
  ExcelValidationResult,
} from './utils/excel'
export type {
  TableUrlStateOptions,
  TableUrlState,
} from './hooks/useTableUrlState'
export type {
  DataTableSyncOptions,
  DataTableSyncState,
} from './hooks/useDataTableSync'

export const DATATABLE_KIT_VERSION = '1.1.0'
