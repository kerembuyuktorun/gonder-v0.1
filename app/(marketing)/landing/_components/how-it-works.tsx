import { ClipboardList, GitCompare, Radar } from 'lucide-react'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Gönderini tanımla',
    description: 'Paketini, yükünü ve güzergâhını belirt.',
  },
  {
    icon: GitCompare,
    title: 'Seçeneğini belirle',
    description: 'Mevcut fiyatları karşılaştır veya özel teklif iste.',
  },
  {
    icon: Radar,
    title: 'Süreci takip et',
    description: 'Gönderinin ilerleyişini tek panelden izle.',
  },
]

export function HowItWorks() {
  return (
    <section id='cozumler' className='gl-section scroll-mt-16'>
      <div className='gl-container'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold sm:text-4xl'>Nasıl çalışır?</h2>
          <p className='mt-3 text-[var(--gl-muted)]'>Üç adımda taşıma seçeneğine ulaş.</p>
        </div>

        <ol className='mt-12 grid gap-6 sm:grid-cols-3'>
          {STEPS.map((step, index) => (
            <li key={step.title} className='gl-card relative p-6'>
              <span className='mb-4 flex size-11 items-center justify-center rounded-xl bg-[var(--gl-petrol)]/10 text-[var(--gl-petrol)]'>
                <step.icon className='size-5' aria-hidden />
              </span>
              <span className='absolute right-4 top-4 text-4xl font-bold text-[var(--gl-border)]'>
                {index + 1}
              </span>
              <h3 className='text-lg font-semibold'>{step.title}</h3>
              <p className='mt-2 text-sm leading-relaxed text-[var(--gl-muted)]'>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
