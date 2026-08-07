'use client'

import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ArrowRight, Bike, Handshake, MapPinned, Tags, Wallet } from 'lucide-react'
import { ARF_ROUTES } from '../../../_shared/routes'

const LINKS = [
  {
    title: 'Fiyat Listeleri',
    description: 'Genel ve müşteriye özel last mile ücretlendirmelerini yönetin.',
    href: ARF_ROUTES.lastmile.finance.priceLists.list,
    icon: Tags,
  },
  {
    title: 'Fiyat Bölgeleri',
    description: 'İlçe paketleri tanımlayın; bölge bazlı sabit ücret kurallarında kullanın.',
    href: ARF_ROUTES.lastmile.finance.zones.list,
    icon: MapPinned,
  },
  {
    title: 'Tahsilatlar',
    description: 'Peşin / vadeli sipariş tahsilatlarını ve açık bakiyeleri takip edin.',
    href: ARF_ROUTES.lastmile.finance.collections.list,
    icon: Wallet,
  },
  {
    title: 'Kurye Ücret Listeleri',
    description: 'Tarife, maaş + prim ve hibrit modellerle kurye/tedarikçi maliyetlerini yönetin.',
    href: ARF_ROUTES.lastmile.finance.courierCostLists.list,
    icon: Bike,
  },
  {
    title: 'Kurye Ödemeleri / Hakediş',
    description: 'Kurye hakedişlerini takip edin; haftalık / aylık ödemeleri kaydedin.',
    href: ARF_ROUTES.lastmile.finance.courierPayouts.list,
    icon: Handshake,
  },
] as const

export default function FinanceHubPageContent() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>Finans</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Müşteri fiyatlandırması, kurye maliyetleri, bölgeler ve tahsilat / hakediş işlemlerine
            buradan geçin.
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
                <h2 className='mt-4 text-base font-semibold text-slate-900'>{item.title}</h2>
                <p className='mt-1.5 flex-1 text-sm text-slate-500'>{item.description}</p>
                <span className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:text-black'>
                  Sayfaya git
                  <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
