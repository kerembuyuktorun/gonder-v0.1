'use client'

/**
 * Advanced DataTable Test Page
 * 
 * Gelişmiş DataTable özelliklerini test eder:
 * - Toolbar with search
 * - Bulk actions
 * - Sticky columns
 * - Loading states
 * - Empty states
 */

import React, { Suspense } from 'react'
import { ColumnDef, Table as TanStackTable, VisibilityState } from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTablePagination,
  DataTableBulkActions,
  DataTableFacetedFilter,
  DataTableExcelActions,
  createSelectionColumn,
  useDataTableSync,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Trash2, RefreshCw, Pencil, Filter } from 'lucide-react'
import { mockProducts, type Product } from '../data'
import { toast } from 'sonner'

function AdvancedDataTableContent() {
  const [data, setData] = React.useState<Product[]>(mockProducts)
  const [isLoading, setIsLoading] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [table, setTable] = React.useState<TanStackTable<Product> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = React.useState(false)
  const handleTableReady = React.useCallback((nextTable: TanStackTable<Product>) => {
    // Keep latest table instance so toolbar/view-options always stays in sync.
    setTable(nextTable)
  }, [])
  const sync = useDataTableSync({
    defaultPagination: { pageIndex: 0, pageSize: 10 },
    searchColumnId: 'name',
    searchDebounceMs: 400,
  })

  // Faceted filter options
  const categoryOptions = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
  ]

  const statusOptions = [
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' },
  ]

  const brandOptions = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Dell', value: 'Dell' },
    { label: 'Sony', value: 'Sony' },
    { label: 'LG', value: 'LG' },
    { label: 'Logitech', value: 'Logitech' },
    { label: 'Keychron', value: 'Keychron' },
  ]

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setData([])
    setTimeout(() => {
      setData(mockProducts)
      setIsLoading(false)
      toast.success('Data refreshed successfully')
    }, 1500)
  }

  // Simulate bulk delete
  const handleBulkDelete = (selectedRows: Product[]) => {
    const ids = selectedRows.map((row) => row.id)
    setData((prev) => prev.filter((item) => !ids.includes(item.id)))
    setRowSelection({})
    toast.success(`Deleted ${selectedRows.length} products`)
  }

  // Simulate bulk export
  const handleBulkExport = (selectedRows: Product[]) => {
    toast.success(`Exported ${selectedRows.length} products`)
  }

  // Handle Excel import
  const handleImport = (importedData: Product[]) => {
    setData(importedData)
    toast.success(`Data imported successfully`)
  }

  // Column definitions with sticky first/last columns
  const columns: ColumnDef<Product>[] = React.useMemo(
    () => [
      createSelectionColumn<Product>(),
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product ID" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium min-w-[200px]">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
      },
      {
        accessorKey: 'brand',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
          const price = row.getValue('price') as number
          return (
            <div className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(price)}
            </div>
          )
        },
      },
      {
        accessorKey: 'stock',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
          const stock = row.getValue('stock') as number
          return (
            <div className={stock === 0 ? 'text-red-600' : stock < 10 ? 'text-orange-600' : ''}>
              {stock} units
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge
              variant={
                status === 'In Stock'
                  ? 'default'
                  : status === 'Low Stock'
                  ? 'outline'
                  : 'destructive'
              }
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rating" />
        ),
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number
          return (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          )
        },
      },
      {
        id: 'sku',
        accessorFn: (row) => `SKU-${row.id}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="SKU" />
        ),
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('sku') as string}</span>,
      },
      {
        id: 'warehouse',
        accessorFn: (row) => (row.category === 'Electronics' ? 'A-Depot' : 'B-Depot'),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Warehouse" />
        ),
      },
      {
        id: 'supplier',
        accessorFn: (row) => `${row.brand} Supply`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Supplier" />
        ),
        cell: ({ row }) => <span className="min-w-[150px] inline-block">{row.getValue('supplier') as string}</span>,
      },
      {
        id: 'discountRate',
        accessorFn: (row) => (row.status === 'Out of Stock' ? 0 : row.stock < 10 ? 15 : 5),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Discount %" />
        ),
        cell: ({ row }) => <span>{row.getValue('discountRate') as number}%</span>,
      },
      {
        id: 'sales30d',
        accessorFn: (row) => Math.max(0, Math.round((row.rating * 20) + row.stock / 2)),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sales (30d)" />
        ),
      },
      {
        id: 'restockDate',
        accessorFn: (row) => {
          const day = (row.stock % 9) + 10
          return `2026-04-${String(day).padStart(2, '0')}`
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Restock Date" />
        ),
      },
      {
        id: 'priority',
        accessorFn: (row) => {
          if (row.status === 'Out of Stock') return 'High'
          if (row.status === 'Low Stock') return 'Medium'
          return 'Low'
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Priority" />
        ),
      },
    ],
    []
  )

  const renderRowActions = React.useCallback((row: Product) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          toast.info(`Edit: ${row.name}`)
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          toast.error(`Deleted: ${row.name}`)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  ), [])

  const renderSubComponent = React.useCallback((row: Product) => (
    <div className="grid gap-2 p-2 text-sm md:grid-cols-3">
      <div>
        <p className="text-muted-foreground">Product</p>
        <p className="font-medium">{row.name}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Brand / Category</p>
        <p className="font-medium">{row.brand} / {row.category}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Stock</p>
        <p className="font-medium">{row.stock} units</p>
      </div>
    </div>
  ), [])

  return (
    <div className="container mx-auto py-10 space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced DataTable Test</h1>
          <p className="text-muted-foreground mt-2">
            Gelişmiş özellikler: Toolbar, Bulk Actions, Sticky Columns, Loading States
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your product catalog with advanced features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Toolbar */}
          {table && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 items-center gap-2">
                <DataTableToolbar
                  table={table}
                  searchKey="name"
                  searchValue={sync.searchValue}
                  onSearchValueChange={sync.onSearchValueChange}
                  isSearchPending={sync.isSearchPending}
                  searchPlaceholder="Search products..."
                >
                  <Button
                    type="button"
                    variant={showFacetedFilters ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => setShowFacetedFilters((prev) => !prev)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>

                  {showFacetedFilters && (
                    <>
                      <DataTableFacetedFilter
                        column={table.getColumn('category')}
                        title="Category"
                        options={categoryOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn('status')}
                        title="Status"
                        options={statusOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn('brand')}
                        title="Brand"
                        options={brandOptions}
                      />
                    </>
                  )}
                </DataTableToolbar>
              </div>
              
              {/* Excel Actions */}
              <DataTableExcelActions
                table={table}
                filename="products-export"
                exportSelected={false}
                enableImport={true}
                excelSecurity={{
                  maxSizeBytes: 8 * 1024 * 1024,
                  maxRows: 2000,
                  maxColumns: 80,
                  allowLegacyXls: false,
                }}
                requireTrustedSourceConfirmation
                onImport={handleImport}
              />
            </div>
          )}

          {/* DataTable with Advanced Features */}
          <DataTable
            data={data}
            columns={columns}
            // Pagination
            enablePagination
            pagination={sync.pagination}
            onPaginationChange={sync.onPaginationChange}
            // Sorting
            enableSorting
            enableMultiSort
            sorting={sync.sorting}
            onSortingChange={sync.onSortingChange}
            // Filtering
            enableGlobalFilter
            columnFilters={sync.columnFilters}
            onColumnFiltersChange={sync.onColumnFiltersChange}
            // Selection
            enableRowSelection
            enableMultiRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            // Column visibility (controlled to keep View dropdown in sync)
            enableColumnVisibility
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            // Layout
            enableHorizontalScroll
            tableClassName="min-w-[2200px]"
            virtualized
            tableHeight={460}
            estimateRowHeight={54}
            stickyFirstColumn
            stickyLastColumn
            // Advanced rows
            renderRowActions={renderRowActions}
            renderSubComponent={renderSubComponent}
            expandOnRowClick
            // States
            isLoading={isLoading}
            loadingMessage="Loading products..."
            emptyMessage="No products found. Try adjusting your filters."
            // Expose table instance
            onTableReady={handleTableReady}
          />

          {/* Pagination */}
          {table && (
            <DataTablePagination
              table={table}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}

          {/* Bulk Actions */}
          {table && Object.keys(rowSelection).length > 0 && (
            <DataTableBulkActions
              table={table}
              onDelete={(rows) => handleBulkDelete(rows as Product[])}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selected = table
                    .getFilteredSelectedRowModel()
                    .rows
                    .map((row) => row.original)
                  handleBulkExport(selected)
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </DataTableBulkActions>
          )}
        </CardContent>
      </Card>

      {/* Feature Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Layout Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Horizontal Scroll</Badge>
              <span>Table scrolls horizontally when content overflows</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Sticky Columns</Badge>
              <span>First and last columns stay fixed during scroll</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Responsive</Badge>
              <span>Adapts to different screen sizes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interaction Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Bulk Actions</Badge>
              <span>Perform actions on selected rows</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Virtualized</Badge>
              <span>Only visible rows are rendered</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">URL Sync</Badge>
              <span>Pagination, sorting and filters are synced to query params</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Loading States</Badge>
              <span>Graceful loading animations</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Empty States</Badge>
              <span>User-friendly empty state messages</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdvancedDataTableTestPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">Loading table...</div>}>
      <AdvancedDataTableContent />
    </Suspense>
  )
}
