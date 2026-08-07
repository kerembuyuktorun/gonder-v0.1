'use client'

import { Gauge, SlidersHorizontal, Timer } from 'lucide-react'
import { MetaChip } from '../../_components/meta-chip'
import type { OrderDetail } from '../_types/order-detail'

export function ConstraintsSection({ order }: { order: OrderDetail }) {
  return (
    <section className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 lg:px-6">
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(180px,0.8fr)_1fr_1fr_2.2fr] lg:divide-x lg:divide-slate-200">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
            <SlidersHorizontal className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Kısıtlar & Öncelik</h3>
        </div>

        <Metric icon={Timer} label="Görev Süresi" value={`${order.gorev_suresi_dk} dk`} />
        <Metric icon={Gauge} label="Öncelik Puanı" value={String(order.oncelik_puani)} />

        <div className="min-w-0 lg:pl-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Gereksinimler
          </p>
          {order.gereksinimler.length === 0 ? (
            <p className="text-sm text-slate-500">Ek gereksinim yok</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {order.gereksinimler.map((item) => (
                <MetaChip key={item} variant="requirement">
                  {item}
                </MetaChip>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Timer
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 lg:pl-5">
      <Icon className="size-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}
