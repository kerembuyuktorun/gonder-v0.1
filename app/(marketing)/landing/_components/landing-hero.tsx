'use client'

import { QuoteForm } from './quote-form'

export function LandingHero() {
  return (
    <section id='teklif-al' className='gl-section scroll-mt-16 pt-8 lg:pt-12'>
      <div className='gl-container'>
        <div className='grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,480px)] lg:gap-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,520px)]'>
          <div className='max-w-xl space-y-5'>
            <p className='text-sm font-medium text-[var(--gl-muted)]'>Arf altyapısıyla</p>
            <h1 className='text-[clamp(2.125rem,5vw,4.25rem)] font-bold leading-[1.08] text-[var(--gl-ink)]'>
              Kargodan komple araca.
              <br />
              Taşımanın kolay yolu.
            </h1>
            <p className='max-w-md text-lg leading-relaxed text-[var(--gl-muted)]'>
              Paketini veya yükünü tanımla, taşıma seçeneklerini karşılaştır. Gönderilerini tek yerden yönet.
            </p>
          </div>

          <div className='gl-card overflow-hidden p-1 lg:sticky lg:top-20'>
            <QuoteForm />
          </div>
        </div>
      </div>
    </section>
  )
}
