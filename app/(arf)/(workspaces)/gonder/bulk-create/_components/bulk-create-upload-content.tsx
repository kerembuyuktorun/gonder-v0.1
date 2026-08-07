'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { FileUploader } from '@hascanb/arf-ui-kit/file-kit'
import { AlertCircle, Download, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  BULK_IMPORT_CLIENT_MAX_ROWS,
  BULK_IMPORT_CLIENT_MAX_SIZE_MB,
  downloadBulkImportTemplate,
  peekOrParseWorkbook,
} from '../../_lib/bulk-import'
import { BULK_IMPORT_FIELDS } from '../../_types/bulk-import'
import { useCreateBulkImportJob } from '../../_hooks/use-bulk-import'
import { BulkCreateStepper } from './bulk-create-stepper'

const R = ARF_ROUTES.gonder

export function BulkCreateUploadContent() {
  const router = useRouter()
  const createJob = useCreateBulkImportJob()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!files[0]) {
      setError('Önce bir Excel dosyası seçin.')
      return
    }

    setError('')
    try {
      const preview = await peekOrParseWorkbook(files[0])
      if (!preview.headers.length && preview.parseMode === 'client_seed') {
        setError('Dosyada sütun başlığı bulunamadı. Şablonu kontrol edin.')
        return
      }

      const job = await createJob.mutateAsync({
        fileName: files[0].name,
        fileSizeBytes: files[0].size,
        detectedHeaders: preview.headers,
        rawRows: preview.rows,
        parseMode: preview.parseMode,
      })

      toast.success(
        preview.parseMode === 'backend_job'
          ? 'Dosya alındı. Ayrıştırma arka planda devam ediyor.'
          : 'Dosya staging alanına alındı.'
      )
      router.push(R.bulkCreate.importDetail(job.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yükleme başarısız'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: R.root },
          { label: 'Excel ile toplu oluştur' },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight'>Excel ile toplu oluştur</h1>
            <p className='text-sm text-muted-foreground'>
              Dosya önce staging’e düşer; doğrulama ve onay sonrası gönderi oluşur.
            </p>
          </div>
          <Button variant='outline' size='sm' asChild>
            <Link href={R.bulkCreate.imports} className='gap-1.5'>
              <History className='size-4' />
              Import geçmişi
            </Link>
          </Button>
        </div>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-4 p-4'>
            <BulkCreateStepper currentStep={1} />
          </CardContent>
        </Card>

        <div className='grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]'>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-1 px-4 pt-4 pb-2'>
              <CardTitle className='text-base'>Dosya yükle</CardTitle>
              <p className='text-sm text-muted-foreground'>
                .xlsx / .xls / .csv. {BULK_IMPORT_CLIENT_MAX_SIZE_MB} MB veya{' '}
                {BULK_IMPORT_CLIENT_MAX_ROWS} satır üstü dosyalar backend parse job’una alınır.
              </p>
            </CardHeader>
            <CardContent className='space-y-4 px-4 pb-4'>
              <FileUploader
                value={files}
                onChange={setFiles}
                accept='.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
                multiple={false}
                maxFiles={1}
                maxSizeMb={10}
                showPreview
              />

              {error ? (
                <div className='flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={createJob.isPending || files.length === 0}
                >
                  {createJob.isPending ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      Yükleniyor…
                    </>
                  ) : (
                    'İçe aktarımı başlat'
                  )}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setFiles([])
                    setError('')
                  }}
                  disabled={createJob.isPending}
                >
                  Temizle
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-1 px-4 pt-4 pb-2'>
              <CardTitle className='text-base'>Şablon</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Zorunlu sütunlar işaretli alanlardan gelir; eşleme adımında düzeltilebilir.
              </p>
            </CardHeader>
            <CardContent className='space-y-3 px-4 pb-4'>
              <Button
                type='button'
                variant='outline'
                className='w-full justify-start gap-2'
                onClick={() => downloadBulkImportTemplate()}
              >
                <Download className='size-4' />
                Şablonu indir
              </Button>
              <ul className='space-y-1.5 text-xs text-muted-foreground'>
                {BULK_IMPORT_FIELDS.filter((field) => field.required).map((field) => (
                  <li key={field.key} className='flex gap-2'>
                    <span className='font-medium text-foreground'>{field.label}</span>
                    <span>— zorunlu</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
