'use client'

import { useQuoteLanding } from './quote-context'

export function FinalCta() {
  const { startOrder } = useQuoteLanding()

  return (
    <section className='gl-section pb-10'>
      <div className='gl-container'>
        <div className='relative overflow-hidden rounded-[1.5rem] border border-[var(--gl-border)] bg-white px-6 py-14 text-center sm:px-12'>
          <div className='gl-grid-bg absolute inset-0 opacity-70' aria-hidden />
          <div
            className='pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(196,74,45,0.08),transparent)]'
            aria-hidden
          />

          <div className='relative'>
            <p className='gl-eyebrow'>Başla</p>
            <h2 className='mt-3 text-3xl font-bold text-[var(--gl-ink)] sm:text-4xl'>
              Bir paket de olsa, bir araç dolusu da.
            </h2>
            <p className='mx-auto mt-3 max-w-md text-[var(--gl-muted)]'>
              Gönderi bilgilerini gir, taşıma seçeneklerini gör.
            </p>
            <button type='button' className='gl-btn-primary mt-8' onClick={() => startOrder()}>
              Teklif Al
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
