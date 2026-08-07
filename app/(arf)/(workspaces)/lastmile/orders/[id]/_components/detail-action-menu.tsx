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
  ChevronDown,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Pencil,
  Printer,
  Route,
  UserRoundCog,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import type { OrderDetail } from '../_types/order-detail'
import { isOrderAssigned } from '../_lib/order-detail-helpers'

type DetailActionMenuProps = {
  order: OrderDetail
  onCancel: () => void
  onHandover: () => void
  actionPending?: boolean
}

export function DetailActionMenu({
  order,
  onCancel,
  onHandover,
  actionPending = false,
}: DetailActionMenuProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const assigned = isOrderAssigned(order)
  const cancelled = order.durum === 'iptal_edildi'
  const canGoToRoute = assigned && Boolean(order.rota.rota_id)
  const canHandover = order.siparis_tipi === 'transfer' && !cancelled

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={actionPending}>
            <MoreHorizontal className="size-3.5" />
            İşlemler
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => toast.success('Paket etiketi yazdırma kuyruğa alındı')}>
            <Printer className="mr-2 size-3.5" />
            Paket Etiketi Yazdır
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success('Paket fişi hazırlanıyor')}>
            <FileText className="mr-2 size-3.5" />
            Paket Fişi Yazdır
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message('Düzenleme yakında')}>
            <Pencil className="mr-2 size-3.5" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toast.message('Müşteri takip sayfası yakında')}
          >
            <ExternalLink className="mr-2 size-3.5" />
            Takip Linki
          </DropdownMenuItem>
          {canGoToRoute ? (
            <DropdownMenuItem
              onClick={() =>
                router.push(ARF_ROUTES.lastmile.planning.routeDetail(order.rota.rota_id!))
              }
            >
              <Route className="mr-2 size-3.5" />
              Rotaya Git
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={cancelled}
              onClick={() => router.push(ARF_ROUTES.lastmile.planning.orchestrator)}
            >
              <Route className="mr-2 size-3.5" />
              Rotaya Ata
            </DropdownMenuItem>
          )}
          {canHandover ? (
            <DropdownMenuItem disabled={actionPending} onClick={() => setTransferOpen(true)}>
              <UserRoundCog className="mr-2 size-3.5" />
              Devret
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={cancelled || actionPending}
            className="text-rose-600 focus:text-rose-600"
            onClick={() => setCancelOpen(true)}
          >
            <Ban className="mr-2 size-3.5" />
            İptal Et
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Siparişi iptal et?</AlertDialogTitle>
            <AlertDialogDescription>
              {order.takip_no} iptal edilecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={actionPending}
              onClick={() => {
                onCancel()
                setCancelOpen(false)
              }}
            >
              İptal Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={transferOpen} onOpenChange={setTransferOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Siparişi devret</AlertDialogTitle>
            <AlertDialogDescription>
              Transfer siparişindeki paketler handover ile sonraki tarafa devredilecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionPending}
              onClick={() => {
                onHandover()
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
