'use client'

/**
 * DataTable-Kit Basic Features Test & Documentation
 * 
 * Bu sayfa DataTable component'inin temel özelliklerini kapsamlı şekilde test eder
 * ve dokümante eder. Production kullanımı için referans noktasıdır.
 * 
 * @module DataTableBasicTest
 * @category DataTable-Kit
 * 
 * ## 📚 Test Edilen Özellikler
 * 
 * ### 1. Core Features
 * - **Pagination**: Sayfa bazlı veri gösterimi (10, 20, 50, 100 kayıt/sayfa)
 * - **Sorting**: Kolon başlıklarına tıklayarak sıralama (asc/desc)
 * - **Global Search**: Tüm kolonlarda arama yapma
 * - **Column Visibility**: Kolonları göster/gizle
 * - **Row Selection**: Checkbox ile satır seçimi
 * - **Row Actions**: Her satır için action menüsü
 * 
 * ### 2. Interaction Features
 * - Row click events
 * - Selection state management
 * - Responsive design
 * - Loading states
 * - Empty states
 * 
 * ## 🎯 DataTable Nedir?
 * 
 * DataTable-Kit, TanStack Table (React Table v8) üzerine kurulmuş, production-ready
 * bir data table çözümüdür. Shadcn/ui component library ile tam entegrasyon sunar.
 * 
 * ## 🔧 Key Features
 * 
 * - ✅ **Type-Safe**: Full TypeScript support
 * - ✅ **Performant**: Virtualization ready, optimized rendering
 * - ✅ **Flexible**: Customize everything from columns to cells
 * - ✅ **Accessible**: WCAG 2.1 AA compliant
 * - ✅ **Responsive**: Mobile-first design
 * - ✅ **i18n Ready**: Localization support
 * 
 * ## 📦 Import
 * 
 * ```tsx
 * import { 
 *   DataTable, 
 *   DataTableColumnHeader,
 *   createSelectionColumn 
 * } from '@hascanb/arf-ui-kit/datatable-kit'
 * ```
 * 
 * ## 💡 Basic Usage
 * 
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'Name',
 *     cell: ({ row }) => row.getValue('name')
 *   },
 *   // ... more columns
 * ]
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   enablePagination
 *   enableSorting
 *   enableGlobalFilter
 * />
 * ```
 * 
 * ## 🎨 Column Definition Patterns
 * 
 * ### Simple Column
 * ```tsx
 * {
 *   accessorKey: 'email',
 *   header: 'Email'
 * }
 * ```
 * 
 * ### Sortable Column
 * ```tsx
 * {
 *   accessorKey: 'name',
 *   header: ({ column }) => (
 *     <DataTableColumnHeader column={column} title="Name" />
 *   )
 * }
 * ```
 * 
 * ### Custom Cell Rendering
 * ```tsx
 * {
 *   accessorKey: 'status',
 *   cell: ({ row }) => (
 *     <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>
 *       {row.getValue('status')}
 *     </Badge>
 *   )
 * }
 * ```
 * 
 * ### Action Column
 * ```tsx
 * {
 *   id: 'actions',
 *   cell: ({ row }) => (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild>
 *         <Button variant="ghost">Actions</Button>
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem onClick={() => handleEdit(row.original)}>
 *           Edit
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   )
 * }
 * ```
 * 
 * ## ⚠️ Important Notes
 * 
 * - Pagination zorunlu değil ancak yüksek performans için önerilir
 * - Column keys (`accessorKey`) veri objesindeki property'lerle eşleşmeli
 * - `createSelectionColumn()` her zaman ilk kolon olmalı
 * - Actions column'ı genellikle son kolon olarak eklenir
 * 
 * @see advanced - Gelişmiş özellikler (filtering, excel export)
 * @see server-side - Server-side pagination ve filtering
 */

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader, createSelectionColumn } from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { MoreHorizontal, Eye } from 'lucide-react'
import { mockUsers, type User } from '../data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BasicDataTableTestPage() {
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({})

  // Column definitions
  const columns: ColumnDef<User>[] = [
    createSelectionColumn<User>(),
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
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
    {
      accessorKey: 'salary',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salary" />
      ),
      cell: ({ row }) => {
        const salary = row.getValue('salary') as number
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
        }).format(salary)
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>Edit user</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-10 space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">DataTable - Basic Features</h1>
        <p className="text-muted-foreground mt-2">
          Core functionality: Pagination, Sorting, Search, Column Visibility, Row Selection
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="default">Basic Features</Badge>
          <Badge variant="outline">Client-Side</Badge>
          <Badge variant="outline">{mockUsers.length} Records</Badge>
        </div>
      </div>

      {/* Live Demo */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Interactive Demo</CardTitle>
          <CardDescription>
            Test all basic features in action - {mockUsers.length} users loaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockUsers}
            columns={columns}
            enablePagination
            enableSorting
            enableGlobalFilter
            enableColumnVisibility
            enableRowSelection
            rowSelection={selectedRows}
            onRowSelectionChange={setSelectedRows}
            onRowClick={(row) => {
              toast({ title: 'Row clicked', description: row.name })
            }}
          />
          
          {/* Selection Info */}
          {Object.keys(selectedRows).length > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">
                ✓ {Object.keys(selectedRows).length} rows selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Guide */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>✨ Enabled Features</CardTitle>
            <CardDescription>Click and interact with these features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="text-sm font-medium">Pagination</p>
                  <p className="text-xs text-muted-foreground">
                    Bottom-right: Change page size (10/20/50/100) and navigate pages
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="text-sm font-medium">Sorting</p>
                  <p className="text-xs text-muted-foreground">
                    Click column headers - first click: ascending, second: descending, third: reset
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="text-sm font-medium">Global Search</p>
                  <p className="text-xs text-muted-foreground">
                    Top-left search box - searches across all visible columns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="text-sm font-medium">Column Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    Top-right &quot;Columns&quot; button - show/hide columns dynamically
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">5</Badge>
                <div>
                  <p className="text-sm font-medium">Row Selection</p>
                  <p className="text-xs text-muted-foreground">
                    Checkboxes - select multiple rows, header checkbox selects all
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">6</Badge>
                <div>
                  <p className="text-sm font-medium">Row Actions</p>
                  <p className="text-xs text-muted-foreground">
                    Action menu (•••) - contextual actions for each row
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Implementation Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p>
                <strong>Column Headers:</strong> Use <code className="text-xs bg-muted px-1 rounded">DataTableColumnHeader</code> for sortable columns
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p>
                <strong>Selection:</strong> Call <code className="text-xs bg-muted px-1 rounded">createSelectionColumn()</code> as first column
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p>
                <strong>Custom Cells:</strong> Use <code className="text-xs bg-muted px-1 rounded">cell</code> property for Badge, icons, formatting
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p>
                <strong>Type Safety:</strong> Define <code className="text-xs bg-muted px-1 rounded">ColumnDef&lt;YourType&gt;[]</code> for autocomplete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Props Reference */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Props Reference</CardTitle>
          <CardDescription>
            DataTable component props used in this example
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">Prop</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Default</th>
                  <th className="text-left p-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-mono text-xs">data</td>
                  <td className="p-3 font-mono text-xs">T[]</td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-muted-foreground">Array of data objects</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">columns</td>
                  <td className="p-3 font-mono text-xs">ColumnDef[]</td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-muted-foreground">Column definitions</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">enablePagination</td>
                  <td className="p-3 font-mono text-xs">boolean</td>
                  <td className="p-3">false</td>
                  <td className="p-3 text-muted-foreground">Enable pagination controls</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">enableSorting</td>
                  <td className="p-3 font-mono text-xs">boolean</td>
                  <td className="p-3">false</td>
                  <td className="p-3 text-muted-foreground">Enable column sorting</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">enableGlobalFilter</td>
                  <td className="p-3 font-mono text-xs">boolean</td>
                  <td className="p-3">false</td>
                  <td className="p-3 text-muted-foreground">Enable global search</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">enableColumnVisibility</td>
                  <td className="p-3 font-mono text-xs">boolean</td>
                  <td className="p-3">false</td>
                  <td className="p-3 text-muted-foreground">Show column toggle</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">enableRowSelection</td>
                  <td className="p-3 font-mono text-xs">boolean</td>
                  <td className="p-3">false</td>
                  <td className="p-3 text-muted-foreground">Enable row checkboxes</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">onRowClick</td>
                  <td className="p-3 font-mono text-xs">Function</td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-muted-foreground">Row click handler</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>💻 Code Example</CardTitle>
          <CardDescription>
            Complete implementation of this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
            <code>{`import { DataTable, DataTableColumnHeader, createSelectionColumn } from '@hascanb/arf-ui-kit/datatable-kit'
import { ColumnDef } from '@tanstack/react-table'

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const columns: ColumnDef<User>[] = [
  createSelectionColumn<User>(), // Checkbox column
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>
        {row.getValue('status')}
      </Badge>
    )
  }
]

export default function UsersPage() {
  const [selectedRows, setSelectedRows] = useState({})
  
  return (
    <DataTable
      data={users}
      columns={columns}
      enablePagination
      enableSorting
      enableGlobalFilter
      enableColumnVisibility
      enableRowSelection
      rowSelection={selectedRows}
      onRowSelectionChange={setSelectedRows}
      onRowClick={(row) => toast({ title: 'Clicked', description: row.name })}
    />
  )
}`}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Related Pages */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>🔗 Related Examples</CardTitle>
          <CardDescription>
            Explore more DataTable features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/datatable/advanced">
                <Badge className="mr-2">Advanced</Badge>
                Filtering, Faceted Filters, Excel Export
              </a>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/datatable/server-side">
                <Badge className="mr-2">Server-Side</Badge>
                Server Pagination & Filtering
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
