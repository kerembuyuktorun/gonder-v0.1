'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  PiggyBank,
  Timer,
  Truck,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { useFinanceSummary } from '../../_hooks/use-finance'
import {
  FINANCE_SUMMARY_PERIOD_LABELS,
  FINANCE_SUMMARY_PERIODS,
  formatMoneyTry,
  type FinanceSummaryPeriod,
} from '../../_types/finance'
import { FinancePageShell } from './finance-page-shell'
import { WalletTopUpDialog } from './wallet-top-up-dialog'

export function FinanceSummaryContent() {
  const [period, setPeriod] = useState<FinanceSummaryPeriod>('30d')
  const [topUpOpen, setTopUpOpen] = useState(false)
  const { data, isLoading, isError } = useFinanceSummary(period)

  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans' },
        { label: 'Özet' },
      ]}
      title='Finans özeti'
      description='Sipariş, kargo harcaması, tahmini tasarruf, bekleyen ödeme ve cüzdan bakiyesi.'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex rounded-lg border bg-muted/20 p-0.5'>
          {FINANCE_SUMMARY_PERIODS.map((id) => (
            <Button
              key={id}
              type='button'
              size='sm'
              variant={period === id ? 'secondary' : 'ghost'}
              className='h-7 px-2.5 text-xs'
              onClick={() => setPeriod(id)}
            >
              {FINANCE_SUMMARY_PERIOD_LABELS[id]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>Özet yükleniyor…</CardContent>
        </Card>
      ) : isError || !data ? (
        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3 text-sm text-muted-foreground'>
            Finans özeti alınamadı. Lütfen yenileyin.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <KpiCard
              icon={ClipboardList}
              label='Alınan sipariş'
              value={String(data.orderCount)}
              hint={FINANCE_SUMMARY_PERIOD_LABELS[period]}
              href={ARF_ROUTES.gonder.orders.list}
            />
            <KpiCard
              icon={Truck}
              label='Kargo / lojistik'
              value={formatMoneyTry(data.logisticsSpendTry)}
              hint='Ödenen ve faturalanan taşıma'
              href={ARF_ROUTES.gonder.finance.transactions.list}
            />
            <KpiCard
              icon={PiggyBank}
              label='Tahmini tasarruf'
              value={formatMoneyTry(data.estimatedSavingsTry)}
              hint='Liste fiyatına göre yaklaşık %12'
            />
            <KpiCard
              icon={Timer}
              label='Bekleyen ödeme'
              value={formatMoneyTry(data.pendingPaymentTry)}
              hint={`${data.pendingPaymentCount} açık fatura`}
              href={ARF_ROUTES.gonder.finance.upcoming.list}
            />
          </div>

          <Card className='gap-0 border py-0 shadow-sm'>
            <CardContent className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-3'>
                <div className='flex size-10 items-center justify-center rounded-md bg-muted'>
                  <Wallet className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Cüzdan bakiyesi</p>
                  <p className='text-2xl font-semibold tabular-nums tracking-tight'>
                    {formatMoneyTry(data.walletBalanceTry)}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Gönderileri cüzdandan ödemek veya fatura kapatmak için bakiye yükleyin.
                  </p>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' onClick={() => setTopUpOpen(true)}>
                  Cüzdana bakiye yükle
                </Button>
                <Button type='button' variant='outline' asChild>
                  <Link href={ARF_ROUTES.gonder.finance.wallet.root}>Cüzdanı aç</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <WalletTopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </FinancePageShell>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof ClipboardList
  label: string
  value: string
  hint?: string
  href?: string
}) {
  const body = (
    <Card className='h-full gap-0 py-0 shadow-sm transition-colors hover:border-primary/30'>
      <CardContent className='p-3'>
        <div className='flex size-8 items-center justify-center rounded-md bg-muted'>
          <Icon className='size-4 text-muted-foreground' />
        </div>
        <div className='mt-2'>
          <span className='text-xl font-semibold tabular-nums tracking-tight'>{value}</span>
          <p className='mt-1 text-xs text-muted-foreground'>{label}</p>
          {hint ? <p className='mt-0.5 text-[11px] text-muted-foreground'>{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className='block'>
        {body}
      </Link>
    )
  }
  return body
}
