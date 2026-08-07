'use client'

import { Droplets, Hash, Mail, Phone, UserRound } from 'lucide-react'
import { formatTckn } from '../../_lib/query-couriers'
import type { LastmileCourier } from '../../_types/courier'
import { InfoRow, PanelHeader } from './detail-panels'

type Props = {
  courier: LastmileCourier
}

export function TabInfo({ courier }: Props) {
  return (
    <div className='grid gap-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={UserRound} title='Kimlik ve İletişim' />
        <div className='px-4 py-3.5'>
          <div className='divide-y divide-slate-100'>
            <InfoRow icon={Phone} label='Telefon' value={courier.telefon} copyable />
            <InfoRow
              icon={Hash}
              label='TCKN'
              value={formatTckn(courier.tckn)}
              mono
              copyable={Boolean(courier.tckn)}
            />
            <InfoRow
              icon={Mail}
              label='E-Posta'
              value={
                !courier.davet_kabul_edildi ? 'Davet bekleniyor' : courier.eposta
              }
            />
            <InfoRow icon={Droplets} label='Kan Grubu' value={courier.kan_grubu} />
          </div>
        </div>
      </section>
    </div>
  )
}
