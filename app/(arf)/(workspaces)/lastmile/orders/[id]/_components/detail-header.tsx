'use client'

import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarClock, Copy, Package, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrderStatusBadge } from '../../_components/order-status-badge'
import { OrderTypeBadge } from '../../_components/order-type-badge'
import { MetaChip } from '../../_components/meta-chip'
import { RouteTypeBadge } from '../../_components/route-type-badge'
import type { OrderDetail } from '../_types/order-detail'
import { copyToClipboard } from '../_lib/order-detail-helpers'
import { DetailActionMenu } from './detail-action-menu'

type DetailHeaderProps = {
  order: OrderDetail
  onCancel: () => void
  onHandover: () => void
  actionPending?: boolean
}

const statusAccent: Record<OrderDetail['durum'], { line: string; glow: string }> = {
  atama_bekliyor: {
    line: 'via-slate-400/70',
    glow: 'bg-slate-100/80',
  },
  planlandi: {
    line: 'via-violet-400/70',
    glow: 'bg-violet-50/80',
  },
  yolda: {
    line: 'via-sky-400/70',
    glow: 'bg-sky-50/80',
  },
  teslim_edildi: {
    line: 'via-emerald-400/70',
    glow: 'bg-emerald-50/80',
  },
  iptal_edildi: {
    line: 'via-rose-400/70',
    glow: 'bg-rose-50/80',
  },
}

export function DetailHeader({
  order,
  onCancel,
  onHandover,
  actionPending = false,
}: DetailHeaderProps) {
  const accent = statusAccent[order.durum]

  const handleCopy = async () => {
    const ok = await copyToClipboard(order.takip_no)
    if (ok) toast.success(`${order.takip_no} kopyalandı`)
    else toast.error('Kopyalanamadı')
  }

  return (
    <Card className="relative overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_rgba(15,23,42,0.05)]">
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent',
          accent.line
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl',
          accent.glow
        )}
      />
      <CardContent className="relative p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold tracking-tight text-slate-500">
              Sipariş Detayı
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="group inline-flex max-w-full items-center gap-2 rounded-lg text-left transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
            >
              <h1 className="truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]">
                {order.takip_no}
              </h1>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors group-hover:border-sky-200 group-hover:text-sky-600">
                <Copy className="size-3.5" />
              </span>
            </button>
            <p className="mt-1 text-xs text-slate-500">
              Referans{' '}
              <span className="ml-1 font-semibold text-slate-700">{order.referans_no}</span>
            </p>
          </div>

          <DetailActionMenu
            order={order}
            onCancel={onCancel}
            onHandover={onHandover}
            actionPending={actionPending}
          />
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
            <BadgeGroup label="Durum">
              <OrderStatusBadge
                status={order.durum}
                label={order.durum_etiketi}
              />
            </BadgeGroup>

            <GroupDivider />

            <BadgeGroup label="Sipariş Tipi">
              <OrderTypeBadge type={order.siparis_tipi} />
            </BadgeGroup>

            <GroupDivider />

            <BadgeGroup label="Rota Tipi">
              <RouteTypeBadge type={order.rota_tipi} />
            </BadgeGroup>

            {order.etiketler.length > 0 ? (
              <>
                <GroupDivider />
                <BadgeGroup label="Etiketler">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {order.etiketler.map((tag) => (
                      <MetaChip key={tag} variant="tag">
                        {tag}
                      </MetaChip>
                    ))}
                  </div>
                </BadgeGroup>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5 text-slate-400" />
              <strong className="font-semibold text-slate-700">{order.paket_sayisi}</strong> paket
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-slate-400" />
              {order.olusturulma_zamani}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5 text-slate-400" />
              {order.olusturan}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BadgeGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      {children}
    </div>
  )
}

function GroupDivider() {
  return <div className="hidden h-10 w-px self-center bg-slate-200 sm:block" aria-hidden />
}
