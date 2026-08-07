'use client'

import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'

type Props = {
  title: string
  description: string
}

export function FinanceComingSoonPage({ title, description }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: title },
        ]}
      />
      <div className='flex flex-1 flex-col items-start gap-4 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
          <p className='mt-1 max-w-xl text-sm text-slate-500'>{description}</p>
        </div>
        <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12'>
          <p className='text-sm font-medium text-slate-700'>Yakında</p>
          <p className='mt-1 text-sm text-slate-500'>
            Bu ekran Faz 2’de mevcut tahsilat hareketleriyle birlikte kurgulanacak.
          </p>
          <Button variant='outline' className='mt-4' asChild>
            <Link href={ARF_ROUTES.lastmile.finance.customers.list}>Müşteri carilerine git</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
