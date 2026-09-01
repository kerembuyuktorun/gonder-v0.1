'use client'

import { HeroChatbox } from './hero-chatbox'

export function LandingHero() {
  return (
    <section className='relative overflow-hidden'>
      <div className='gl-grid-bg absolute inset-0' aria-hidden />
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(65%_100%_at_50%_0%,rgba(25,91,85,0.06),transparent)]'
        aria-hidden
      />

      <div className='gl-container relative py-20 sm:py-24 lg:py-28'>
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

          <div className='mt-9 sm:mt-10'>
            <HeroChatbox />
          </div>
        </div>
      </div>
    </section>
  )
}
