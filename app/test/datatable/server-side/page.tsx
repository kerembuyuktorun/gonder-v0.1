'use client'

/**
 * Server-Side DataTable Test Page
 * 
 * Server-side veri yönetimi özelliklerini test eder:
 * - Manual pagination (API-based)
 * - Manual sorting (backend sorting)
 * - Manual filtering (backend filtering)
 * - Loading states
 * - Error handling
 */

import React, { Suspense } from 'react'
import { ColumnDef, SortingState,  ColumnFiltersState, Table as TanStackTable } from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTablePagination,
  createSelectionColumn,
  useDataTableSync,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { mockUsers, type User } from '../data'

// Simulated API response type
interface ApiResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    pageCount: number
  }
}

// Simulate API delay
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      resolve()
    }, ms)

    if (!signal) return

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true }
    )
  })

// Simulated API call
async function fetchUsers(
  page: number,
  pageSize: number,
  sorting: SortingState,
  filters: ColumnFiltersState,
  signal?: AbortSignal
): Promise<ApiResponse<User>> {
  await delay(800, signal) // Simulate network delay

  // Apply filtering
  let filteredData = [...mockUsers]
  filters.forEach((filter) => {
    const value = filter.value as string
    if (value) {
      filteredData = filteredData.filter((user) => {
        const fieldValue = user[filter.id as keyof User]
        return String(fieldValue).toLowerCase().includes(value.toLowerCase())
      })
    }
  })

  // Apply sorting
  if (sorting.length > 0) {
    const sort = sorting[0]
    filteredData.sort((a, b) => {
      const aValue = a[sort.id as keyof User]
      const bValue = b[sort.id as keyof User]
      
      if (aValue < bValue) return sort.desc ? 1 : -1
      if (aValue > bValue) return sort.desc ? -1 : 1
      return 0
    })
  }

  // Apply pagination
  const total = filteredData.length
  const start = page * pageSize
  const end = start + pageSize
  const paginatedData = filteredData.slice(start, end)

  return {
    data: paginatedData,
    meta: {
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    },
  }
}

function ServerSideDataTableContent() {
  // Data state
  const [data, setData] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [table, setTable] = React.useState<TanStackTable<User> | null>(null)

  // Table state
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const sync = useDataTableSync({
    defaultPagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    searchColumnId: 'name',
    searchDebounceMs: 400,
  })

  // Server-side state
  const [totalRows, setTotalRows] = React.useState(0)
  const [pageCount, setPageCount] = React.useState(0)

  // Load data
  const loadData = React.useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchUsers(
        sync.pagination.pageIndex,
        sync.pagination.pageSize,
        sync.sorting,
        sync.columnFilters,
        signal
      )

      setData(response.data)
      setTotalRows(response.meta.total)
      setPageCount(response.meta.pageCount)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setError('Failed to load data. Please try again.')
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [sync.columnFilters, sync.pagination.pageIndex, sync.pagination.pageSize, sync.sorting])

  // Load data on mount and when dependencies change
  React.useEffect(() => {
    const controller = new AbortController()
    void loadData(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadData])

  // Column definitions
  const columns: ColumnDef<User>[] = [
    createSelectionColumn<User>(),
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>
            {role}
          </Badge>
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
              status === 'Active'
                ? 'default'
                : status === 'Pending'
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
      accessorKey: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
    },
    {
      accessorKey: 'joinDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Join Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('joinDate'))
        return date.toLocaleDateString('tr-TR')
      },
    },
  ]

  return (
    <div className="container mx-auto py-10 space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Server-Side DataTable Test</h1>
          <p className="text-muted-foreground mt-2">
            API entegrasyonu: Manuel pagination, sorting ve filtering
          </p>
        </div>
        <Button
          onClick={() => {
            void loadData()
          }}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Server-side data management with {totalRows} total users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          {table && (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchValue={sync.searchValue}
              onSearchValueChange={sync.onSearchValueChange}
              isSearchPending={sync.isSearchPending}
              searchPlaceholder="Search users..."
            />
          )}

          {/* DataTable with Server-Side Features */}
          <DataTable
            data={data}
            columns={columns}
            // Server-side pagination
            enablePagination
            manualPagination
            pageCount={pageCount}
            pagination={sync.pagination}
            onPaginationChange={sync.onPaginationChange}
            // Server-side sorting
            enableSorting
            manualSorting
            sorting={sync.sorting}
            onSortingChange={sync.onSortingChange}
            // Server-side filtering
            enableGlobalFilter
            manualFiltering
            columnFilters={sync.columnFilters}
            onColumnFiltersChange={sync.onColumnFiltersChange}
            // Selection
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            // States
            isLoading={isLoading}
            loadingMessage="Loading from server..."
            emptyMessage="No users found on the server."
            // Expose table instance
            onTableReady={setTable}
          />

          {/* Pagination */}
          {table && (
            <DataTablePagination
              table={table}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}

          {/* Server State Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-4">
              <span>
                Page {sync.pagination.pageIndex + 1} of {pageCount}
              </span>
              <span>•</span>
              <span>{totalRows} total records</span>
              <span>•</span>
              <span>{Object.keys(rowSelection).length} selected</span>
            </div>
            {isLoading && (
              <Badge variant="outline">
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                Loading...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Server-Side Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">Manual Pagination</div>
              <p className="text-muted-foreground">
                Sayfalama backend'de yapılır. `manualPagination=true` ve `pageCount` prop'u kullanılır.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Manual Sorting</div>
              <p className="text-muted-foreground">
                Sıralama API'ye gönderilir. `manualSorting=true` ve `onSortingChange` kullanılır.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Manual Filtering</div>
              <p className="text-muted-foreground">
                Filtreler backend'de uygulanır. `manualFiltering=true` ile aktif edilir.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`// State management
const sync = useDataTableSync({
  defaultPagination: { pageIndex: 0, pageSize: 10 },
  searchColumnId: 'name',
  searchDebounceMs: 400,
})

// Load data when state changes
useEffect(() => {
  const controller = new AbortController()
  fetchDataFromAPI(sync.pagination, sync.sorting, sync.columnFilters, controller.signal)
  return () => controller.abort()
}, [sync.pagination, sync.sorting, sync.columnFilters])

// DataTable configuration
<DataTable
  data={data}
  columns={columns}
  manualPagination
  pageCount={pageCount}
  pagination={sync.pagination}
  onPaginationChange={sync.onPaginationChange}
  manualSorting
  sorting={sync.sorting}
  onSortingChange={sync.onSortingChange}
  manualFiltering
  columnFilters={sync.columnFilters}
  onColumnFiltersChange={sync.onColumnFiltersChange}
/>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ServerSideDataTableTestPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">Loading table...</div>}>
      <ServerSideDataTableContent />
    </Suspense>
  )
}
