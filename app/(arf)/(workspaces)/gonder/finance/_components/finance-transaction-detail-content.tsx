'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useFinanceTransaction } from '../../_hooks/use-finance'
import {
  FINANCE_INVOICE_KIND_LABELS,
  PAYMENT_METHOD_LABELS,
  formatFinanceDateTime,
  formatMoney,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { FinancePageShell } from './finance-page-shell'
import { PaymentStatusBadge, SettlementBadge } from './finance-status-badge'

type Props = {
  transactionId: string
}

export function FinanceTransactionDetailContent({ transactionId }: Props) {
  const { data, isLoading } = useFinanceTransaction(transactionId)

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Hareketler', href: ARF_ROUTES.gonder.finance.transactions.list },
        { label: data?.id ?? 'Detay' },
      ]}
      title='Hareket detayı'
      description={data?.description}
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.finance.transactions.list}>Listeye dön</Link>
        </Button>
      }
    >
      {isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Hareket yükleniyor…</CardContent>
        </Card>
      ) : !data ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Hareket bulunamadı.</CardContent>
        </Card>
      ) : (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-4 p-4'>
            <p className='text-sm leading-relaxed'>{data.narrative}</p>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <Meta label='Tutar' value={formatMoney(data.amount)} />
              <Meta label='Yön' value={data.direction === 'debit' ? 'Borç' : 'Alacak'} />
              <Meta label='Durum' value={<PaymentStatusBadge status={data.status} />} />
              <Meta
                label='Kanal'
                value={<SettlementBadge settlement={data.settlement} />}
              />
              <Meta
                label='Yöntem'
                value={data.method ? PAYMENT_METHOD_LABELS[data.method] : '—'}
              />
              <Meta label='Tarih' value={formatFinanceDateTime(data.occurredAt)} />
              <Meta
                label='Fatura türü'
                value={data.invoiceKind ? FINANCE_INVOICE_KIND_LABELS[data.invoiceKind] : '—'}
              />
              <Meta
                label='Kalan'
                value={data.remainingBalance ? formatMoney(data.remainingBalance) : '—'}
              />
            </dl>
            <div>
              <p className='mb-1.5 text-xs text-muted-foreground'>İlişkili kayıtlar</p>
              <FinanceEntityLinks
                order={data.order}
                shipment={data.shipment}
                invoice={data.invoice}
                quote={data.quote}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </FinancePageShell>
  )
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className='text-[11px] text-muted-foreground'>{label}</dt>
      <dd className='mt-0.5 text-sm font-medium'>{value}</dd>
    </div>
  )
}
