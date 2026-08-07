'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  Table as TanStackTable,
  Updater,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  createSelectionColumn,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import {
  Check,
  Loader2,
  Pencil,
  SkipForward,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { BulkActionBar, RowQuickActions } from '../../_components/data-workspace'
import {
  useApproveBulkImportRows,
  useBulkImportJob,
  useBulkImportRows,
  useCancelBulkImportJob,
  useSkipBulkImportRows,
  useUpdateBulkImportMapping,
  useUpdateBulkImportRow,
  useValidateBulkImportJob,
} from '../../_hooks/use-bulk-import'
import {
  BULK_IMPORT_FIELDS,
  BULK_IMPORT_STATUS_BADGE,
  BULK_IMPORT_STATUS_LABELS,
  STAGING_ROW_STATUS_BADGE,
  STAGING_ROW_STATUS_LABELS,
  type BulkImportFieldKey,
  type BulkImportStagingRow,
  type ColumnMapping,
  type StagingRowPayload,
} from '../../_types/bulk-import'
import { BulkCreateStepper, jobStatusToStep } from './bulk-create-stepper'

const R = ARF_ROUTES.gonder
const UNMAPPED = '__none__'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

type Props = {
  jobId: string
}

export function BulkCreateJobDetailContent({ jobId }: Props) {
  const router = useRouter()
  const { data: job, isLoading } = useBulkImportJob(jobId)
  const { data: rowsData, refetch: refetchRows } = useBulkImportRows(jobId)
  const updateMapping = useUpdateBulkImportMapping(jobId)
  const validateJob = useValidateBulkImportJob(jobId)
  const updateRow = useUpdateBulkImportRow(jobId)
  const skipRows = useSkipBulkImportRows(jobId)
  const approveRows = useApproveBulkImportRows(jobId)
  const cancelJob = useCancelBulkImportJob(jobId)

  const [mappingDraft, setMappingDraft] = useState<ColumnMapping>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [table, setTable] = useState<TanStackTable<BulkImportStagingRow> | null>(null)
  const [editingRow, setEditingRow] = useState<BulkImportStagingRow | null>(null)
  const [editPayload, setEditPayload] = useState<StagingRowPayload | null>(null)

  useEffect(() => {
    if (job) setMappingDraft(job.columnMapping)
  }, [job])

  useEffect(() => {
    if (job?.status === 'mapping' || job?.status === 'ready' || job?.status === 'completed') {
      void refetchRows()
    }
  }, [job?.status, job?.updatedAt, refetchRows])

  const rows = rowsData?.items ?? []
  const pageCount = Math.max(1, Math.ceil(rows.length / pagination.pageSize) || 1)
  const pageItems = rows.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const step = job ? jobStatusToStep(job.status) : 1
  const canMap = job && !['completed', 'cancelled', 'approving'].includes(job.status)
  const canValidate =
    job &&
    (job.status === 'mapping' || job.status === 'ready') &&
    rows.length > 0
  const canApprove =
    job &&
    (job.status === 'ready' || job.status === 'completed') &&
    rows.some((row) => row.status === 'valid' || row.status === 'warning')

  const columns = useMemo<ColumnDef<BulkImportStagingRow>[]>(
    () => [
      createSelectionColumn<BulkImportStagingRow>(),
      {
        accessorKey: 'rowNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Satır' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-muted-foreground'>{row.original.rowNumber}</span>
        ),
      },
      {
        id: 'route',
        header: 'Rota',
        cell: ({ row }) => (
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium'>
              {row.original.payload.receiverName || '—'}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {row.original.payload.senderCity || '—'} →{' '}
              {row.original.payload.receiverCity || '—'}
            </p>
          </div>
        ),
      },
      {
        id: 'dims',
        header: 'Desi / kg',
        cell: ({ row }) => (
          <span className='text-sm tabular-nums text-muted-foreground'>
            {row.original.payload.desi ?? '—'} / {row.original.payload.weightKg ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => (
          <div className='space-y-1'>
            <Badge
              variant='outline'
              className={STAGING_ROW_STATUS_BADGE[row.original.status]}
            >
              {STAGING_ROW_STATUS_LABELS[row.original.status]}
            </Badge>
            {row.original.issues[0] ? (
              <p className='max-w-[180px] truncate text-[11px] text-rose-600'>
                {row.original.issues[0].message}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original
          const locked = item.status === 'created' || item.status === 'skipped'
          return (
            <RowQuickActions
              actions={[
                {
                  id: 'edit',
                  label: 'Düzenle',
                  icon: Pencil,
                  disabled: locked,
                  onClick: () => {
                    setEditingRow(item)
                    setEditPayload({ ...item.payload })
                  },
                },
              ]}
            />
          )
        },
      },
    ],
    []
  )

  const handleSaveMapping = async () => {
    try {
      await updateMapping.mutateAsync(mappingDraft)
      toast.success('Sütun eşlemesi güncellendi')
      void refetchRows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eşleme kaydedilemedi')
    }
  }

  const handleValidate = async () => {
    try {
      await validateJob.mutateAsync()
      toast.success('Satırlar doğrulandı')
      void refetchRows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Doğrulama başarısız')
    }
  }

  const handleApprove = async (onlySelected: boolean) => {
    try {
      const result = await approveRows.mutateAsync(
        onlySelected && selectedIds.length ? selectedIds : undefined
      )
      toast.success(
        `${result.createdCount} gönderi oluşturuldu` +
          (result.failedCount ? `, ${result.failedCount} başarısız` : '')
      )
      setRowSelection({})
      void refetchRows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Onay başarısız')
    }
  }

  const handleSkip = async () => {
    if (!selectedIds.length) return
    try {
      await skipRows.mutateAsync(selectedIds)
      toast.message(`${selectedIds.length} satır atlandı`)
      setRowSelection({})
      void refetchRows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Atlama başarısız')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingRow || !editPayload) return
    try {
      await updateRow.mutateAsync({ rowId: editingRow.id, payload: editPayload })
      toast.success('Satır güncellendi')
      setEditingRow(null)
      setEditPayload(null)
      void refetchRows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
    }
  }

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center gap-2 p-6 text-sm text-muted-foreground'>
        <Loader2 className='size-4 animate-spin' />
        Import yükleniyor…
      </div>
    )
  }

  if (!job) {
    return (
      <div className='flex flex-1 flex-col items-start gap-3 p-6'>
        <p className='text-sm text-muted-foreground'>Import bulunamadı.</p>
        <Button asChild size='sm'>
          <Link href={R.bulkCreate.imports}>Listeye dön</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: R.root },
          { label: 'Excel içe aktarım', href: R.bulkCreate.root },
          { label: 'Importlar', href: R.bulkCreate.imports },
          { label: job.reference },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight'>{job.reference}</h1>
              <Badge variant='outline' className={BULK_IMPORT_STATUS_BADGE[job.status]}>
                {BULK_IMPORT_STATUS_LABELS[job.status]}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>
              {job.fileName} · {job.counts.total} satır ·{' '}
              {job.parseMode === 'backend_job' ? 'Backend parse job' : 'Client staging seed'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {job.status !== 'completed' && job.status !== 'cancelled' ? (
              <Button
                variant='outline'
                size='sm'
                disabled={cancelJob.isPending}
                onClick={() =>
                  void cancelJob.mutateAsync().then(() => {
                    toast.message('Import iptal edildi')
                    router.push(R.bulkCreate.imports)
                  })
                }
              >
                İptal
              </Button>
            ) : null}
            <Button variant='outline' size='sm' asChild>
              <Link href={R.bulkCreate.imports}>Liste</Link>
            </Button>
          </div>
        </div>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-3 p-4'>
            <BulkCreateStepper currentStep={step} />
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {[
                { label: 'Geçerli', value: job.counts.valid + job.counts.warning },
                { label: 'Hatalı', value: job.counts.invalid },
                { label: 'Oluşturulan', value: job.counts.created },
                { label: 'Bekleyen', value: job.counts.pending },
              ].map((item) => (
                <div key={item.label} className='rounded-lg border bg-muted/20 px-3 py-2'>
                  <p className='text-[11px] text-muted-foreground'>{item.label}</p>
                  <p className='text-lg font-semibold tabular-nums'>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {job.status === 'parsing' || job.status === 'uploading' ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='flex items-center gap-2 p-6 text-sm text-muted-foreground'>
              <Loader2 className='size-4 animate-spin' />
              Dosya arka planda ayrıştırılıyor… Bu ekran otomatik güncellenir.
            </CardContent>
          </Card>
        ) : null}

        {canMap && job.status !== 'parsing' ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <div>
                <CardTitle className='text-base'>Sütun eşleştirme</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Excel başlıklarını gönderi alanlarına bağlayın.
                </p>
              </div>
              <Button
                size='sm'
                onClick={() => void handleSaveMapping()}
                disabled={updateMapping.isPending}
              >
                {updateMapping.isPending ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  'Eşlemeyi kaydet'
                )}
              </Button>
            </CardHeader>
            <CardContent className='grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3'>
              {BULK_IMPORT_FIELDS.map((field) => (
                <div key={field.key} className='space-y-1.5'>
                  <Label className='text-xs'>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Label>
                  <Select
                    value={mappingDraft[field.key] ?? UNMAPPED}
                    onValueChange={(value) =>
                      setMappingDraft((prev) => {
                        const next = { ...prev }
                        if (value === UNMAPPED) delete next[field.key]
                        else next[field.key] = value
                        return next
                      })
                    }
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue placeholder='Seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNMAPPED}>— Eşlenmedi —</SelectItem>
                      {job.detectedHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {job.status !== 'parsing' && job.status !== 'uploading' ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-wrap items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <div>
                <CardTitle className='text-base'>Staging satırları</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Sadece geçerli / uyarı satırları toplu onaylanabilir.
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {canValidate ? (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => void handleValidate()}
                    disabled={validateJob.isPending}
                  >
                    {validateJob.isPending ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      'Doğrula'
                    )}
                  </Button>
                ) : null}
                {canApprove ? (
                  <Button
                    size='sm'
                    onClick={() => void handleApprove(false)}
                    disabled={approveRows.isPending}
                  >
                    {approveRows.isPending ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <>
                        <Check className='size-4' />
                        Geçerli satırları onayla
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className='space-y-3 px-4 pb-4'>
              <BulkActionBar
                selectedCount={selectedIds.length}
                onClear={() => setRowSelection({})}
              >
                <Button
                  size='sm'
                  variant='outline'
                  disabled={!selectedIds.length || skipRows.isPending}
                  onClick={() => void handleSkip()}
                >
                  <SkipForward className='size-3.5' />
                  Atla
                </Button>
                <Button
                  size='sm'
                  disabled={!selectedIds.length || approveRows.isPending || !canApprove}
                  onClick={() => void handleApprove(true)}
                >
                  Seçilenleri onayla
                </Button>
              </BulkActionBar>

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
                enableRowSelection
                enableMultiRowSelection
                getRowId={(row) => row.id}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                stickyLastColumn
                isLoading={false}
                emptyMessage='Staging satırı yok.'
                onTableReady={setTable}
              />
              {table ? (
                <DataTablePagination
                  table={table as TanStackTable<unknown>}
                  pageSizeOptions={[5, 10, 20, 50]}
                  totalRows={rows.length}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Dialog
        open={Boolean(editingRow)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRow(null)
            setEditPayload(null)
          }
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Satır {editingRow?.rowNumber} düzenle</DialogTitle>
          </DialogHeader>
          {editPayload ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              {(
                [
                  ['reference', 'Referans'],
                  ['senderName', 'Gönderici'],
                  ['senderCity', 'Gönderici şehir'],
                  ['senderAddress', 'Gönderici adres'],
                  ['receiverName', 'Alıcı'],
                  ['receiverCity', 'Alıcı şehir'],
                  ['receiverAddress', 'Alıcı adres'],
                  ['receiverPhone', 'Alıcı telefon'],
                  ['serviceType', 'Hizmet'],
                  ['carrier', 'Taşıyıcı'],
                ] as Array<[BulkImportFieldKey, string]>
              ).map(([key, label]) => (
                <div key={key} className='space-y-1.5'>
                  <Label className='text-xs'>{label}</Label>
                  <Input
                    value={String(editPayload[key] ?? '')}
                    onChange={(event) =>
                      setEditPayload((prev) =>
                        prev ? { ...prev, [key]: event.target.value } : prev
                      )
                    }
                  />
                </div>
              ))}
              <div className='space-y-1.5'>
                <Label className='text-xs'>Desi</Label>
                <Input
                  type='number'
                  value={editPayload.desi ?? ''}
                  onChange={(event) =>
                    setEditPayload((prev) =>
                      prev
                        ? {
                            ...prev,
                            desi: event.target.value ? Number(event.target.value) : null,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Ağırlık (kg)</Label>
                <Input
                  type='number'
                  value={editPayload.weightKg ?? ''}
                  onChange={(event) =>
                    setEditPayload((prev) =>
                      prev
                        ? {
                            ...prev,
                            weightKg: event.target.value ? Number(event.target.value) : null,
                          }
                        : prev
                    )
                  }
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setEditingRow(null)
                setEditPayload(null)
              }}
            >
              Vazgeç
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={updateRow.isPending}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
