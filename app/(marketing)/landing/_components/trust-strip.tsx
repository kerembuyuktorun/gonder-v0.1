import { Truck } from 'lucide-react'

export function TrustStrip() {
  return (
    <section aria-label='Taşıma partnerleri' className='border-y border-[var(--gl-border)] bg-white/60 py-6'>
      <div className='gl-container flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
        <p className='text-sm font-medium text-[var(--gl-muted)]'>Taşıma partnerleri</p>
        <div className='flex flex-wrap items-center justify-center gap-3 sm:justify-end'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className='flex h-10 min-w-[7rem] items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--gl-border)] bg-[var(--gl-bg)] px-4 text-xs font-medium text-[var(--gl-muted)]'
            >
              <Truck className='size-3.5 opacity-50' aria-hidden />
              Partner {i}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
