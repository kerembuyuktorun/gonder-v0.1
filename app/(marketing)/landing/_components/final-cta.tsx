'use client'

import { useQuoteLanding } from './quote-context'

export function FinalCta() {
  const { scrollToQuote } = useQuoteLanding()

  return (
    <section className='gl-section pb-8'>
      <div className='gl-container'>
        <div className='rounded-2xl bg-[var(--gl-petrol)] px-6 py-12 text-center text-white sm:px-12'>
          <h2 className='text-3xl font-bold sm:text-4xl'>Bir paket de olsa, bir araç dolusu da.</h2>
          <p className='mx-auto mt-3 max-w-md text-white/80'>
            Gönderi bilgilerini gir, taşıma seçeneklerini gör.
          </p>
          <button type='button' className='gl-btn-primary mt-8' onClick={scrollToQuote}>
            Teklif Al
          </button>
        </div>
      </div>
    </section>
  )
}
