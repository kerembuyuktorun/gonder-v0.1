import { Boxes, PackageCheck, Route, Warehouse } from 'lucide-react'

const BENEFITS = [
  { icon: PackageCheck, label: 'Kargo, parsiyel ve komple araç' },
  { icon: Route, label: '81 il navlun ağı kapsamı' },
  { icon: Warehouse, label: 'Ambar hatları dijital görünür' },
  { icon: Boxes, label: 'Toplu gönderi ve entegrasyon' },
]

export function TrustStrip() {
  return (
    <section
      aria-label='Öne çıkan faydalar'
      className='border-y border-[var(--gl-border)] bg-[var(--gl-bg-soft)] py-5'
    >
      <div className='gl-container grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
        {BENEFITS.map((item) => (
          <div key={item.label} className='flex items-center gap-2.5'>
            <span
              className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gl-petrol-soft)] text-[var(--gl-petrol)]'
              aria-hidden
            >
              <item.icon className='size-4' />
            </span>
            <p className='text-sm font-medium text-[var(--gl-ink)]'>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
