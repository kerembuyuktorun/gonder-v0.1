'use client'

import type { ChangeEvent, ReactNode, RefObject } from 'react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Eye, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteOrphanDocument,
  deleteVehicleDocument,
  fetchVehicleDocumentDownloadUrl,
  fileToBase64,
  patchVehicleDocumentType,
  uploadVehicleDocument,
} from '../_api/vehicles'
import { VEHICLE_DOCUMENT_TYPE_LABELS } from '../_lib/query-vehicles'
import type { VehicleDocumentMeta, VehicleDocumentType } from '../_types/vehicle'

const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_DOC_BYTES = 8 * 1024 * 1024

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDocUploadedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isPdfDocument(document: VehicleDocumentMeta) {
  return (
    document.mimeType === 'application/pdf' ||
    document.name.toLowerCase().endsWith('.pdf')
  )
}

function isImageDocument(document: VehicleDocumentMeta) {
  return document.mimeType.startsWith('image/')
}

function VehicleDocumentPreviewDialog({
  document,
  previewUrl,
  loading,
  error,
  open,
  onOpenChange,
}: {
  document: VehicleDocumentMeta | null
  previewUrl: string | null
  loading: boolean
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const showPdf = document ? isPdfDocument(document) : false
  const showImage = document ? isImageDocument(document) : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-[min(96vw,56rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none'>
        <DialogHeader className='border-b border-slate-100 px-6 py-4'>
          <DialogTitle className='truncate pr-8 text-left'>
            {document?.name ?? 'Belge Önizleme'}
          </DialogTitle>
        </DialogHeader>

        <div className='min-h-[50vh] flex-1 overflow-auto bg-slate-50 p-4'>
          {loading ? (
            <div className='flex h-[50vh] items-center justify-center gap-2 text-sm text-slate-500'>
              <Loader2 className='size-5 animate-spin' />
              Belge yükleniyor…
            </div>
          ) : null}

          {!loading && error ? (
            <div className='flex h-[50vh] items-center justify-center px-6 text-center text-sm text-rose-600'>
              {error}
            </div>
          ) : null}

          {!loading && !error && previewUrl && showPdf ? (
            <iframe
              title={document?.name ?? 'Belge önizleme'}
              src={previewUrl}
              className='h-[70vh] w-full rounded-lg border border-slate-200 bg-white'
            />
          ) : null}

          {!loading && !error && previewUrl && showImage ? (
            <div className='flex min-h-[50vh] items-center justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={document?.name ?? 'Belge önizleme'}
                className='max-h-[70vh] max-w-full rounded-lg border border-slate-200 bg-white object-contain'
              />
            </div>
          ) : null}

          {!loading && !error && previewUrl && document && !showPdf && !showImage ? (
            <div className='flex h-[50vh] items-center justify-center px-6 text-center text-sm text-slate-500'>
              Bu dosya türü sayfa içinde önizlenemiyor. İndir butonunu kullanın.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type ActionsProps = {
  vehicleId?: string
  documents: VehicleDocumentMeta[]
  onChange: (documents: VehicleDocumentMeta[]) => void
  persistToServer?: boolean
  showDownload?: boolean
  onUploadingChange?: (uploading: boolean) => void
}

export function useVehicleDocumentsActions({
  vehicleId,
  documents,
  onChange,
  persistToServer = true,
  onUploadingChange,
}: ActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docError, setDocError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const setUploading = (uploading: boolean) => {
    setIsUploading(uploading)
    onUploadingChange?.(uploading)
  }

  const handleUploadDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
      setDocError('Yalnızca PDF, JPEG veya PNG yükleyebilirsiniz.')
      return
    }
    if (file.size > MAX_DOC_BYTES) {
      setDocError('Dosya boyutu 8 MB’ı aşamaz.')
      return
    }

    setDocError(null)
    setUploading(true)

    try {
      const contentBase64 = await fileToBase64(file)
      const result = await uploadVehicleDocument({
        fileName: file.name,
        contentType: file.type,
        contentBase64,
        type: 'diger',
        vehicleId: persistToServer ? vehicleId : undefined,
      })

      if (!result.success) {
        setDocError(result.error)
        return
      }

      onChange([result.data, ...documents])
      toast.success('Dosya yüklendi')
    } catch {
      setDocError('Dosya yüklenemedi. Lütfen tekrar deneyin.')
    } finally {
      setUploading(false)
    }
  }

  const handleDocumentTypeChange = (documentId: string) => async (value: string) => {
    const previousDocument = documents.find((document) => document.id === documentId)
    if (!previousDocument || previousDocument.type === value) return

    const nextDocuments = documents.map((document) =>
      document.id === documentId
        ? { ...document, type: value as VehicleDocumentType }
        : document
    )
    onChange(nextDocuments)

    if (!persistToServer || !vehicleId) return

    const result = await patchVehicleDocumentType(vehicleId, documentId, value)
    if (!result.success) {
      onChange(
        documents.map((document) =>
          document.id === documentId ? previousDocument : document
        )
      )
      toast.error(result.error)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (persistToServer && vehicleId) {
      const result = await deleteVehicleDocument(vehicleId, documentId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
    } else {
      const result = await deleteOrphanDocument(documentId)
      if (!result.success) {
        onChange(documents.filter((document) => document.id !== documentId))
        return
      }
    }

    onChange(documents.filter((document) => document.id !== documentId))
    toast.success('Dosya silindi')
  }

  const handleDownloadDocument = async (documentId: string) => {
    if (!vehicleId) return

    const result = await fetchVehicleDocumentDownloadUrl(vehicleId, documentId)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    const url = result.data.url
    if (!url) {
      toast.error('İndirme bağlantısı alınamadı.')
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return {
    fileInputRef,
    docError,
    isUploading,
    handleUploadDocument,
    handleDocumentTypeChange,
    handleDeleteDocument,
    handleDownloadDocument,
  }
}

export function VehicleDocumentUploadButton({
  fileInputRef,
  isUploading,
  onUpload,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>
  isUploading: boolean
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
        className='hidden'
        onChange={onUpload}
      />
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='h-9 shrink-0'
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className='mr-1.5 size-4' />
        {isUploading ? 'Yükleniyor…' : 'Dosya Ekle'}
      </Button>
    </>
  )
}

type ListProps = ActionsProps & {
  actions: ReturnType<typeof useVehicleDocumentsActions>
}

export function VehicleDocumentsList({
  vehicleId,
  documents,
  actions,
  showDownload = true,
  readOnly = false,
}: ListProps & { showDownload?: boolean; readOnly?: boolean }) {
  const {
    docError,
    handleDocumentTypeChange,
    handleDeleteDocument,
    handleDownloadDocument,
  } = actions

  const [previewDocument, setPreviewDocument] = useState<VehicleDocumentMeta | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const closePreview = () => {
    setPreviewDocument(null)
    setPreviewUrl(null)
    setPreviewLoading(false)
    setPreviewError(null)
  }

  const handlePreviewDocument = async (document: VehicleDocumentMeta) => {
    if (!vehicleId) {
      toast.error('Belge önizlemesi için araç kimliği gerekli.')
      return
    }

    setPreviewDocument(document)
    setPreviewUrl(null)
    setPreviewError(null)
    setPreviewLoading(true)

    const result = await fetchVehicleDocumentDownloadUrl(vehicleId, document.id)
    if (!result.success) {
      setPreviewError(result.error)
      setPreviewLoading(false)
      return
    }

    if (!result.data.url) {
      setPreviewError('Önizleme bağlantısı alınamadı.')
      setPreviewLoading(false)
      return
    }

    setPreviewUrl(result.data.url)
    setPreviewLoading(false)
  }

  return (
    <>
      <div className='space-y-2.5'>
      {docError ? (
        <p className='text-sm text-rose-600' role='alert'>
          {docError}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500'>
          Henüz dosya yok.
        </div>
      ) : (
        <div className='space-y-2.5'>
          {documents.map((document) => (
            <div key={document.id} className='rounded-xl border border-slate-200 p-3'>
              <div
                className={
                  readOnly
                    ? showDownload
                      ? 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center'
                      : 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center'
                    : showDownload
                      ? 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto_auto] sm:items-center'
                      : 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center'
                }
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-slate-900'>{document.name}</p>
                  <p className='mt-0.5 truncate text-xs text-slate-500'>
                    {formatFileSize(document.size)} · {formatDocUploadedAt(document.uploadedAt)} ·{' '}
                    {document.uploadedBy}
                  </p>
                </div>
                {readOnly ? (
                  <p className='text-sm text-slate-600'>
                    {VEHICLE_DOCUMENT_TYPE_LABELS[document.type] ?? document.type}
                  </p>
                ) : (
                  <Select
                    value={document.type}
                    onValueChange={handleDocumentTypeChange(document.id)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {showDownload ? (
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 shrink-0'
                      aria-label='Belgeyi önizle'
                      onClick={() => void handlePreviewDocument(document)}
                    >
                      <Eye className='size-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 shrink-0'
                      aria-label='Belgeyi indir'
                      onClick={() => void handleDownloadDocument(document.id)}
                    >
                      <Download className='size-4' />
                    </Button>
                  </div>
                ) : null}
                {readOnly ? null : (
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='size-9 shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700'
                    onClick={() => void handleDeleteDocument(document.id)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      <VehicleDocumentPreviewDialog
        document={previewDocument}
        previewUrl={previewUrl}
        loading={previewLoading}
        error={previewError}
        open={previewDocument != null}
        onOpenChange={(open) => {
          if (!open) closePreview()
        }}
      />
    </>
  )
}

type UploadSectionProps = ActionsProps & {
  title: string
  headerMeta?: ReactNode
  showDownload?: boolean
}

export function VehicleLegalDocumentsUploadSection({
  title,
  headerMeta,
  showDownload = true,
  ...actionsProps
}: UploadSectionProps) {
  const actions = useVehicleDocumentsActions(actionsProps)

  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3'>
        <p className='text-sm font-semibold text-slate-900'>{title}</p>
        {headerMeta ?? (
          <VehicleDocumentUploadButton
            fileInputRef={actions.fileInputRef}
            isUploading={actions.isUploading}
            onUpload={actions.handleUploadDocument}
          />
        )}
      </div>
      <div className='px-4 py-4'>
        <VehicleDocumentsList
          {...actionsProps}
          actions={actions}
          showDownload={showDownload}
        />
      </div>
    </section>
  )
}

export function VehicleDocumentsManager(props: ActionsProps & { title?: string }) {
  return (
    <VehicleLegalDocumentsUploadSection
      title={props.title ?? 'Yüklenen Yasal Belgeler'}
      {...props}
    />
  )
}
