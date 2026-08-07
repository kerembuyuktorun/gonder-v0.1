'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { desiAdjustmentsRepository } from '../../../_data/desi-adjustments-repository'
import { DESI_QUERY_KEY } from '../../../_hooks/use-desi-adjustments'
import { DESI_STATUS_LABELS } from '../../../_types/desi-adjustments'

function formatMoney(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DesiAdjustmentDetailContent() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const { data, isLoading } = useQuery({
    queryKey: [...DESI_QUERY_KEY, 'detail', id],
    queryFn: () => desiAdjustmentsRepository.getById(id),
    enabled: Boolean(id),
  })

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Desi Kontrol', href: ARF_ROUTES.gonder.desiControl.list },
          { label: data?.shipmentRef ?? id },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <h1 className='text-xl font-semibold tracking-tight'>
              {isLoading ? 'Yükleniyor…' : (data?.shipmentRef ?? 'Kayıt bulunamadı')}
            </h1>
            {data?.orderNumber ? (
              <p className='mt-1 text-sm text-muted-foreground'>{data.orderNumber}</p>
            ) : null}
          </div>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.desiControl.list}>Listeye dön</Link>
          </Button>
        </div>

        {data ? (
          <div className='grid gap-3 md:grid-cols-2'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Ölçüm karşılaştırması</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Beyan</span>
                  <span className='tabular-nums'>
                    {data.declaredDesi} desi · {data.declaredWeightKg} kg
                  </span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Ölçülen</span>
                  <span className='tabular-nums'>
                    {data.measuredDesi} desi · {data.measuredWeightKg} kg
                  </span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Fark</span>
                  <span className='tabular-nums font-medium text-amber-700'>
                    +{data.deltaDesi} desi · +{data.deltaWeightKg} kg
                  </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Beyan değerleri otomatik üzerine yazılmaz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Durum / ücret</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-muted-foreground'>Durum</span>
                  <Badge variant='outline'>{DESI_STATUS_LABELS[data.status]}</Badge>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Taşıyıcı</span>
                  <span>{data.carrier}</span>
                </div>
                <div className='flex justify-between gap-2'>
                  <span className='text-muted-foreground'>Ücret farkı</span>
                  <span>{formatMoney(data.chargeTry)}</span>
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
              Bu desi kaydı bulunamadı.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  )
}
