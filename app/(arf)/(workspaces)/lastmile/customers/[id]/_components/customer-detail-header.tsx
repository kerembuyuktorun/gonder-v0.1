'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Package,
  PackagePlus,
  PauseCircle,
  Pencil,
  PlayCircle,
  Timer,
  TrendingUp,
  Warehouse,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { CustomerStatusBadge } from '../../_components/customer-status-badge'
import {
  formatCount,
  formatSuccessRate,
} from '../../_lib/query-customers'
import type { CustomerDetail } from '../_types/customer-detail'

type Props = {
  customer: CustomerDetail
  onEdit: () => void
  onToggleStatus: () => void
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export function CustomerDetailHeader({ customer, onEdit, onToggleStatus }: Props) {
  const [showStats, setShowStats] = useState(false)
  const initials = customer.marka_kisa_ad
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const handleCopyCode = async () => {
    const ok = await copyText(customer.musteri_kodu)
    if (ok) toast.success(`${customer.musteri_kodu} kopyalandı`)
    else toast.error('Kopyalanamadı')
  }

  const isActive = customer.durum === 'aktif'

  return (
    <Card className='rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_rgba(15,23,42,0.05)]'>
      <CardContent className='p-5 lg:p-6'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex min-w-0 items-start gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold tracking-tight text-white shadow-sm'>
              {initials || <Building2 className='size-6' />}
            </div>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='truncate text-2xl font-bold tracking-tight text-slate-950'>
                  {customer.marka_kisa_ad}
                </h1>
                <CustomerStatusBadge status={customer.durum} />
              </div>
              <p className='mt-1 text-sm font-medium text-slate-500'>{customer.firma_unvani}</p>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center gap-1.5 text-sm text-slate-500'>
                  Müşteri ID:
                  <span className='font-mono text-xs font-semibold text-slate-700'>
                    {customer.musteri_kodu}
                  </span>
                  <button
                    type='button'
                    onClick={handleCopyCode}
                    className='rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
                    aria-label='Müşteri ID kopyala'
                  >
                    <Copy className='size-3.5' />
                  </button>
                </span>
                <Badge
                  variant='outline'
                  className='rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600'
                >
                  {customer.sektor}
                </Badge>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2 lg:justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='sm' type='button' className='gap-2'>
                  İşlemler
                  <ChevronDown className='size-4 opacity-70' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-52'>
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil className='mr-2 size-4' />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={onToggleStatus}
                  className={
                    isActive
                      ? 'text-amber-700 focus:bg-amber-50 focus:text-amber-800'
                      : 'text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800'
                  }
                >
                  {isActive ? (
                    <>
                      <PauseCircle className='mr-2 size-4' />
                      Pasife Al
                    </>
                  ) : (
                    <>
                      <PlayCircle className='mr-2 size-4' />
                      Aktifleştir
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='relative mt-5'>
          <div className='border-t border-slate-200/90' />
          <button
            type='button'
            aria-label={showStats ? 'Metrikleri gizle' : 'Metrikleri göster'}
            aria-expanded={showStats}
            onClick={() => setShowStats((previous) => !previous)}
            className='absolute left-1/2 top-0 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40'
          >
            {showStats ? (
              <ChevronUp className='size-4 stroke-[2.25]' />
            ) : (
              <ChevronDown className='size-4 stroke-[2.25]' />
            )}
          </button>
          {showStats ? (
            <div className='grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4'>
              <HeaderStat
                icon={PackagePlus}
                label='Bugünkü Aktif Sipariş'
                value={formatCount(customer.bugunku_aktif_siparis)}
              />
              <HeaderStat
                icon={TrendingUp}
                label='Ort. Günlük Hacim'
                value={formatCount(customer.gunluk_ortalama_hacim)}
              />
              <HeaderStat
                icon={Timer}
                label='Ort. Görev Süresi'
                value={`${formatCount(customer.ortalama_gorev_suresi_dk)} dk`}
              />
              <HeaderStat
                icon={Activity}
                label='Ort. % SLA'
                value={formatSuccessRate(customer.teslimat_basari_orani)}
              />
              <HeaderStat
                icon={Warehouse}
                label='Toplam Tesis'
                value={formatCount(customer.tesis_sayisi)}
              />
              <HeaderStat
                icon={Package}
                label='Toplam Sipariş'
                value={formatCount(customer.toplam_paket)}
              />
              <HeaderStat
                icon={CheckCircle2}
                label='Toplam Teslim'
                value={formatCount(customer.toplam_teslim)}
              />
              <HeaderStat
                icon={XCircle}
                label='Toplam İptal'
                value={formatCount(customer.toplam_iptal)}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function HeaderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className='flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2.5'>
      <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/70'>
        <Icon className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
          {label}
        </p>
        <p className='mt-0.5 truncate text-sm font-semibold tracking-tight text-slate-900'>
          {value}
        </p>
      </div>
    </div>
  )
}
