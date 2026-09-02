'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useWalletLedgerEntry } from '../../_hooks/use-wallet'
import { PAYMENT_METHOD_LABELS, formatFinanceDateTime, formatMoney } from '../../_types/finance'
import { WALLET_LEDGER_TYPE_LABELS } from '../../_types/wallet'
import { FinancePageShell } from './finance-page-shell'

type Props = {
  entryId: string
}

export function FinanceWalletHistoryDetailContent({ entryId }: Props) {
  const { data, isLoading } = useWalletLedgerEntry(entryId)

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Cüzdan', href: ARF_ROUTES.gonder.finance.wallet.root },
        { label: 'Geçmiş', href: ARF_ROUTES.gonder.finance.wallet.history },
        { label: 'Detay' },
      ]}
      title='Cüzdan kaydı'
      description={data?.description}
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.finance.wallet.history}>Listeye dön</Link>
        </Button>
      }
    >
      {isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Kayıt yükleniyor…</CardContent>
        </Card>
      ) : !data ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Kayıt bulunamadı.</CardContent>
        </Card>
      ) : (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='grid gap-3 p-4 sm:grid-cols-2'>
            <div>
              <p className='text-[11px] text-muted-foreground'>Tür</p>
              <p className='text-sm font-medium'>{WALLET_LEDGER_TYPE_LABELS[data.type]}</p>
            </div>
            <div>
              <p className='text-[11px] text-muted-foreground'>Tutar</p>
              <p className='text-sm font-medium tabular-nums'>
                {data.signedAmount < 0 ? '−' : '+'}
                {formatMoney(data.amount)}
              </p>
            </div>
            <div>
              <p className='text-[11px] text-muted-foreground'>Sonraki bakiye</p>
              <p className='text-sm font-medium tabular-nums'>{formatMoney(data.balanceAfter)}</p>
            </div>
            <div>
              <p className='text-[11px] text-muted-foreground'>Yöntem</p>
              <p className='text-sm font-medium'>
                {data.method ? PAYMENT_METHOD_LABELS[data.method] : '—'}
              </p>
            </div>
            <div>
              <p className='text-[11px] text-muted-foreground'>Tarih</p>
              <p className='text-sm font-medium'>{formatFinanceDateTime(data.occurredAt)}</p>
            </div>
            <div>
              <p className='text-[11px] text-muted-foreground'>İlgili hareket</p>
              <p className='text-sm font-medium'>
                {data.relatedPaymentId ? (
                  <Link
                    className='underline-offset-2 hover:underline'
                    href={ARF_ROUTES.gonder.finance.transactions.detail(data.relatedPaymentId)}
                  >
                    {data.relatedPaymentId}
                  </Link>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </FinancePageShell>
  )
}
