/**
 * DataTable Kit - Type Definitions
 * 
 * TanStack Table tabanlı veri tablosu tipleri
 */

import type { 
  ColumnDef, 
  Row,
  RowData,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  OnChangeFn,
  Table as TanStackTable
} from '@tanstack/react-table'
import type { ExcelImportSecurityOptions } from './utils/excel'

/**
 * DataTable ana props
 */
export interface DataTableProps<TData = unknown> {
  // Required
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  
  // Pagination
  enablePagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
  manualPagination?: boolean
  
  // Sorting
  enableSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  manualSorting?: boolean
  enableMultiSort?: boolean
  
  // Filtering
  enableGlobalFilter?: boolean
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  manualFiltering?: boolean
  
  // Column Visibility
  enableColumnVisibility?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  
  // Row Selection
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  enableMultiRowSelection?: boolean
  /** Stable row id for selection across pages (defaults to row index) */
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  
  // Custom Actions
  renderRowActions?: (row: TData) => React.ReactNode
  renderBulkActions?: (selectedRows: TData[]) => React.ReactNode
  renderSubComponent?: (row: TData) => React.ReactNode
  expandOnRowClick?: boolean
  allowVirtualizedExpansion?: boolean
  
  // Toolbar
  showToolbar?: boolean
  showSearch?: boolean
  showColumnSelector?: boolean
  showExcelExport?: boolean
  toolbarClassName?: string
  
  // Table Layout
  enableHorizontalScroll?: boolean
  virtualized?: boolean
  tableHeight?: number
  estimateRowHeight?: number
  overscan?: number
  stickyFirstColumn?: boolean
  stickyLeftColumnCount?: number
  stickyLastColumn?: boolean
  stickyRightColumnCount?: number
  
  // Styling
  className?: string
  tableClassName?: string
  
  // Loading & Empty States
  isLoading?: boolean
  emptyMessage?: string
  loadingMessage?: string
  
  // Callbacks
  onRowClick?: (row: TData) => void
  onRowDoubleClick?: (row: TData) => void
  onTableReady?: (table: TanStackTable<TData>) => void
}

/**
 * Pagination component props
 */
export interface DataTablePaginationProps<TData = unknown> {
  table: TanStackTable<TData>
  pageSizeOptions?: number[]
  showPageInfo?: boolean
  showPageSizeSelector?: boolean
  totalRows?: number
}

/**
 * Column header props
 */
export interface DataTableColumnHeaderProps<TData = unknown> {
  column: TanStackTable<TData>['getColumn'] extends (id: string) => infer R ? NonNullable<R> : never
  title: string
  className?: string
  /** Kolon bazlı arama (mercek ikonu) — varsayılan: true */
  enableSearch?: boolean
}

/**
 * Toolbar props
 */
export interface DataTableToolbarProps<TData = unknown> {
  table: TanStackTable<TData>
  searchKey?: string
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  isSearchPending?: boolean
  showSearch?: boolean
  showColumnSelector?: boolean
  showExcelExport?: boolean
  searchPlaceholder?: string
  className?: string
  children?: React.ReactNode
  /** Reset button label (default: 'Reset') */
  resetLabel?: string
  /** View/column-selector button label passed to DataTableViewOptions */
  viewLabel?: string
  /** Column section heading inside the view popover */
  columnsLabel?: string
}

/**
 * View options (column visibility) props
 */
export interface DataTableViewOptionsProps<TData = unknown> {
  table: TanStackTable<TData>
  variant?: 'dropdown' | 'popover'
  /** Button label (default: 'View') */
  label?: string
  /** Columns section heading (default: 'Columns') */
  columnsLabel?: string
  /** Optional className for trigger button */
  className?: string
}

/**
 * Bulk actions props
 */
export interface DataTableBulkActionsProps<TData = unknown> {
  table: TanStackTable<TData>
  children?: React.ReactNode
  onDelete?: (rows: TData[]) => void
  onExport?: (rows: TData[]) => void
}

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  onlySelected?: boolean
}

/**
 * Faceted filter option
 */
export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Faceted filter props
 */
export interface DataTableFacetedFilterProps<TData, _TValue> {
  column?: TanStackTable<TData>['getColumn'] extends (id: string) => infer R ? R : never
  title?: string
  options: FacetedFilterOption[]
}

/**
 * Excel actions props
 */
export interface DataTableExcelActionsProps<TData> {
  table: TanStackTable<TData>
  filename?: string
  exportSelected?: boolean
  enableImport?: boolean
  onImport?: (data: TData[]) => void
  exportLabel?: string
  importLabel?: string
  exportButtonClassName?: string
  excelSecurity?: ExcelImportSecurityOptions
  requireTrustedSourceConfirmation?: boolean
  trustedSourceConfirmationMessage?: string
}

/**
 * Column meta data (custom properties)
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    // Responsive
    hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
    priority?: number
    
    // Styling
    headerClassName?: string
    cellClassName?: string
    
    // Excel
    excelFormat?: string
    excelWidth?: number

    // Display
    label?: string

    // Type anchors (lint için generic parametreleri gerçek kullanımda tutar)
    __rowType?: TData
    __valueType?: TValue
  }
}
