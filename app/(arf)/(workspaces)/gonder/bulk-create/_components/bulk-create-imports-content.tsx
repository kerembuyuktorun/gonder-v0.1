'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type {
  ColumnDef,
  PaginationState,
  Table as TanStackTable,
  Updater,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Eye, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DataWorkspace, RowQuickActions } from '../../_components/data-workspace'
import { useBulkImportJobs } from '../../_hooks/use-bulk-import'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  BULK_IMPORT_STATUS_BADGE,
  BULK_IMPORT_STATUS_LABELS,
  type BulkImportJob,
  type BulkImportJobStatus,
  type BulkImportView,
} from '../../_types/bulk-import'

const VIEWS = ['all', 'active', 'ready', 'completed', 'failed'] as const

const VIEW_LABELS: Record<BulkImportView, string> = {
  all: 'Tümü',
  active: 'Aktif',
  ready: 'Onaya hazır',
  completed: 'Tamamlanan',
  failed: 'Hatalı / iptal',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BulkCreateImportsContent() {
  const router = useRouter()
  const url = useWorkspaceListUrlState({
    defaultView: 'all',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<BulkImportJob> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const listQuery = useMemo(
    () => ({
      view: url.view as BulkImportView,
      status: (url.status as BulkImportJobStatus | null) ?? null,
      search: url.search,
    }),
    [url.search, url.status, url.view]
  )

  const { data, isLoading } = useBulkImportJobs(listQuery)
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<BulkImportJob>[]>(
    () => [
      {
        accessorKey: 'reference',
        header: ({ column }) => <DataTableColumnHeader column={column} title='İş No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.bulkCreate.importDetail(row.original.id)}
            className='font-medium hover:underline'
          >
            {row.original.reference}
          </Link>
        ),
      },
      {
        accessorKey: 'fileName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Dosya' />,
        cell: ({ row }) => (
          <div className='min-w-0'>
            <p className='truncate font-medium'>{row.original.fileName}</p>
            <p className='text-xs text-muted-foreground'>
              {formatBytes(row.original.fileSizeBytes)} ·{' '}
              {row.original.parseMode === 'backend_job' ? 'Backend job' : 'Staging'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={BULK_IMPORT_STATUS_BADGE[row.original.status]}>
            {BULK_IMPORT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'counts',
        header: 'Satırlar',
        cell: ({ row }) => {
          const c = row.original.counts
          return (
            <span className='text-sm tabular-nums text-muted-foreground'>
              {c.created}/{c.total} oluştu · {c.invalid} hatalı
            </span>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturma' />,
        cell: ({ row }) => (
          <span className='text-sm text-muted-foreground'>{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        size: 184,
        minSize: 176,
        maxSize: 220,
        cell: ({ row }) => (
          <RowQuickActions
            actions={[
              {
                id: 'open',
                labelKey: 'excel.inspect',
                icon: Eye,
                priority: 'primary',
                variant: 'secondary',
                onClick: () =>
                  router.push(ARF_ROUTES.gonder.bulkCreate.importDetail(row.original.id)),
              },
            ]}
          />
        ),
      },
    ],
    [router]
  )

  return (
    <DataWorkspace
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.root },
        { label: 'Excel içe aktarım', href: ARF_ROUTES.gonder.bulkCreate.root },
        { label: 'Importlar' },
      ]}
      title='Import geçmişi'
      description='Excel yüklemeleri staging job olarak listelenir; doğrudan gönderi oluşturulmaz.'
      headerActions={
        <Button asChild size='sm'>
          <Link href={ARF_ROUTES.gonder.bulkCreate.root} className='gap-1.5'>
            <Plus className='size-4' />
            Yeni import
          </Link>
        </Button>
      }
      tabs={VIEWS.map((view) => ({
        id: view,
        label: VIEW_LABELS[view],
        count: data?.viewCounts[view],
      }))}
      view={url.view as BulkImportView}
      onViewChange={(view) => {
        url.setView(view)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      }}
      search={searchInput}
      onSearchChange={(value) => {
        setSearchInput(value)
        url.setSearch(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      }}
      searchPlaceholder='İş no veya dosya adı…'
      toolbarTrailing={table ? <DataTableViewOptions table={table} /> : null}
    >
      {isLoading ? (
        <p className='px-1 py-6 text-sm text-muted-foreground'>Importlar yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className='flex flex-col items-start gap-3 px-1 py-8'>
          <p className='text-sm text-muted-foreground'>Henüz import yok.</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.gonder.bulkCreate.root}>İlk dosyayı yükle</Link>
          </Button>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={pageItems}
            enablePagination
            pagination={pagination}
            onPaginationChange={(updater) =>
              setPagination((prev) => resolveUpdater(updater, prev))
            }
            pageCount={pageCount}
            manualPagination
            getRowId={(row) => row.id}
            stickyLastColumn
            isLoading={isLoading}
            emptyMessage='Henüz import yok.'
            onTableReady={setTable}
          />
          {table ? (
            <DataTablePagination
              table={table as TanStackTable<unknown>}
              pageSizeOptions={[5, 10, 20, 50]}
              totalRows={items.length}
            />
          ) : null}
        </>
      )}
    </DataWorkspace>
  )
}
