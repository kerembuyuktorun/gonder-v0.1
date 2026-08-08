'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  getCustomerFinanceSummary,
  getCustomerPaymentTerms,
  getCustomerPricingAssignment,
  listPriceLists,
  setCustomerPaymentTerms,
  setCustomerPricingAssignment,
} from '../../../finance/_api/pricing-api'
import { PriceQuoteSimulator } from '../../../finance/_components/price-quote-simulator'
import { formatCurrency } from '../../../finance/_lib/format'
import type {
  BillingCycle,
  CustomerFinanceSummary,
  PriceList,
  SettlementType,
} from '../../../finance/_types'
import { SETTLEMENT_TYPE_LABELS } from '../../../finance/_types'

type Props = {
  customerId: string
  customerName: string
}

const NONE = '__none__'

export function TabPricingPayment({ customerId, customerName }: Props) {
  const [lists, setLists] = useState<PriceList[]>([])
  const [priceListId, setPriceListId] = useState<string>(NONE)
  const [settlementType, setSettlementType] = useState<SettlementType>('pesin')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('per_order')
  const [creditDays, setCreditDays] = useState('0')
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState<CustomerFinanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [priceLists, assignment, terms, finance] = await Promise.all([
        listPriceLists(),
        getCustomerPricingAssignment(customerId),
        getCustomerPaymentTerms(customerId),
        getCustomerFinanceSummary(customerId),
      ])
      setLists(priceLists.filter((l) => l.status === 'active'))
      setPriceListId(assignment?.priceListId ?? NONE)
      if (terms) {
        setSettlementType(terms.settlementType)
        setBillingCycle(terms.billingCycle ?? 'per_order')
        setCreditDays(String(terms.creditDays))
        setNotes(terms.notes ?? '')
      } else {
        setSettlementType('pesin')
        setBillingCycle('per_order')
        setCreditDays('0')
        setNotes('')
      }
      setSummary(finance)
    } catch {
      toast.error('Fiyat & ödeme bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      await Promise.all([
        setCustomerPricingAssignment(customerId, priceListId === NONE ? null : priceListId),
        setCustomerPaymentTerms(customerId, {
          settlementType,
          billingCycle,
          creditDays: Number(creditDays) || 0,
          notes: notes.trim() || undefined,
        }),
      ])
      toast.success(`${customerName} fiyat & ödeme ayarları kaydedildi`)
      void load()
    } catch {
      toast.error('Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className='py-8 text-sm text-slate-500'>Yükleniyor…</p>
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-slate-500'>Açık bakiye</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {formatCurrency(summary?.openBalance ?? 0)}
          </CardContent>
        </Card>
        <Card className='shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-slate-500'>Toplam tahsilat</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {formatCurrency(summary?.totalCollected ?? 0)}
          </CardContent>
        </Card>
        <Card className='shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-slate-500'>Geciken sipariş</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {summary?.overdueOrderCount ?? 0}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-4 rounded-2xl border p-4'>
          <div>
            <h3 className='text-sm font-semibold'>Fiyat listesi ataması</h3>
            <p className='text-xs text-slate-500'>
              Atanmazsa tenant varsayılan listesi kullanılır.
            </p>
          </div>
          <div className='space-y-1.5'>
            <Label>Fiyat listesi</Label>
            <Select value={priceListId} onValueChange={setPriceListId}>
              <SelectTrigger>
                <SelectValue placeholder='Seçin' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Varsayılan listeyi kullan</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                    {list.isDefault ? ' (varsayılan)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {priceListId !== NONE ? (
            <Button variant='link' className='h-auto p-0 text-sm' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.priceLists.detail(priceListId)}>
                Liste detayına git
              </Link>
            </Button>
          ) : null}
        </div>

        <div className='space-y-4 rounded-2xl border p-4'>
          <div>
            <h3 className='text-sm font-semibold'>Ödeme koşulları</h3>
            <p className='text-xs text-slate-500'>Peşin veya vadeli çalışma ayarı.</p>
          </div>
          <div className='space-y-1.5'>
            <Label>Çalışma şekli</Label>
            <Select
              value={settlementType}
              onValueChange={(v) => {
                const next = v as SettlementType
                setSettlementType(next)
                if (next === 'pesin') setCreditDays('0')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SETTLEMENT_TYPE_LABELS) as SettlementType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SETTLEMENT_TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {settlementType === 'vadeli' ? (
            <div className='space-y-1.5'>
              <Label>Vade günü</Label>
              <Input
                type='number'
                min={0}
                value={creditDays}
                onChange={(e) => setCreditDays(e.target.value)}
              />
            </div>
          ) : null}
          <div className='space-y-1.5'>
            <Label>Not</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button variant='outline' asChild>
          <Link href={ARF_ROUTES.lastmile.finance.collections.customer(customerId)}>
            Tahsilatları gör
          </Link>
        </Button>
        <Button
          className='bg-lime-400 text-black hover:bg-lime-300'
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>

      <PriceQuoteSimulator
        customerId={customerId}
        priceListId={priceListId === NONE ? undefined : priceListId}
      />
    </div>
  )
}
