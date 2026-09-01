'use client'

import { HeroChatbox } from './hero-chatbox'
import {
  TileCourier,
  TilePackages,
  TileRoute,
  TileTruck,
  TileWarehouse,
} from './hero-visuals'

export function LandingHero() {
  return (
    <section className='px-4 pb-6 pt-4 sm:px-6'>
      <div className='relative mx-auto max-w-[80rem] overflow-hidden rounded-[1.75rem] border border-[var(--gl-border)] bg-white'>
        <div className='gl-grid-bg absolute inset-0 opacity-60' aria-hidden />
        <div
          className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(25,91,85,0.07),transparent)]'
          aria-hidden
        />

        {/* Masaüstü: ortadaki mesajın çevresine dağılmış görseller */}
        <div className='pointer-events-none absolute inset-0 hidden lg:block' aria-hidden>
          <TileCourier
            className='gl-float absolute left-[3%] top-[12%] w-[205px]'
            label='Kurye teslimatı'
            caption='Kurye · şehir içi'
          />
          <TileTruck
            className='gl-float-slow absolute left-1/2 top-[2%] w-[190px] -translate-x-1/2'
            label='Komple araç taşıması'
            caption='Komple araç'
          />
          <TileWarehouse
            className='gl-float absolute right-[3%] top-[16%] w-[195px]'
            label='Ambar operasyonu'
            caption='Ambar · aktarma'
          />
          <TilePackages
            className='gl-float-slow absolute bottom-[5%] left-[5%] w-[190px]'
            label='Koli ve paketler'
            caption='Kargo · koli'
          />
          <TileRoute
            className='gl-float absolute bottom-[4%] right-[5%] w-[205px]'
            label='Güzergâh planı'
            caption='81 il · navlun ağı'
          />
        </div>

        {/* Merkez içerik */}
        <div className='relative px-5 py-14 sm:px-8 sm:py-20 lg:px-8 lg:pb-32 lg:pt-52'>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='gl-eyebrow'>Arf altyapısıyla</p>

            <h1 className='mt-4 text-[clamp(2.125rem,6vw,4.5rem)] font-extrabold leading-[1.06] text-[var(--gl-ink)]'>
              Tüm gönderiler için{' '}
              <span className='relative whitespace-nowrap'>
                <span className='relative z-10'>tek çözüm</span>
                <span
                  className='absolute inset-x-[-0.06em] bottom-[0.07em] z-0 h-[0.24em] rounded-full bg-[var(--gl-yellow)]/65'
                  aria-hidden
                />
              </span>
            </h1>

            <p className='mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--gl-muted)] sm:text-lg'>
              Kargo, parsiyel yük ve komple araç. Yükünü tarif et, taşıma seçeneklerini karşılaştır,
              süreci tek panelden takip et.
            </p>

            <div className='mt-8 sm:mt-10'>
              <HeroChatbox />
            </div>
          </div>

          {/* Mobil / tablet: görseller şerit olarak */}
          <div className='mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden'>
            <TileCourier className='w-full' label='Kurye teslimatı' caption='Kurye' />
            <TileTruck className='w-full' label='Komple araç' caption='Komple araç' />
            <TilePackages className='w-full max-sm:hidden' label='Koli ve paketler' caption='Kargo' />
          </div>
        </div>
      </div>
    </section>
  )
}
