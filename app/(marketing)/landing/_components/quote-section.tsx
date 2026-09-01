'use client'

import { QuoteForm } from './quote-form'

export function QuoteSection() {
  return (
    <section id='teklif-al' className='gl-section scroll-mt-16'>
      <div className='gl-container'>
        <div className='grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(400px,1fr)]'>
          <div className='max-w-md space-y-4 lg:sticky lg:top-24'>
            <p className='gl-eyebrow'>Teklif al</p>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Kargodan komple araca, birkaç adımda fiyat.
            </h2>
            <p className='text-[var(--gl-muted)]'>
              Paketini veya yükünü tanımla, güzergâhı seç. Anlık fiyat varsa seçenekleri karşılaştır;
              yoksa bilgilerin korunarak özel teklif talebine geçer.
            </p>
            <ul className='space-y-2.5 pt-2 text-sm text-[var(--gl-muted)]'>
              {[
                'Üyelik olmadan başla',
                'Kargo ve lojistik tek formda',
                'Bilgilerin adımlar arasında korunur',
              ].map((item) => (
                <li key={item} className='flex items-start gap-2.5'>
                  <span
                    className='mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--gl-accent)]'
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='gl-card overflow-hidden p-1'>
            <QuoteForm />
          </div>
        </div>
      </div>
    </section>
  )
}
