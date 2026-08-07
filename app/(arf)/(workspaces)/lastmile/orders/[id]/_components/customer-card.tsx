'use client'

import { Building2, Mail, Phone, User } from 'lucide-react'
import type { OrderCustomerDetail } from '../_types/order-detail'

export function CustomerCard({ customer }: { customer: OrderCustomerDetail }) {
  return (
    <section className="flex min-w-0 flex-col p-5 lg:col-span-3 lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
          <Building2 className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">Müşteri</h3>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
            {customer.unvan.trim().charAt(0).toLocaleUpperCase('tr-TR')}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">{customer.unvan}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <User className="size-3.5 shrink-0 text-slate-400" />
              {customer.yetkili}
            </p>
          </div>
        </div>

        <dl className="grid flex-1 grid-rows-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-1 lg:grid-rows-4">
          <InfoRow label="VKN" value={customer.vkn} />
          <InfoRow label="Vergi Dairesi" value={customer.vergi_dairesi} />
          <InfoRow icon={Mail} label="E-posta" value={customer.email} />
          <InfoRow icon={Phone} label="Telefon" value={customer.telefon} />
        </dl>
      </div>
    </section>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
      <dt className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
        {Icon ? <Icon className="size-3.5 text-slate-400" /> : null}
        {label}
      </dt>
      <dd className="min-w-0 break-all text-right text-xs font-medium text-slate-700" title={value}>
        {value}
      </dd>
    </div>
  )
}
