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
import { ARF_ROUTES } from '../../../_shared/routes'
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
  createUserColumns,
  userKindFilterOptions,
  userRoleFilterOptions,
} from './_columns/users-columns'
import { ChangeRoleModal } from './_components/change-role-modal'
import {
  CreateUserModal,
  type UserCreateFormValues,
} from './_components/create-user-modal'
import { UserListTabs } from './_components/user-list-tabs'
import { UsersKpiCards } from './_components/users-kpi-cards'
import {
  assignUserRole,
  fetchUsersList,
  inviteUser,
  passiveUser,
  activateUser,
  sendPasswordResetLink,
  updateUser,
  updateUserPersonnelProfile,
} from './_api/users-client'
import {
  buildInviteUserInput,
  buildPersonnelProfileInput,
  buildUpdateUserInput,
} from './_lib/map-user'
import type {
  LastmileUser,
  UserKind,
  UserListKpi,
  UserStatusScope,
} from './_types/user'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function formatUsersLoadError(error: string): string {
  if (/unknown|internal server error/i.test(error)) {
    return 'Kullanıcı listesi şu an alınamadı. Lütfen sayfayı yenileyin veya biraz sonra tekrar deneyin.'
  }
  return error
}

export default function UsersListPage() {
  const [table, setTable] = useState<TanStackTable<LastmileUser> | null>(null)
  const [data, setData] = useState<LastmileUser[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusScope, setStatusScope] = useState<UserStatusScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'ad_soyad', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<LastmileUser | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<LastmileUser | null>(null)
  const [kpi, setKpi] = useState<UserListKpi>({
    total: 0,
    active: 0,
    suspended: 0,
    invited: 0,
    internal: 0,
    customer: 0,
  })
  const [statusCounts, setStatusCounts] = useState<Record<UserStatusScope, number>>({
    all: 0,
    aktif: 0,
    pasif: 0,
    davet: 0,
    askida: 0,
  })

  const kindFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'kullanici_tipi')
    return Array.isArray(filter?.value) ? (filter?.value as UserKind[]) : []
  }, [columnFilters])

  const roleFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'rol')
    return Array.isArray(filter?.value) ? (filter?.value as string[]) : []
  }, [columnFilters])

  const filteredData = useMemo(() => {
    let rows = data
    if (kindFilter.length > 0) {
      rows = rows.filter((user) => kindFilter.includes(user.kullanici_tipi))
    }
    if (roleFilter.length > 0) {
      rows = rows.filter((user) => roleFilter.includes(String(user.rol)))
    }
    return rows
  }, [data, kindFilter, roleFilter])

  const handleEdit = useCallback((user: LastmileUser) => {
    setEditingUser(user)
    setUserModalOpen(true)
  }, [])

  const handleChangeRole = useCallback((user: LastmileUser) => {
    setRoleUser(user)
    setRoleModalOpen(true)
  }, [])

  const handleSendPasswordReset = useCallback(async (user: LastmileUser) => {
    const result = await sendPasswordResetLink(user.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`Şifre sıfırlama bağlantısı ${user.email} adresine gönderildi`)
  }, [])

  const handleToggleAccess = useCallback(async (user: LastmileUser) => {
    if (user.durum === 'davet') {
      toast.message('Davet durumundaki kullanıcı pasife alınamaz')
      return
    }

    const result =
      user.durum === 'pasif' || user.durum === 'askida'
        ? await activateUser(user.id)
        : await passiveUser(user.id)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      user.durum === 'pasif' || user.durum === 'askida'
        ? `${user.ad_soyad} aktif edildi`
        : `${user.ad_soyad} pasife alındı`
    )
    setRefreshKey((previous) => previous + 1)
  }, [])

  const handleUserSubmit = useCallback(
    async (values: UserCreateFormValues) => {
      if (!values.roleId) {
        throw new Error('Rol seçin')
      }
      if (!values.kullanici_tipi) {
        throw new Error('Kullanıcı tipi seçin')
      }

      if (editingUser) {
        const updateResult = await updateUser(
          editingUser.id,
          buildUpdateUserInput(values)
        )
        if (!updateResult.success) {
          throw new Error(updateResult.error)
        }

        if (values.roleId !== editingUser.roleId) {
          const roleResult = await assignUserRole(editingUser.id, values.roleId)
          if (!roleResult.success) {
            throw new Error(roleResult.error)
          }
        }

        if (values.kullanici_tipi === 'ic_ekip') {
          const personnelResult = await updateUserPersonnelProfile(
            editingUser.id,
            buildPersonnelProfileInput(values.personel)
          )
          if (!personnelResult.success) {
            throw new Error(personnelResult.error)
          }
        }

        toast.success(`${values.ad_soyad.trim()} güncellendi`)
      } else {
        const inviteResult = await inviteUser(
          buildInviteUserInput({
            ad_soyad: values.ad_soyad,
            email: values.email,
            telefon: values.telefon,
            kullanici_tipi: values.kullanici_tipi as UserKind,
            musteri_id: values.musteri_id,
            roleId: values.roleId,
          })
        )
        if (!inviteResult.success) {
          throw new Error(inviteResult.error)
        }

        toast.success(`${values.ad_soyad.trim()} davet edildi`)
      }

      setEditingUser(null)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
      setRefreshKey((previous) => previous + 1)
    },
    [editingUser]
  )

  const handleRoleSubmit = useCallback(
    async (roleId: string) => {
      if (!roleUser) return
      const result = await assignUserRole(roleUser.id, roleId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${roleUser.ad_soyad} rolü güncellendi`)
      setRoleUser(null)
      setRefreshKey((previous) => previous + 1)
    },
    [roleUser]
  )

  const columns = useMemo(
    () =>
      createUserColumns({
        onEdit: handleEdit,
        onSendPasswordReset: handleSendPasswordReset,
        onToggleAccess: handleToggleAccess,
      }),
    [handleEdit, handleSendPasswordReset, handleToggleAccess]
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      const result = await fetchUsersList({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: globalFilter,
        statusScope,
      })

      if (cancelled) return

      if (!result.success) {
        setData([])
        setTotalRows(0)
        setLoadError(formatUsersLoadError(result.error))
        setIsLoading(false)
        return
      }

      setData(result.data.items)
      setTotalRows(result.data.total)
      setKpi(result.data.kpi)
      setStatusCounts(result.data.statusCounts)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    refreshKey,
    statusScope,
  ])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileUser>) => {
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

  const handleStatusScopeChange = (scope: UserStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Kullanıcı listesi yenilendi')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))
  const displayData = kindFilter.length > 0 || roleFilter.length > 0 ? filteredData : data

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Kullanıcı Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Kullanıcı Listesi</h1>
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
                setEditingUser(null)
                setUserModalOpen(true)
              }}
            >
              <Plus className='mr-2 size-4' />
              Kullanıcı Davet Et
            </Button>
          </div>
        </div>

        {showSummary && <UsersKpiCards kpi={kpi} />}

        {loadError ? (
          <div className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            {loadError}
          </div>
        ) : null}

        <CreateUserModal
          open={userModalOpen}
          onOpenChange={(open) => {
            setUserModalOpen(open)
            if (!open) setEditingUser(null)
          }}
          mode={editingUser ? 'edit' : 'create'}
          initialUser={editingUser}
          onSubmit={handleUserSubmit}
        />

        <ChangeRoleModal
          open={roleModalOpen}
          onOpenChange={(open) => {
            setRoleModalOpen(open)
            if (!open) setRoleUser(null)
          }}
          user={roleUser}
          onSubmit={handleRoleSubmit}
        />

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <UserListTabs
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
                        placeholder='Ad, e-posta, telefon veya kurum ara...'
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
                            column={table.getColumn('kullanici_tipi')}
                            title='Tip'
                            options={userKindFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('rol')}
                            title='Rol'
                            options={userRoleFilterOptions}
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
                              filename='kullanici-listesi'
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
              data={displayData}
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
              emptyMessage='Gösterilecek kullanıcı bulunamadı.'
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
