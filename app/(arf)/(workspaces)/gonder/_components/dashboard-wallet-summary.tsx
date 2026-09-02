'use client'

import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../_shared/routes'
import { tDashboard } from '../_data/dashboard-labels'
import { useWalletAccount, useWalletLedger } from '../_hooks/use-wallet'
import { formatMoneyTry } from '../_types/finance'

function formatSignedAmount(value: number) {
  const abs = formatMoneyTry(Math.abs(value))
  if (value < 0) return `−${abs}`
  if (value > 0) return `+${abs}`
  return abs
}

export function DashboardWalletSummary({ className }: { className?: string }) {
  const accountQuery = useWalletAccount()
  const ledgerQuery = useWalletLedger()

  const balance = accountQuery.data?.balance.amount
  const lastEntry = ledgerQuery.data?.items[0]
  const lastLine = lastEntry
    ? `${lastEntry.description} · ${formatSignedAmount(lastEntry.signedAmount)}`
    : tDashboard('wallet.emptyMovement')

  return (
    <Card
      className={cn(
        'h-full min-h-[140px] gap-0 border bg-card py-0 shadow-sm',
        className
      )}
    >
      <CardContent className='flex h-full flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5'>
        <div className='flex min-w-0 items-start gap-3 sm:items-center'>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
            <Wallet className='size-5' aria-hidden />
          </div>
          <div className='min-w-0 space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>
              {tDashboard('wallet.title')}
            </p>
            <p className='text-2xl font-semibold tracking-tight tabular-nums'>
              <span className='sr-only'>{tDashboard('wallet.balance')}: </span>
              {accountQuery.isLoading ? '…' : formatMoneyTry(balance ?? 0)}
            </p>
            <p className='line-clamp-1 text-sm text-muted-foreground'>
              {ledgerQuery.isLoading
                ? tDashboard('wallet.loading')
                : `${tDashboard('wallet.lastMovement')}: ${lastLine}`}
            </p>
          </div>
        </div>
        <Button asChild size='sm' className='w-fit shrink-0'>
          <Link href={ARF_ROUTES.gonder.finance.wallet.topUp}>
            {tDashboard('wallet.topUp')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
