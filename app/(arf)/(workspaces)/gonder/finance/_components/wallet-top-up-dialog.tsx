'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WalletTopUpForm } from './wallet-top-up-form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletTopUpDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Cüzdana bakiye yükle</DialogTitle>
          <DialogDescription>
            Kart veya havale ile işletme cüzdanına demo yükleme yapın.
          </DialogDescription>
        </DialogHeader>
        <WalletTopUpForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
