'use client'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { OrderTypeDefinition } from '../_types/definitions'

type Props = {
  orderTypes: OrderTypeDefinition[]
  onToggle: (id: string, enabled: boolean) => void
}

export function SectionOrderTypes({ orderTypes, onToggle }: Props) {
  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-base font-semibold text-slate-900'>Sipariş Tipleri</h2>
        <p className='mt-1 text-sm text-slate-500'>
          Tenant genelinde kullanılabilecek sipariş akışlarını açıp kapatın. Sistem tiplerinin
          kodları sabittir.
        </p>
      </div>

      {orderTypes.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400'>
          Tanımlı sipariş tipi bulunamadı.
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          {orderTypes.map((orderType) => (
            <li
              key={orderType.id}
              className='flex items-center justify-between gap-4 px-4 py-3.5'
            >
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-semibold text-slate-900'>
                    {orderType.label}
                  </span>
                  <Badge
                    variant='outline'
                    className='rounded-md border-slate-200 bg-slate-50 px-1.5 py-0 font-mono text-[11px] font-medium text-slate-500 shadow-none'
                  >
                    {orderType.code}
                  </Badge>
                  {orderType.system ? (
                    <Badge
                      variant='outline'
                      className='rounded-md border-violet-200 bg-violet-50 px-1.5 py-0 text-[11px] font-medium text-violet-700 shadow-none'
                    >
                      Sistem
                    </Badge>
                  ) : null}
                </div>
                <p className='mt-1 truncate text-xs text-slate-500'>{orderType.description}</p>
              </div>
              <Switch
                checked={orderType.enabled}
                onCheckedChange={(checked) => onToggle(orderType.id, checked)}
                aria-label={`${orderType.label} sipariş tipini ${orderType.enabled ? 'kapat' : 'aç'}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
