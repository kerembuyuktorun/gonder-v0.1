'use client'

import { ArrowDown, Building2, Clock3, CreditCard, MapPin, Phone, User } from 'lucide-react'
import type { OrderLocationContactKind, OrderLocationPoint } from '../_types/order-detail'

function LocationBadge({ tip }: { tip: OrderLocationContactKind }) {
  const label = tip === 'kurumsal' ? 'Kurumsal' : tip === 'bireysel' ? 'Bireysel' : 'Tesis'
  return (
    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase ring-1 ring-slate-200/80">
      {label}
    </span>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  if (!value || value === '—') return null
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="truncate text-xs text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function LocationBlock({ title, point }: { title: string; point: OrderLocationPoint }) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
            {title}
          </p>
          <LocationBadge tip={point.contact_tipi} />
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/80">
          <Clock3 className="size-3 text-slate-400" />
          {point.zaman_penceresi}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-900">{point.baslik}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{point.adres}</p>

      {point.contact_tipi === 'kurumsal' ? (
        <div className="mt-3 grid gap-2.5 border-t border-slate-200/70 pt-3 sm:grid-cols-2">
          <MetaRow icon={Building2} label="Firma" value={point.firma_adi ?? '—'} />
          <MetaRow icon={CreditCard} label="VKN" value={point.vkn ?? '—'} />
          <MetaRow icon={Building2} label="Vergi Dairesi" value={point.vergi_dairesi ?? '—'} />
          <MetaRow icon={User} label="Muhatap" value={point.muhatap} />
          <MetaRow icon={Phone} label="İletişim" value={point.telefon || '—'} />
        </div>
      ) : null}

      {point.contact_tipi === 'bireysel' ? (
        <div className="mt-3 grid gap-2.5 border-t border-slate-200/70 pt-3 sm:grid-cols-2">
          <MetaRow icon={User} label="Ad Soyad" value={point.muhatap} />
          <MetaRow icon={CreditCard} label="TCKN" value={point.tckn ?? '—'} />
          <MetaRow icon={Phone} label="Telefon" value={point.telefon || '—'} />
        </div>
      ) : null}

      {point.contact_tipi === 'tesis' ? (
        <div className="mt-3 grid gap-2.5 border-t border-slate-200/70 pt-3 sm:grid-cols-2">
          <MetaRow icon={User} label="Ad Soyad" value={point.muhatap} />
          <MetaRow icon={Phone} label="Telefon" value={point.telefon || '—'} />
        </div>
      ) : null}
    </div>
  )
}

export function LocationSlaCard({
  alis,
  varis,
}: {
  alis: OrderLocationPoint
  varis: OrderLocationPoint
}) {
  return (
    <section className="p-5 lg:col-span-5 lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
          <MapPin className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">Lokasyon & SLA</h3>
      </div>
      <div className="space-y-2">
        <LocationBlock title="Alış" point={alis} />
        <div className="flex h-4 items-center justify-center">
          <span className="flex size-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
            <ArrowDown className="size-3" />
          </span>
        </div>
        <LocationBlock title="Varış" point={varis} />
      </div>
    </section>
  )
}
