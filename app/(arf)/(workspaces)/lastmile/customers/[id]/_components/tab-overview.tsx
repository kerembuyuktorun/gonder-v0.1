'use client'

import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  Copy,
  KeyRound,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerDetail } from '../_types/customer-detail'

type Props = {
  customer: CustomerDetail
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
      {children}
    </p>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon
  title: string
  meta?: ReactNode
}) {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
          <Icon className='size-4' />
        </span>
        <h3 className='text-sm font-semibold text-slate-900'>{title}</h3>
      </div>
      {meta}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  copyable,
}: {
  icon: LucideIcon
  label: string
  value?: string | null
  mono?: boolean
  copyable?: boolean
}) {
  const trimmed = value?.trim() ?? ''
  const canCopy = Boolean(copyable && trimmed)

  return (
    <div className='flex items-start justify-between gap-4 py-2.5'>
      <span className='flex shrink-0 items-center gap-2.5 text-sm text-slate-500'>
        <Icon className='size-4 text-slate-400' />
        {label}
      </span>
      <span className='flex min-w-0 items-start gap-1'>
        <span
          className={cn(
            'wrap-break-word text-right text-sm font-medium text-slate-800',
            mono && 'font-mono text-[13px]'
          )}
        >
          {trimmed || '—'}
        </span>
        {canCopy ? (
          <button
            type='button'
            onClick={async () => {
              const ok = await copyText(trimmed)
              if (ok) toast.success(`${label} kopyalandı`)
              else toast.error('Kopyalanamadı')
            }}
            className='rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600'
            aria-label={`${label} kopyala`}
          >
            <Copy className='size-3.5' />
          </button>
        ) : null}
      </span>
    </div>
  )
}

function PrefRow({
  icon: Icon,
  label,
  description,
  on,
}: {
  icon: LucideIcon
  label: string
  description: string
  on: boolean
}) {
  return (
    <div className='flex items-center justify-between gap-3 py-2.5'>
      <div className='flex min-w-0 items-start gap-2.5'>
        <Icon className='mt-0.5 size-4 shrink-0 text-slate-400' />
        <div className='min-w-0'>
          <p className='text-sm font-medium text-slate-700'>{label}</p>
          <p className='mt-0.5 text-xs leading-4 text-slate-400'>{description}</p>
        </div>
      </div>
      <Badge
        variant='outline'
        className={cn(
          'shrink-0 gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
          on
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-slate-50 text-slate-400'
        )}
      >
        <span className={cn('size-1.5 rounded-full', on ? 'bg-emerald-500' : 'bg-slate-300')} />
        {on ? 'Açık' : 'Kapalı'}
      </Badge>
    </div>
  )
}

export function TabOverview({ customer }: Props) {
  const location = [customer.il, customer.ilce].filter(Boolean).join(' · ')

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2'>
        <PanelHeader icon={Building2} title='Müşteri Bilgileri' />

        <div className='px-4 py-3.5'>
          <SectionLabel>Vergi ve Adres</SectionLabel>
          <div className='mt-1 divide-y divide-slate-100'>
            <InfoRow icon={Landmark} label='VKN / TCKN' value={customer.vkn} mono copyable />
            <InfoRow icon={Landmark} label='Vergi Dairesi' value={customer.vergi_dairesi} />
            <InfoRow
              icon={MapPin}
              label='Fatura Adresi'
              value={customer.fatura_merkez_adresi}
              copyable
            />
            <InfoRow icon={MapPin} label='İl / İlçe' value={location} />
            <InfoRow icon={CalendarDays} label='Oluşturulma Zamanı' value={customer.kayit_tarihi} />
          </div>
        </div>

        <div className='border-t border-slate-100 px-4 py-3.5'>
          <SectionLabel>Yetkili İletişim</SectionLabel>
          <div className='mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5'>
            <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200/80'>
              <UserRound className='size-4' />
            </span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-900'>
                {customer.ana_yetkili || 'Yetkili belirtilmemiş'}
              </p>
              <p className='mt-0.5 truncate text-xs text-slate-500'>
                {customer.ana_yetkili_unvan || 'Ünvan belirtilmemiş'}
              </p>
            </div>
          </div>
          <div className='mt-1 divide-y divide-slate-100'>
            <InfoRow icon={Phone} label='Telefon' value={customer.telefon} copyable />
            <InfoRow icon={Mail} label='E-posta' value={customer.email} copyable />
          </div>
        </div>
      </section>

      <section className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={ShieldCheck} title='Sistem Tercihleri' />
        <div className='divide-y divide-slate-100 px-4 py-2'>
          <PrefRow
            icon={Bell}
            label='SMS Bildirimi'
            description='Alıcıya durum SMS’i gönderilir'
            on={customer.bildirim_sms}
          />
          <PrefRow
            icon={Mail}
            label='E-posta Bildirimi'
            description='Alıcıya durum e-postası gönderilir'
            on={customer.bildirim_email}
          />
          <PrefRow
            icon={Camera}
            label='Teslimat Kanıtı'
            description='Teslimde fotoğraf / imza zorunlu'
            on={customer.teslimat_kaniti_zorunlu}
          />
          <PrefRow
            icon={KeyRound}
            label='Güvenli Teslimat Kodu'
            description='Teslimde OTP doğrulaması istenir'
            on={customer.guvenli_teslimat_otp}
          />
        </div>
        <div className='mt-auto border-t border-slate-100 bg-slate-50/60 px-4 py-3'>
          <p className='text-xs text-slate-400'>
            Son senkronizasyon
            <span className='ml-1.5 font-medium text-slate-600'>
              {customer.son_senkronizasyon || '—'}
            </span>
          </p>
        </div>
      </section>
    </div>
  )
}
