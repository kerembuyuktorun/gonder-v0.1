'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { returnsRepository } from '../../../_data/returns-repository'
import { RETURNS_QUERY_KEY } from '../../../_hooks/use-returns'
import { RETURN_STATUS_LABELS } from '../../../_types/returns'

export function ReturnDetailContent() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const { data, isLoading } = useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'detail', id],
    queryFn: () => returnsRepository.getById(id),
    enabled: Boolean(id),
  })

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'İadeler', href: ARF_ROUTES.gonder.returns.list },
          { label: data?.orderNumber ?? id },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <h1 className='text-xl font-semibold tracking-tight'>
              {isLoading ? 'Yükleniyor…' : (data?.orderNumber ?? 'İade bulunamadı')}
            </h1>
            {data ? (
              <p className='mt-1 text-sm text-muted-foreground'>{data.customerName}</p>
            ) : null}
          </div>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.returns.list}>Listeye dön</Link>
          </Button>
        </div>

        {data ? (
          <div className='grid gap-3 md:grid-cols-2'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Özet</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-muted-foreground'>Durum</span>
                  <Badge variant='outline'>{RETURN_STATUS_LABELS[data.status]}</Badge>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Taşıyıcı</span>
                  <span>{data.carrier}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Ref</span>
                  <span>{data.carrierRef ?? '—'}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Metot</span>
                  <span>{data.returnMethod}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Teslim noktası</span>
                  <span>{data.handoverPoint ?? '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Belgeler</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Etiket</span>
                  <span>{data.documents.labelReady ? 'Hazır' : 'Yok'}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>POD</span>
                  <span>{data.documents.hasProofOfDelivery ? 'Var' : 'Yok'}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Fotoğraf</span>
                  <span>{data.documents.hasPhotos ? 'Var' : 'Yok'}</span>
                </div>
                {data.note ? (
                  <p className='rounded-md border bg-muted/40 p-2 text-muted-foreground'>
                    {data.note}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : !isLoading ? (
          <Card>
            <CardContent className='py-8 text-center text-sm text-muted-foreground'>
              Bu iade kaydı bulunamadı.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  )
}
