'use client'

import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ArrowRight, Building2, Handshake, Users, Wallet } from 'lucide-react'
import { ARF_ROUTES } from '../../../_shared/routes'

const LINKS = [
  {
    title: 'Müşteriler',
    description: 'Cari bakiyeli müşteri listesi; detayda fiyat & ödeme ayarları.',
    href: ARF_ROUTES.lastmile.finance.customers.list,
    icon: Users,
  },
  {
    title: 'Tedarikçiler',
    description: 'Kurye ve diğer tedarikçilerin birleşik cari listesi.',
    href: ARF_ROUTES.lastmile.finance.suppliers.list,
    icon: Building2,
  },
  {
    title: 'Hakedişler',
    description: 'Sözleşme bazlı kurye / tedarikçi hakediş ve ödeme takibi.',
    href: ARF_ROUTES.lastmile.finance.payouts.list,
    icon: Handshake,
  },
  {
    title: 'Gelirler',
    description: 'Yakında — tahsilat hareketleri.',
    href: ARF_ROUTES.lastmile.finance.income.list,
    icon: Wallet,
    soon: true,
  },
  {
    title: 'Giderler',
    description: 'Yakında — ödeme / gider hareketleri.',
    href: ARF_ROUTES.lastmile.finance.expenses.list,
    icon: Wallet,
    soon: true,
  },
] as const

export default function FinanceHubPageContent() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
            Finans & Muhasebe
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Müşteri ve tedarikçi carileri ile hakediş takibine buradan geçin. Fiyatlandırmalar
            ayrı menüdedir.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className='group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-none transition-colors hover:border-lime-300 hover:bg-lime-50/40'
              >
                <span className='flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-lime-200 group-hover:text-black'>
                  <Icon className='size-5' />
                </span>
                <h2 className='mt-4 text-base font-semibold text-slate-900'>
                  {item.title}
                  {'soon' in item && item.soon ? (
                    <span className='ml-2 text-xs font-medium text-slate-400'>Yakında</span>
                  ) : null}
                </h2>
                <p className='mt-1.5 flex-1 text-sm text-slate-500'>{item.description}</p>
                <span className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:text-black'>
                  Sayfaya git
                  <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
                </span>
              </Link>
            )
          })}
        </div>

        <p className='text-sm text-slate-500'>
          Fiyat listeleri ve bölgeler için{' '}
          <Link
            href={ARF_ROUTES.lastmile.settings.pricing.priceLists.list}
            className='font-medium text-slate-800 underline-offset-2 hover:underline'
          >
            Fiyatlandırma
          </Link>{' '}
          menüsünü kullanın.
        </p>
      </div>
    </>
  )
}
