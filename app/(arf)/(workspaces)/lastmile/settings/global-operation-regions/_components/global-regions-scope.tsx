'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  Table as TanStackTable,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  ChevronDown,
  Filter,
  LayoutList,
  PauseCircle,
  Pencil,
  PlayCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { OperationScopeRowModal } from '../../../customers/[id]/_components/operation-scope-row-modal'
import { scopeRowKey } from '../../../customers/[id]/_lib/operation-scope-helpers'
import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import type {
  GlobalOperationScopeRow,
  GlobalOperationScopeStatus,
} from '../_types/global-regions'

type StatusScope = 'all' | GlobalOperationScopeStatus

type Props = {
  scopes: GlobalOperationScopeRow[]
  onChange: (scopes: GlobalOperationScopeRow[]) => void
  createRequest: number
  onRefresh: () => void
}

function neighborhoodLabel(row: GlobalOperationScopeRow) {
  if (row.tum_mahalleler) return 'Tüm mahalleler'
  if (row.mahalleler.length === 1) return row.mahalleler[0]
  return `${row.mahalleler.length} mahalle`
}

export function GlobalRegionsScope({
  scopes,
  onChange,
  createRequest,
  onRefresh,
}: Props) {
  const [table, setTable] = useState<TanStackTable<GlobalOperationScopeRow> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<GlobalOperationScopeRow | null>(null)
  const [statusScope, setStatusScope] = useState<StatusScope>('all')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    if (createRequest === 0) return
    setEditingRow(null)
    setModalOpen(true)
  }, [createRequest])

  const existingKeys = useMemo(() => {
    const keys = scopes.map((row) => scopeRowKey(row))
    if (!editingRow) return keys
    const editingKey = scopeRowKey(editingRow)
    return keys.filter((key) => key !== editingKey)
  }, [editingRow, scopes])
  const visibleScopes = useMemo(
    () =>
      statusScope === 'all'
        ? scopes
        : scopes.filter((scope) => scope.status === statusScope),
    [scopes, statusScope]
  )
  const cityOptions = useMemo(
    () =>
      [...new Set(scopes.map((scope) => scope.il))]
        .sort((a, b) => a.localeCompare(b, 'tr'))
        .map((value) => ({ label: value, value })),
    [scopes]
  )
  const counts = useMemo(
    () => ({
      all: scopes.length,
      active: scopes.filter((scope) => scope.status === 'active').length,
      passive: scopes.filter((scope) => scope.status === 'passive').length,
    }),
    [scopes]
  )

  const columns = useMemo<ColumnDef<GlobalOperationScopeRow>[]>(
    () => [
      {
        accessorKey: 'il',
        size: 190,
        minSize: 160,
        meta: { label: 'Şehir' },
        header: ({ column }) => <DataTableColumnHeader column={column} title='Şehir' />,
        cell: ({ row }) => (
          <span className='text-sm font-semibold text-foreground'>{row.original.il}</span>
        ),
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
      },
      {
        accessorKey: 'ilce',
        size: 200,
        minSize: 160,
        meta: { label: 'İlçe' },
        header: ({ column }) => <DataTableColumnHeader column={column} title='İlçe' />,
        cell: ({ row }) => (
          <span className='text-sm font-medium text-foreground'>{row.original.ilce}</span>
        ),
      },
      {
        id: 'mahalle_kapsami',
        accessorFn: (row) =>
          row.tum_mahalleler ? 'Tüm mahalleler' : row.mahalleler.join(' '),
        enableSorting: false,
        size: 360,
        minSize: 280,
        meta: { label: 'Mahalle Kapsamı' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Mahalle Kapsamı' />
        ),
        cell: ({ row }) => (
          <div className='min-w-0'>
            <Badge
              variant='outline'
              className={
                row.original.tum_mahalleler
                  ? 'border-emerald-200 bg-emerald-50 font-medium text-emerald-700 shadow-none'
                  : 'border-slate-200 bg-slate-50 font-medium text-slate-600 shadow-none'
              }
            >
              {neighborhoodLabel(row.original)}
            </Badge>
            {!row.original.tum_mahalleler && row.original.mahalleler.length > 0 ? (
              <p
                className='mt-1 max-w-xs truncate text-xs text-muted-foreground'
                title={row.original.mahalleler.join(', ')}
              >
                {row.original.mahalleler.join(', ')}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        size: 150,
        minSize: 140,
        meta: { label: 'Durum' },
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge
            variant='outline'
            className={
              row.original.status === 'active'
                ? 'border-emerald-200 bg-emerald-50 font-medium text-emerald-700 shadow-none'
                : 'border-slate-200 bg-slate-50 font-medium text-slate-600 shadow-none'
            }
          >
            {row.original.status === 'active' ? 'Aktif' : 'Pasif'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        size: 136,
        minSize: 136,
        maxSize: 152,
        header: () => <span className='sr-only'>İşlemler</span>,
        cell: ({ row }) => {
          const scope = row.original
          const isPassive = scope.status === 'passive'

          return (
            <div className='flex justify-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium'
                  >
                    İşlemler
                    <ChevronDown className='ml-1 size-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-52'>
                  <DropdownMenuLabel>
                    {scope.il} · {scope.ilce}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditingRow(scope)
                      setModalOpen(true)
                    }}
                  >
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      onChange(scopes.filter((item) => item.id !== scope.id))
                    }
                    className='text-rose-700 focus:text-rose-700'
                  >
                    <Trash2 className='mr-2 size-4' />
                    Sil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      onChange(
                        scopes.map((item) =>
                          item.id === scope.id
                            ? {
                                ...item,
                                status: isPassive
                                  ? ('active' as const)
                                  : ('passive' as const),
                              }
                            : item
                        )
                      )
                    }
                    className={
                      isPassive
                        ? 'text-emerald-700 focus:text-emerald-700'
                        : 'text-rose-700 focus:text-rose-700'
                    }
                  >
                    {isPassive ? (
                      <>
                        <PlayCircle className='mr-2 size-4' />
                        Aktifleştir
                      </>
                    ) : (
                      <>
                        <PauseCircle className='mr-2 size-4' />
                        Pasife Al
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onChange, scopes]
  )

  const handleSave = (row: OperationScopeRow) => {
    const existing = scopes.find((item) => item.id === row.id)
    const next: GlobalOperationScopeRow = {
      ...row,
      status: existing?.status ?? 'active',
    }
    onChange(
      existing
        ? scopes.map((item) => (item.id === next.id ? next : item))
        : [...scopes, next]
    )
  }

  const tabs: Array<{
    id: StatusScope
    label: string
    icon: typeof LayoutList
  }> = [
    { id: 'all', label: 'Tümü', icon: LayoutList },
    { id: 'active', label: 'Aktif', icon: PlayCircle },
    { id: 'passive', label: 'Pasif', icon: PauseCircle },
  ]

  return (
    <>
      {table ? (
        <div className='flex flex-wrap items-center gap-2'>
          {tabs.map((item) => {
            const Icon = item.icon
            const active = statusScope === item.id
            return (
              <Button
                key={item.id}
                type='button'
                variant={active ? 'default' : 'outline'}
                size='sm'
                className='h-8'
                onClick={() => setStatusScope(item.id)}
              >
                <Icon className='mr-2 size-4' />
                {item.label}
                <span className='ml-2 text-xs opacity-70'>{counts[item.id]}</span>
              </Button>
            )
          })}

          <Button
            type='button'
            variant={showSearch ? 'default' : 'outline'}
            size='sm'
            className='h-8'
            onClick={() => {
              setShowSearch((previous) => !previous)
              setShowFilters(false)
            }}
          >
            <Search className='mr-2 size-4' />
            Ara
          </Button>

          {showSearch ? (
            <div className='relative min-w-[280px] max-w-md flex-1'>
              <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
              <Input
                autoFocus
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder='Şehir, ilçe veya mahalle ara...'
                className='h-8 pl-8'
              />
            </div>
          ) : (
            <>
              <Button
                type='button'
                variant={showFilters ? 'default' : 'outline'}
                size='sm'
                className='h-8'
                onClick={() => setShowFilters((previous) => !previous)}
              >
                <Filter className='mr-2 size-4' />
                Filtreler
                {columnFilters.length > 0 ? (
                  <Badge variant='secondary' className='ml-2 rounded-sm px-1 font-normal'>
                    {columnFilters.length}
                  </Badge>
                ) : null}
              </Button>

              {showFilters ? (
                <>
                  <DataTableFacetedFilter
                    column={table.getColumn('il')}
                    title='Şehir'
                    options={cityOptions}
                  />
                  {columnFilters.length > 0 ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2'
                      onClick={() => {
                        setColumnFilters([])
                        table.resetColumnFilters()
                      }}
                    >
                      Sıfırla
                      <X className='ml-2 size-4' />
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <DataTableViewOptions
                    table={table}
                    label='Görünüm'
                    columnsLabel='Sütunlar'
                    className='h-8'
                  />
                  <DataTableExcelActions
                    table={table}
                    filename='global-operasyon-bolgeleri'
                    exportSelected={false}
                    exportLabel='Dışarı Aktar'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8'
                    onClick={onRefresh}
                  >
                    <RefreshCw className='mr-2 size-4' />
                    Yenile
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      ) : null}

      <DataTable
        data={visibleScopes}
        columns={columns}
        enableSorting
        enableGlobalFilter
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        enableColumnVisibility
        enableHorizontalScroll
        className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
        emptyMessage='Gösterilecek operasyon bölgesi bulunamadı.'
        onTableReady={setTable}
      />

      <OperationScopeRowModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingRow}
        existingKeys={existingKeys}
        onSave={handleSave}
      />
    </>
  )
}
