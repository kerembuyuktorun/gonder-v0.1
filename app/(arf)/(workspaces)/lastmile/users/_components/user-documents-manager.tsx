'use client'

import type { ChangeEvent, RefObject } from 'react'
import { useRef, useState } from 'react'
import { Download, Eye, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

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
import { USER_DOCUMENT_TYPE_LABELS } from '../_lib/query-users'
import type { UserDocumentMeta, UserDocumentType } from '../_types/user'

const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_DOC_BYTES = 8 * 1024 * 1024

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Dosya okunamadı'))
    }
    reader.onerror = () => reject(new Error('Dosya okunamadı'))
    reader.readAsDataURL(file)
  })
}

function isPdfDocument(document: UserDocumentMeta) {
  return (
    document.mimeType === 'application/pdf' ||
    document.name.toLowerCase().endsWith('.pdf')
  )
}

function isImageDocument(document: UserDocumentMeta) {
  return document.mimeType.startsWith('image/')
}

function UserDocumentPreviewDialog({
  document,
  previewUrl,
  loading,
  error,
  open,
  onOpenChange,
}: {
  document: UserDocumentMeta | null
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
  documents: UserDocumentMeta[]
  onChange: (documents: UserDocumentMeta[]) => void
  uploadedBy?: string
}

export function useUserDocumentsActions({
  documents,
  onChange,
  uploadedBy = 'Operasyon Ekibi',
}: ActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docError, setDocError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    setDocError(null)
    setIsUploading(true)

    try {
      const nextDocs: UserDocumentMeta[] = []

      for (const file of files) {
        if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
          setDocError('Yalnızca PDF, JPEG veya PNG yükleyebilirsiniz.')
          return
        }
        if (file.size > MAX_DOC_BYTES) {
          setDocError('Dosya boyutu 8 MB’ı aşamaz.')
          return
        }

        const contentUrl = await readFileAsDataUrl(file)
        nextDocs.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          type: 'diger',
          uploadedAt: new Date().toISOString(),
          uploadedBy,
          contentUrl,
        })
      }

      onChange([...nextDocs, ...documents])
      toast.success(nextDocs.length > 1 ? 'Dosyalar yüklendi' : 'Dosya yüklendi')
    } catch {
      setDocError('Dosya yüklenemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = (documentId: string) => {
    onChange(documents.filter((document) => document.id !== documentId))
    toast.success('Dosya silindi')
  }

  const handleDownloadDocument = (document: UserDocumentMeta) => {
    if (!document.contentUrl) {
      toast.message('Demo kayıt: bu belgenin içeriği henüz bağlı değil')
      return
    }
    const link = window.document.createElement('a')
    link.href = document.contentUrl
    link.download = document.name
    link.rel = 'noopener'
    window.document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDocumentTypeChange = (documentId: string) => (value: string) => {
    onChange(
      documents.map((document) =>
        document.id === documentId
          ? { ...document, type: value as UserDocumentType }
          : document
      )
    )
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

export function UserDocumentUploadButton({
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
        multiple
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

export function UserDocumentsList({
  documents,
  actions,
  readOnly = false,
}: {
  documents: UserDocumentMeta[]
  actions: ReturnType<typeof useUserDocumentsActions>
  readOnly?: boolean
}) {
  const {
    docError,
    handleDocumentTypeChange,
    handleDeleteDocument,
    handleDownloadDocument,
  } = actions

  const [previewDocument, setPreviewDocument] = useState<UserDocumentMeta | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const closePreview = () => {
    setPreviewDocument(null)
    setPreviewUrl(null)
    setPreviewLoading(false)
    setPreviewError(null)
  }

  const handlePreviewDocument = (document: UserDocumentMeta) => {
    setPreviewDocument(document)
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewUrl(null)

    if (!document.contentUrl) {
      setPreviewError('Demo kayıt: önizleme için belge içeriği yok. Yeni yüklenen dosyalar önizlenebilir.')
      setPreviewLoading(false)
      return
    }

    setPreviewUrl(document.contentUrl)
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
                      ? 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center'
                      : 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto_auto] sm:items-center'
                  }
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-slate-900'>
                      {document.name}
                    </p>
                    <p className='mt-0.5 truncate text-xs text-slate-500'>
                      {formatFileSize(document.size)} ·{' '}
                      {formatDocUploadedAt(document.uploadedAt)} · {document.uploadedBy}
                    </p>
                  </div>
                  {readOnly ? (
                    <p className='text-sm text-slate-600'>
                      {USER_DOCUMENT_TYPE_LABELS[document.type] ?? document.type}
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
                        {Object.entries(USER_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 shrink-0'
                      aria-label='Belgeyi önizle'
                      onClick={() => handlePreviewDocument(document)}
                    >
                      <Eye className='size-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 shrink-0'
                      aria-label='Belgeyi indir'
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className='size-4' />
                    </Button>
                  </div>
                  {readOnly ? null : (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700'
                      aria-label='Dosyayı kaldır'
                      onClick={() => handleDeleteDocument(document.id)}
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

      <UserDocumentPreviewDialog
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
