'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TanStackTable,
  Updater,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  activateRole,
  createRole,
  deleteRole,
  fetchRoleDetail,
  suspendRole,
  updateRole,
} from './_api/roles-api'
import {
  createRoleColumns,
  roleTypeFilterOptions,
} from './_columns/roles-columns'
import {
  CreateRoleModal,
  type RoleFormValues,
} from './_components/create-role-modal'
import { RoleListTabs } from './_components/role-list-tabs'
import { RolesKpiCards } from './_components/roles-kpi-cards'
import { computeRoleKpi, computeStatusCounts, getStoredRoles } from './_mock/roles-mock-data'
import { queryRoles } from './_lib/query-roles'
import type {
  LastmileRole,
  RoleDetail,
  RoleStatusScope,
  RoleType,
} from './_types/role'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

export default function RolesListPage() {
  const [source, setSource] = useState<LastmileRole[]>(() => getStoredRoles())
  const [table, setTable] = useState<TanStackTable<LastmileRole> | null>(null)
  const [data, setData] = useState<LastmileRole[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusScope, setStatusScope] = useState<RoleStatusScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'userCount', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null)

  const kpi = useMemo(() => computeRoleKpi(source), [source])
  const statusCounts = useMemo(() => computeStatusCounts(source), [source])

  const typeFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'roleType')
    return Array.isArray(filter?.value) ? (filter?.value as RoleType[]) : []
  }, [columnFilters])

  const handleEdit = useCallback(async (role: LastmileRole) => {
    const detail = await fetchRoleDetail(role.id)
    setEditingRole(detail ?? null)
    setRoleModalOpen(true)
  }, [])

  const handleToggleStatus = useCallback(async (role: LastmileRole) => {
    const isPassive = role.status === 'passive'
    const updated = isPassive ? await activateRole(role.id) : await suspendRole(role.id)
    if (!updated) return

    setSource((previous) =>
      previous.map((item) => (item.id === updated.id ? updated : item))
    )
    toast.success(
      isPassive ? `${role.name} aktifleştirildi` : `${role.name} pasife alındı`
    )
  }, [])

  const handleDelete = useCallback(async (role: LastmileRole) => {
    const result = await deleteRole(role.id)
    if (!result.ok) {
      toast.error(result.reason ?? 'Rol silinemedi.')
      return
    }
    setSource((previous) => previous.filter((item) => item.id !== role.id))
    toast.success(`${role.name} silindi`)
  }, [])

  const handleRoleSubmit = useCallback(
    async (values: RoleFormValues) => {
      if (editingRole) {
        const updated = await updateRole(editingRole.id, {
          name: values.name,
          description: values.description,
        })
        if (!updated) throw new Error('Rol güncellenemedi')
        setSource((previous) =>
          previous.map((item) => (item.id === updated.id ? updated : item))
        )
        toast.success(`${updated.name} güncellendi`)
      } else {
        const created = await createRole({
          name: values.name,
          description: values.description,
        })
        setSource((previous) => [created, ...previous])
        toast.success(`${created.name} oluşturuldu`)
      }

      setEditingRole(null)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
      setRefreshKey((previous) => previous + 1)
    },
    [editingRole]
  )

  const columns = useMemo(
    () =>
      createRoleColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete,
      }),
    [handleDelete, handleEdit, handleToggleStatus]
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    setIsLoading(true)
    const sort = sorting[0]
    const result = queryRoles({
      items: source,
      search: globalFilter,
      statusScope,
      types: typeFilter,
      sortBy: sort?.id,
      sortDir: sort?.desc ? 'desc' : 'asc',
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    })
    setData(result.items)
    setTotalRows(result.total)
    setIsLoading(false)
  }, [
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    refreshKey,
    sorting,
    source,
    statusScope,
    typeFilter,
  ])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileRole>) => {
    setTable(instance)
  }, [])

  const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
    setPagination((previous) => resolveUpdater(updater, previous))
  }, [])

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleStatusScopeChange = (scope: RoleStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Rol listesi yenilendi')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Roller ve Yetkiler' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Roller ve Yetkiler</h1>
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 rounded-full'
              onClick={() => setShowSummary((previous) => !previous)}
            >
              {showSummary ? (
                <ChevronUp className='mr-2 size-4' />
              ) : (
                <ChevronDown className='mr-2 size-4' />
              )}
              {showSummary ? 'Özeti Gizle' : 'Özeti Göster'}
            </Button>
            <Button
              size='sm'
              type='button'
              onClick={() => {
                setEditingRole(null)
                setRoleModalOpen(true)
              }}
            >
              <Plus className='mr-2 size-4' />
              Yeni Rol Oluştur
            </Button>
          </div>
        </div>

        {showSummary && <RolesKpiCards kpi={kpi} />}

        <CreateRoleModal
          open={roleModalOpen}
          onOpenChange={(open) => {
            setRoleModalOpen(open)
            if (!open) setEditingRole(null)
          }}
          mode={editingRole ? 'edit' : 'create'}
          initialRole={editingRole}
          existingRoles={source}
          onSubmit={handleRoleSubmit}
        />

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <RoleListTabs
                    statusScope={statusScope}
                    counts={statusCounts}
                    onStatusScopeChange={handleStatusScopeChange}
                  />

                  <Button
                    type='button'
                    variant={showSearch ? 'default' : 'outline'}
                    size='sm'
                    className='h-8'
                    onClick={() => {
                      setShowSearch((previous) => {
                        const next = !previous
                        if (next) setShowFacetedFilters(false)
                        return next
                      })
                    }}
                  >
                    <Search className='mr-2 size-4' />
                    Ara
                    {searchInput.trim().length > 0 && (
                      <Badge variant='secondary' className='ml-2 rounded-sm px-1 font-normal'>
                        1
                      </Badge>
                    )}
                  </Button>

                  {showSearch ? (
                    <div className='relative min-w-[280px] max-w-md flex-1'>
                      <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                      <Input
                        autoFocus
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder='Rol adı veya açıklama ara...'
                        className='h-8 pl-8'
                      />
                    </div>
                  ) : (
                    <>
                      <Button
                        type='button'
                        variant={showFacetedFilters ? 'default' : 'outline'}
                        size='sm'
                        className='h-8'
                        onClick={() => {
                          setShowFacetedFilters((previous) => {
                            const next = !previous
                            if (next) setShowSearch(false)
                            return next
                          })
                        }}
                      >
                        <Filter className='mr-2 size-4' />
                        Filtreler
                        {columnFilters.length > 0 && (
                          <Badge variant='secondary' className='ml-2 rounded-sm px-1 font-normal'>
                            {columnFilters.length}
                          </Badge>
                        )}
                      </Button>

                      {showFacetedFilters ? (
                        <>
                          <DataTableFacetedFilter
                            column={table.getColumn('roleType')}
                            title='Tip'
                            options={roleTypeFilterOptions}
                          />
                          {columnFilters.length > 0 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-8 px-2 lg:px-3'
                              onClick={() => {
                                setColumnFilters([])
                                table.resetColumnFilters()
                                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
                              }}
                            >
                              Sıfırla
                              <X className='ml-2 size-4' />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <DataTableViewOptions
                            table={table}
                            label='Görünüm'
                            columnsLabel='Sütunlar'
                            className='ml-0 flex h-8'
                          />
                          <div className='flex flex-row-reverse items-center gap-2'>
                            <DataTableExcelActions
                              table={table}
                              filename='rol-listesi'
                              exportSelected={false}
                              exportLabel='Dışarı Aktar'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-8'
                            onClick={handleManualRefresh}
                          >
                            <RefreshCw className='mr-2 size-4' />
                            Yenile
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <DataTable
              data={data}
              columns={columns}
              enablePagination
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              pageCount={pageCount}
              manualPagination
              enableSorting
              sorting={sorting}
              onSortingChange={handleSortingChange}
              manualSorting
              enableGlobalFilter
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              columnFilters={columnFilters}
              onColumnFiltersChange={handleColumnFiltersChange}
              manualFiltering
              enableColumnVisibility
              enableHorizontalScroll
              stickyFirstColumn
              stickyLeftColumnCount={1}
              stickyLastColumn
              isLoading={isLoading}
              className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
              emptyMessage='Gösterilecek rol bulunamadı.'
              onTableReady={handleTableReady}
            />

            {table && (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRows={totalRows}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
