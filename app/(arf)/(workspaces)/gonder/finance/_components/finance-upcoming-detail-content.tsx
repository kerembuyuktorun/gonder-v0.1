'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useUpcomingPayment } from '../../_hooks/use-finance'
import { formatFinanceDateTime, formatMoney } from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { FinancePageShell } from './finance-page-shell'
import { FinancePayDialog } from './finance-pay-dialog'
import { InvoiceKindBadge, PaymentStatusBadge, SettlementBadge } from './finance-status-badge'

type Props = {
  paymentId: string
}

export function FinanceUpcomingDetailContent({ paymentId }: Props) {
  const { data, isLoading } = useUpcomingPayment(paymentId)
  const [payOpen, setPayOpen] = useState(false)
  const canPay = data ? ['unpaid', 'partial', 'pending'].includes(data.status) : false

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Yaklaşan ödemeler', href: ARF_ROUTES.gonder.finance.upcoming.list },
        { label: data?.invoiceNumber ?? 'Detay' },
      ]}
      title={data?.invoiceNumber ?? 'Yaklaşan ödeme'}
      description={data?.description}
      actions={
        <div className='flex gap-2'>
          {canPay ? (
            <Button type='button' size='sm' onClick={() => setPayOpen(true)}>
              Öde
            </Button>
          ) : null}
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.finance.upcoming.list}>Listeye dön</Link>
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Ödeme yükleniyor…</CardContent>
        </Card>
      ) : !data ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Kayıt bulunamadı.</CardContent>
        </Card>
      ) : (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-4 p-4'>
            <p className='text-sm leading-relaxed'>{data.narrative}</p>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Tutar</dt>
                <dd className='mt-0.5 text-sm font-medium tabular-nums'>{formatMoney(data.amount)}</dd>
              </div>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Ödenen</dt>
                <dd className='mt-0.5 text-sm font-medium tabular-nums'>
                  {formatMoney(data.paidAmount)}
                </dd>
              </div>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Vade</dt>
                <dd className='mt-0.5 text-sm font-medium'>{formatFinanceDateTime(data.dueAt)}</dd>
              </div>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Durum</dt>
                <dd className='mt-0.5'>
                  <PaymentStatusBadge status={data.status} />
                </dd>
              </div>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Kanal</dt>
                <dd className='mt-0.5'>
                  <SettlementBadge settlement={data.settlement} />
                </dd>
              </div>
              <div>
                <dt className='text-[11px] text-muted-foreground'>Fatura türü</dt>
                <dd className='mt-0.5'>
                  <InvoiceKindBadge kind={data.invoiceKind} />
                </dd>
              </div>
            </dl>
            <div>
              <p className='mb-1.5 text-xs text-muted-foreground'>İlişkili kayıtlar</p>
              <FinanceEntityLinks
                order={data.order}
                shipment={data.shipment}
                invoice={data.invoice}
              />
            </div>
          </CardContent>
        </Card>
      )}
      <FinancePayDialog payment={data ?? null} open={payOpen} onOpenChange={setPayOpen} />
    </FinancePageShell>
  )
}
