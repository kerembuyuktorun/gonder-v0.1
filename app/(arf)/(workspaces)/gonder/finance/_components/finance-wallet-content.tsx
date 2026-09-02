'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useWalletAccount, useWalletLedger } from '../../_hooks/use-wallet'
import {
  WALLET_ACCOUNT_STATUS_LABELS,
  WALLET_LEDGER_TYPE_LABELS,
} from '../../_types/wallet'
import { formatFinanceDateTime, formatMoney } from '../../_types/finance'
import { FinancePageShell } from './finance-page-shell'
import { WalletTopUpDialog } from './wallet-top-up-dialog'

export function FinanceWalletContent() {
  const [topUpOpen, setTopUpOpen] = useState(false)
  const accountQuery = useWalletAccount()
  const ledgerQuery = useWalletLedger()
  const account = accountQuery.data
  const ledger = ledgerQuery.data?.items.slice(0, 6) ?? []

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Cüzdan' },
      ]}
      title='Cüzdan'
      description='İşletme cüzdan bakiyesi, yükleme ve son hareketler.'
      actions={
        <Button type='button' onClick={() => setTopUpOpen(true)}>
          Cüzdana bakiye yükle
        </Button>
      }
    >
      {accountQuery.isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Cüzdan yükleniyor…</CardContent>
        </Card>
      ) : !account ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Cüzdan bilgisi alınamadı.</CardContent>
        </Card>
      ) : (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-xs text-muted-foreground'>{account.displayName}</p>
              <p className='text-2xl font-semibold tabular-nums tracking-tight'>
                {formatMoney(account.balance)}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Durum: {WALLET_ACCOUNT_STATUS_LABELS[account.status]} · Güncelleme{' '}
                {formatFinanceDateTime(account.updatedAt)}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button type='button' variant='outline' asChild>
                <Link href={ARF_ROUTES.gonder.finance.wallet.topUp}>Yükleme sayfası</Link>
              </Button>
              <Button type='button' variant='outline' asChild>
                <Link href={ARF_ROUTES.gonder.finance.wallet.history}>Tüm geçmiş</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='gap-0 py-0 shadow-sm'>
        <CardContent className='space-y-3 p-4'>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='text-sm font-semibold'>Son hareketler</h2>
            <Button variant='ghost' size='sm' asChild className='h-7 px-2'>
              <Link href={ARF_ROUTES.gonder.finance.wallet.history}>Tümü</Link>
            </Button>
          </div>
          {ledgerQuery.isLoading ? (
            <p className='text-sm text-muted-foreground'>Hareketler yükleniyor…</p>
          ) : ledger.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Cüzdan hareketi yok.</p>
          ) : (
            <ul className='divide-y rounded-lg border'>
              {ledger.map((entry) => (
                <li key={entry.id} className='flex items-start justify-between gap-3 px-3 py-2.5'>
                  <div className='min-w-0'>
                    <p className='text-sm'>{entry.description}</p>
                    <p className='text-[11px] text-muted-foreground'>
                      {WALLET_LEDGER_TYPE_LABELS[entry.type]} · {formatFinanceDateTime(entry.occurredAt)}
                    </p>
                  </div>
                  <span
                    className={
                      entry.signedAmount < 0
                        ? 'shrink-0 tabular-nums text-sm font-medium'
                        : 'shrink-0 tabular-nums text-sm font-medium text-emerald-700'
                    }
                  >
                    {entry.signedAmount < 0 ? '−' : '+'}
                    {formatMoney(entry.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <WalletTopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </FinancePageShell>
  )
}
