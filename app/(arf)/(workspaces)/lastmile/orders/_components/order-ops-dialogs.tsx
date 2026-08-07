'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getDefinitionsState } from '../../settings/definitions/_mock/definitions-mock'
import { tomorrowIsoDate } from '../_lib/order-ops-policy'
import { formatCurrency } from '../../finance/_lib/format'
import type { ReasonKind } from '../../settings/definitions/_types/definitions'

type ReasonOption = { id: string; label: string }

function useReasons(kind: ReasonKind): ReasonOption[] {
  return useMemo(() => {
    try {
      return getDefinitionsState()
        .reasons.filter((r) => r.kind === kind && r.active)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((r) => ({ id: r.id, label: r.label }))
    } catch {
      return kind === 'cancel'
        ? [
            { id: 'r-5', label: 'Müşteri iptal etti' },
            { id: 'r-6', label: 'Stok yetersiz' },
          ]
        : [
            { id: 'r-1', label: 'Müşteri adreste bulunamadı' },
            { id: 'r-2', label: 'Adres yetersiz / yanlış' },
            { id: 'r-3', label: 'Alıcı kabul etmedi' },
          ]
    }
  }, [kind])
}

type CancelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'instant' | 'request'
  takipNo: string
  pending?: boolean
  onConfirm: (payload: {
    reasonCode: string
    reasonLabel: string
    note?: string
  }) => void
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  mode,
  takipNo,
  pending,
  onConfirm,
}: CancelDialogProps) {
  const reasons = useReasons('cancel')
  const [reasonCode, setReasonCode] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open && reasons[0] && !reasonCode) setReasonCode(reasons[0].id)
  }, [open, reasons, reasonCode])

  const reasonLabel = reasons.find((r) => r.id === reasonCode)?.label ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'instant' ? 'Siparişi iptal et' : 'İptal talebi oluştur'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <p className='text-sm text-slate-600'>
            <span className='font-mono font-medium'>{takipNo}</span>
            {mode === 'instant'
              ? ' anında iptal edilecek.'
              : ' için admin onayı gerektiren iptal talebi açılacak.'}
          </p>
          <div className='space-y-1.5'>
            <Label>İptal nedeni *</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue placeholder='Neden seçin' />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <Label>Not</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Opsiyonel açıklama'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type='button'
            className={
              mode === 'instant'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-lime-400 text-black hover:bg-lime-300'
            }
            disabled={pending || !reasonCode}
            onClick={() =>
              onConfirm({
                reasonCode,
                reasonLabel,
                note: note.trim() || undefined,
              })
            }
          >
            {pending ? 'İşleniyor…' : mode === 'instant' ? 'İptal Et' : 'Talep Gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ReturnDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  takipNo: string
  feePreview: number
  feePercent: number
  pending?: boolean
  onConfirm: (payload: { reasonLabel?: string; note?: string }) => void
}

export function ReturnOrderDialog({
  open,
  onOpenChange,
  takipNo,
  feePreview,
  feePercent,
  pending,
  onConfirm,
}: ReturnDialogProps) {
  const [reasonLabel, setReasonLabel] = useState('Müşteri iade talebi')
  const [note, setNote] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>İade siparişi oluştur</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <p className='text-sm text-slate-600'>
            <span className='font-mono font-medium'>{takipNo}</span> için ana siparişe bağlı
            iade alt-siparişi oluşturulacak.
          </p>
          <div className='rounded-xl border bg-slate-50 px-3 py-2 text-sm'>
            <p>
              İade ücreti (%{feePercent}):{' '}
              <strong>{formatCurrency(feePreview)}</strong>
            </p>
            <p className='text-xs text-slate-500'>Fiyat listesi iade kuralından hesaplanır.</p>
          </div>
          <div className='space-y-1.5'>
            <Label>İade nedeni</Label>
            <Input value={reasonLabel} onChange={(e) => setReasonLabel(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>Not</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type='button'
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={pending}
            onClick={() =>
              onConfirm({
                reasonLabel: reasonLabel.trim() || undefined,
                note: note.trim() || undefined,
              })
            }
          >
            {pending ? 'Oluşturuluyor…' : 'İade Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type DeferDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  takipNo: string
  pending?: boolean
  onConfirm: (payload: {
    reasonCode: string
    reasonLabel: string
    deferredToDate: string
    note?: string
  }) => void
}

export function DeferOrderDialog({
  open,
  onOpenChange,
  takipNo,
  pending,
  onConfirm,
}: DeferDialogProps) {
  const reasons = useReasons('undelivered')
  const [reasonCode, setReasonCode] = useState('')
  const [deferredToDate, setDeferredToDate] = useState(tomorrowIsoDate())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setDeferredToDate(tomorrowIsoDate())
      if (reasons[0] && !reasonCode) setReasonCode(reasons[0].id)
    }
  }, [open, reasons, reasonCode])

  const reasonLabel = reasons.find((r) => r.id === reasonCode)?.label ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Ertesi güne devret</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <p className='text-sm text-slate-600'>
            <span className='font-mono font-medium'>{takipNo}</span> teslim edilemedi; rota
            bağı koparılıp yeniden planlama için ertelenir. (Zimmet / kurye değişimi değildir.)
          </p>
          <div className='space-y-1.5'>
            <Label>Teslim edilememe nedeni *</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue placeholder='Neden seçin' />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <Label>Hedef tarih *</Label>
            <Input
              type='date'
              value={deferredToDate}
              onChange={(e) => setDeferredToDate(e.target.value)}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Not</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type='button'
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={pending || !reasonCode || !deferredToDate}
            onClick={() =>
              onConfirm({
                reasonCode,
                reasonLabel,
                deferredToDate,
                note: note.trim() || undefined,
              })
            }
          >
            {pending ? 'Kaydediliyor…' : 'Devret'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
