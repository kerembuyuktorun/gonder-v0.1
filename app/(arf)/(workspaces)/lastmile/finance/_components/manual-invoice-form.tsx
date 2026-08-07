'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
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
import type { LastmileCustomer } from '../../customers/_types/customer'
import { formatTry } from '../_lib/invoice-from-orders'
import { computeInvoiceTotals } from '../_mock/invoice-store'

type DraftLine = {
  key: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

type Props = {
  customers: LastmileCustomer[]
  initialCustomerId?: string
  submitting?: boolean
  onSubmit: (payload: {
    customerId: string
    customerName: string
    issueDate: string
    dueDate: string
    lines: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxRate: number
    }>
    notes?: string | null
  }) => Promise<void> | void
  onCancel: () => void
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function plusDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

function newLine(): DraftLine {
  return {
    key: `line_${Math.random().toString(36).slice(2, 8)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 20,
  }
}

export function ManualInvoiceForm({
  customers,
  initialCustomerId,
  submitting,
  onSubmit,
  onCancel,
}: Props) {
  const [customerId, setCustomerId] = useState(initialCustomerId ?? '')
  const [issueDate, setIssueDate] = useState(todayIso())
  const [dueDate, setDueDate] = useState(plusDays(14))
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([newLine()])

  const customer = customers.find((c) => c.id === customerId)
  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        lines.map((line) => ({
          id: line.key,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
        })),
      ),
    [lines],
  )

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const handleSubmit = async () => {
    if (!customer) return
    const validLines = lines.filter((line) => line.description.trim())
    if (validLines.length === 0) return
    await onSubmit({
      customerId: customer.id,
      customerName: customer.marka_kisa_ad || customer.firma_unvani,
      issueDate,
      dueDate,
      notes: notes.trim() || null,
      lines: validLines.map((line) => ({
        description: line.description.trim(),
        quantity: Math.max(0, line.quantity),
        unitPrice: Math.max(0, line.unitPrice),
        taxRate: Math.max(0, line.taxRate),
      })),
    })
  }

  return (
    <div className='space-y-6 rounded-lg border bg-white p-4'>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Müşteri</Label>
          <Select value={customerId || undefined} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder='Müşteri seçin' />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.marka_kisa_ad || c.firma_unvani}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Not</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Opsiyonel fatura notu'
            rows={2}
          />
        </div>
        <div className='space-y-2'>
          <Label>Fatura tarihi</Label>
          <Input type='date' value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>
        <div className='space-y-2'>
          <Label>Vade tarihi</Label>
          <Input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold'>Satırlar</h3>
          <Button type='button' variant='outline' size='sm' onClick={() => setLines((p) => [...p, newLine()])}>
            <Plus className='mr-1.5 size-3.5' />
            Satır ekle
          </Button>
        </div>
        <div className='space-y-2'>
          {lines.map((line) => (
            <div key={line.key} className='grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_90px_120px_90px_40px]'>
              <Input
                placeholder='Açıklama'
                value={line.description}
                onChange={(e) => updateLine(line.key, { description: e.target.value })}
              />
              <Input
                type='number'
                min={0}
                step={1}
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) || 0 })}
              />
              <Input
                type='number'
                min={0}
                step={0.01}
                value={line.unitPrice}
                onChange={(e) => updateLine(line.key, { unitPrice: Number(e.target.value) || 0 })}
              />
              <Input
                type='number'
                min={0}
                step={1}
                value={line.taxRate}
                onChange={(e) => updateLine(line.key, { taxRate: Number(e.target.value) || 0 })}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-9 w-9'
                disabled={lines.length <= 1}
                onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
              >
                <Minus className='size-4' />
              </Button>
            </div>
          ))}
        </div>
        <p className='text-xs text-slate-500'>Kolonlar: açıklama, miktar, birim fiyat, KDV %</p>
      </div>

      <div className='flex flex-wrap items-end justify-between gap-4 border-t pt-4'>
        <div className='space-y-1 text-sm'>
          <div className='flex gap-6'>
            <span className='text-slate-500'>Ara toplam</span>
            <span className='font-medium'>{formatTry(totals.subtotal)}</span>
          </div>
          <div className='flex gap-6'>
            <span className='text-slate-500'>KDV</span>
            <span className='font-medium'>{formatTry(totals.kdv)}</span>
          </div>
          <div className='flex gap-6 text-base'>
            <span className='font-semibold'>Toplam</span>
            <span className='font-semibold'>{formatTry(totals.total)}</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={submitting}>
            Vazgeç
          </Button>
          <Button
            type='button'
            onClick={() => void handleSubmit()}
            disabled={submitting || !customerId || lines.every((l) => !l.description.trim())}
          >
            Faturayı kaydet
          </Button>
        </div>
      </div>
    </div>
  )
}
