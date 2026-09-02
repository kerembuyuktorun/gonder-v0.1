'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useFinanceInvoice, useFinanceTransactions } from '../../_hooks/use-finance'
import {
  formatFinanceDate,
  formatFinanceDateTime,
  formatMoney,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { FinancePageShell } from './finance-page-shell'
import { InvoiceKindBadge, InvoiceStatusBadge, SettlementBadge } from './finance-status-badge'

type Props = {
  invoiceId: string
}

export function FinanceInvoiceDetailContent({ invoiceId }: Props) {
  const { data, isLoading } = useFinanceInvoice(invoiceId)
  const txQuery = useFinanceTransactions({ invoiceId })
  const movements = txQuery.data?.items ?? []

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Faturalar', href: ARF_ROUTES.gonder.finance.invoices.list },
        { label: data?.number ?? 'Detay' },
      ]}
      title={data?.number ?? 'Fatura'}
      description='Fatura ve bağlı hareketler.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.finance.invoices.list}>Listeye dön</Link>
        </Button>
      }
    >
      {isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Fatura yükleniyor…</CardContent>
        </Card>
      ) : !data ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Fatura bulunamadı.</CardContent>
        </Card>
      ) : (
        <>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-4 p-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <InvoiceKindBadge kind={data.kind} />
                <InvoiceStatusBadge status={data.status} />
                <SettlementBadge settlement={data.settlement} />
              </div>
              <dl className='grid gap-3 sm:grid-cols-2'>
                <div>
                  <dt className='text-[11px] text-muted-foreground'>Tutar</dt>
                  <dd className='mt-0.5 text-sm font-medium tabular-nums'>{formatMoney(data.amount)}</dd>
                </div>
                <div>
                  <dt className='text-[11px] text-muted-foreground'>Kesim</dt>
                  <dd className='mt-0.5 text-sm font-medium'>{formatFinanceDate(data.issuedAt)}</dd>
                </div>
                <div>
                  <dt className='text-[11px] text-muted-foreground'>Vade</dt>
                  <dd className='mt-0.5 text-sm font-medium'>{formatFinanceDate(data.dueAt)}</dd>
                </div>
                <div>
                  <dt className='text-[11px] text-muted-foreground'>Belge</dt>
                  <dd className='mt-0.5 text-sm font-medium'>
                    {data.documentReady ? 'Hazır' : 'Demo — PDF yok'}
                  </dd>
                </div>
              </dl>
              <div>
                <p className='mb-1.5 text-xs text-muted-foreground'>Sipariş / gönderi</p>
                <div className='flex flex-wrap gap-1.5'>
                  {data.relatedShipments.map((shipment) => (
                    <FinanceEntityLinks key={shipment.id} shipment={shipment} />
                  ))}
                  {data.relatedOrders.map((order) => (
                    <FinanceEntityLinks key={order.id} order={order} />
                  ))}
                  {!data.relatedShipments.length && !data.relatedOrders.length ? (
                    <span className='text-sm text-muted-foreground'>—</span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-3 p-4'>
              <h2 className='text-sm font-semibold'>Bağlı hareketler</h2>
              {txQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>Hareketler yükleniyor…</p>
              ) : movements.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Bu faturaya bağlı hareket yok.</p>
              ) : (
                <ul className='divide-y rounded-lg border'>
                  {movements.map((item) => (
                    <li key={item.id} className='flex items-start justify-between gap-3 px-3 py-2.5'>
                      <div className='min-w-0'>
                        <p className='text-sm'>{item.narrative}</p>
                        <p className='text-[11px] text-muted-foreground'>
                          {formatFinanceDateTime(item.occurredAt)}
                        </p>
                      </div>
                      <Button variant='ghost' size='sm' className='h-7 shrink-0 px-2' asChild>
                        <Link href={ARF_ROUTES.gonder.finance.transactions.detail(item.id)}>Aç</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </FinancePageShell>
  )
}
