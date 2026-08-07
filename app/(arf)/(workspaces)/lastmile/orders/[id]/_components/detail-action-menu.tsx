'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Ban,
  CalendarClock,
  ChevronDown,
  ExternalLink,
  FileText,
  MoreHorizontal,
  PackageMinus,
  Pencil,
  Printer,
  Route,
  UserRoundCog,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import type { OrderDetail } from '../_types/order-detail'
import { isOrderAssigned } from '../_lib/order-detail-helpers'
import {
  canCreateReturn,
  canDefer,
  canInstantCancel,
  canRequestCancel,
} from '../../_lib/order-ops-policy'
import {
  CancelOrderDialog,
  DeferOrderDialog,
  ReturnOrderDialog,
} from '../../_components/order-ops-dialogs'

type DetailActionMenuProps = {
  order: OrderDetail
  actionPending?: boolean
  hasPendingCancelRequest?: boolean
  returnFeePreview?: number
  returnFeePercent?: number
  onInstantCancel: (payload: {
    reasonCode: string
    reasonLabel: string
    note?: string
  }) => void
  onCancelRequest: (payload: {
    reasonCode: string
    reasonLabel: string
    note?: string
  }) => void
  onCreateReturn: (payload: { reasonLabel?: string; note?: string }) => void
  onDefer: (payload: {
    reasonCode: string
    reasonLabel: string
    deferredToDate: string
    note?: string
  }) => void
  onTransferHandover: () => void
}

export function DetailActionMenu({
  order,
  actionPending = false,
  hasPendingCancelRequest = false,
  returnFeePreview = 0,
  returnFeePercent = 50,
  onInstantCancel,
  onCancelRequest,
  onCreateReturn,
  onDefer,
  onTransferHandover,
}: DetailActionMenuProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [deferOpen, setDeferOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const assigned = isOrderAssigned(order)
  const cancelled = order.durum === 'iptal_edildi'
  const routeAssigned = Boolean(order.rota.rota_id) || order.rota_atandi
  const canGoToRoute = assigned && Boolean(order.rota.rota_id)
  const canTransferHandover = order.siparis_tipi === 'transfer' && !cancelled
  const instant = canInstantCancel(order.durum, routeAssigned)
  const request = canRequestCancel(order.durum)
  const showCancel = !cancelled && (instant || request)
  const showReturn = canCreateReturn(order.durum, order.siparis_tipi)
  const showDefer = canDefer(order.durum) && !cancelled

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='gap-1.5' disabled={actionPending}>
            <MoreHorizontal className='size-3.5' />
            İşlemler
            <ChevronDown className='size-3.5 opacity-60' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuItem onClick={() => toast.success('Paket etiketi yazdırma kuyruğa alındı')}>
            <Printer className='mr-2 size-3.5' />
            Paket Etiketi Yazdır
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success('Paket fişi hazırlanıyor')}>
            <FileText className='mr-2 size-3.5' />
            Paket Fişi Yazdır
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message('Düzenleme yakında')}>
            <Pencil className='mr-2 size-3.5' />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message('Müşteri takip sayfası yakında')}>
            <ExternalLink className='mr-2 size-3.5' />
            Takip Linki
          </DropdownMenuItem>
          {canGoToRoute ? (
            <DropdownMenuItem
              onClick={() =>
                router.push(ARF_ROUTES.lastmile.planning.routeDetail(order.rota.rota_id!))
              }
            >
              <Route className='mr-2 size-3.5' />
              Rotaya Git
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={cancelled}
              onClick={() => router.push(ARF_ROUTES.lastmile.planning.orchestrator)}
            >
              <Route className='mr-2 size-3.5' />
              Rotaya Ata
            </DropdownMenuItem>
          )}

          {showDefer ? (
            <DropdownMenuItem disabled={actionPending} onClick={() => setDeferOpen(true)}>
              <CalendarClock className='mr-2 size-3.5' />
              Ertesi Güne Devret
            </DropdownMenuItem>
          ) : null}

          {showReturn ? (
            <DropdownMenuItem disabled={actionPending} onClick={() => setReturnOpen(true)}>
              <PackageMinus className='mr-2 size-3.5' />
              İade Oluştur
            </DropdownMenuItem>
          ) : null}

          {canTransferHandover ? (
            <DropdownMenuItem disabled={actionPending} onClick={() => setTransferOpen(true)}>
              <UserRoundCog className='mr-2 size-3.5' />
              Transfer Zimmeti
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />
          {hasPendingCancelRequest ? (
            <DropdownMenuItem disabled className='text-amber-700'>
              <Ban className='mr-2 size-3.5' />
              İptal talebi beklemede
            </DropdownMenuItem>
          ) : showCancel ? (
            <DropdownMenuItem
              disabled={actionPending}
              className='text-rose-600 focus:text-rose-600'
              onClick={() => setCancelOpen(true)}
            >
              <Ban className='mr-2 size-3.5' />
              {instant ? 'İptal Et' : 'İptal Talebi'}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelOrderDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        mode={instant ? 'instant' : 'request'}
        takipNo={order.takip_no}
        pending={actionPending}
        onConfirm={(payload) => {
          if (instant) onInstantCancel(payload)
          else onCancelRequest(payload)
          setCancelOpen(false)
        }}
      />

      <ReturnOrderDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        takipNo={order.takip_no}
        feePreview={returnFeePreview}
        feePercent={returnFeePercent}
        pending={actionPending}
        onConfirm={(payload) => {
          onCreateReturn(payload)
          setReturnOpen(false)
        }}
      />

      <DeferOrderDialog
        open={deferOpen}
        onOpenChange={setDeferOpen}
        takipNo={order.takip_no}
        pending={actionPending}
        onConfirm={(payload) => {
          onDefer(payload)
          setDeferOpen(false)
        }}
      />

      <AlertDialog open={transferOpen} onOpenChange={setTransferOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer zimmeti</AlertDialogTitle>
            <AlertDialogDescription>
              Transfer siparişindeki paketler handover ile sonraki tarafa zimmetlenecek. Bu,
              ertesi güne kargo devri değildir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionPending}
              onClick={() => {
                onTransferHandover()
                setTransferOpen(false)
              }}
            >
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
