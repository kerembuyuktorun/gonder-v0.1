'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { FinancePageShell } from './finance-page-shell'
import { WalletTopUpForm } from './wallet-top-up-form'

export function FinanceWalletTopUpContent() {
  return (
    <FinancePageShell
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Cüzdan', href: ARF_ROUTES.gonder.finance.wallet.root },
        { label: 'Yükleme' },
      ]}
      title='Cüzdan yükleme'
      description='Kart veya havale ile işletme cüzdanına demo bakiye ekleyin.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.finance.wallet.root}>Cüzdana dön</Link>
        </Button>
      }
    >
      <Card className='max-w-lg gap-0 py-0 shadow-sm'>
        <CardContent className='p-4'>
          <WalletTopUpForm />
        </CardContent>
      </Card>
    </FinancePageShell>
  )
}
