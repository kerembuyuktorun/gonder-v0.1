'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { usePayUpcoming } from '../../_hooks/use-finance'
import { useWalletBalance } from '../../_hooks/use-wallet'
import {
  FINANCE_SETTLEMENT_LABELS,
  formatMoney,
  type FinanceSettlementChannel,
  type UpcomingPayment,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'

type Props = {
  payment: UpcomingPayment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinancePayDialog({ payment, open, onOpenChange }: Props) {
  const pay = usePayUpcoming()
  const wallet = useWalletBalance()
  const remaining = payment
    ? Math.max(0, payment.amount.amount - payment.paidAmount.amount)
    : 0
  const walletBalance = wallet.data ?? 0
  const canWallet = walletBalance >= remaining && remaining > 0

  async function handlePay(channel: FinanceSettlementChannel) {
    if (!payment) return
    try {
      await pay.mutateAsync({ id: payment.id, channel })
      toast.success(
        channel === 'wallet'
          ? 'Fatura cüzdandan ödendi'
          : 'Fatura cari hesapta ödendi olarak işaretlendi'
      )
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ödeme alınamadı')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Fatura ödemesi</DialogTitle>
          <DialogDescription>
            {payment
              ? `${payment.invoiceNumber ?? 'Fatura'} için ${formatMoney(payment.amount)} tahsilatı.`
              : 'Ödenecek fatura seçin.'}
          </DialogDescription>
        </DialogHeader>

        {payment ? (
          <div className='space-y-3 text-sm'>
            <p className='text-muted-foreground'>{payment.narrative}</p>
            <FinanceEntityLinks
              order={payment.order}
              shipment={payment.shipment}
              invoice={payment.invoice}
            />
            <div className='rounded-lg border bg-muted/20 px-3 py-2 text-xs'>
              <p>
                Cari kanal:{' '}
                <span className='font-medium'>
                  {payment.settlement
                    ? FINANCE_SETTLEMENT_LABELS[payment.settlement]
                    : 'Belirtilmedi'}
                </span>
              </p>
              <p className='mt-1 tabular-nums'>
                Cüzdan bakiyesi: {formatMoney({ amount: walletBalance, currency: 'TRY' })}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className='flex-col gap-2 sm:flex-col'>
          <Button
            type='button'
            disabled={!payment || pay.isPending || !canWallet}
            onClick={() => handlePay('wallet')}
          >
            {pay.isPending ? <Spinner className='size-4' /> : null}
            Cüzdandan öde
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={!payment || pay.isPending}
            onClick={() => handlePay('cari')}
          >
            Cari hesapta ödendi işaretle
          </Button>
          {!canWallet && remaining > 0 ? (
            <p className='text-[11px] text-muted-foreground'>
              Cüzdan bakiyesi bu fatura için yetersiz. Önce bakiye yükleyin veya cari olarak işaretleyin.
            </p>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
