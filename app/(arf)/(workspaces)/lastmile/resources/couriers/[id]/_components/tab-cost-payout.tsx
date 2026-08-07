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
import { ARF_ROUTES } from '../../../../../../_shared/routes'
import {
  getCourierCostAssignment,
  getCourierPayoutSummary,
  getCourierPayoutTerms,
  listCourierCostLists,
  setCourierCostAssignment,
  setCourierPayoutTerms,
} from '../../../../finance/_api/courier-cost-api'
import { CourierCostQuoteSimulator } from '../../../../finance/_components/courier-cost-quote-simulator'
import { formatCurrency } from '../../../../finance/_lib/format'
import type {
  CourierCostList,
  CourierPayoutSummary,
  PayoutCycle,
} from '../../../../finance/_types'
import {
  PAYOUT_CYCLE_LABELS,
  WEEKDAY_LABELS,
} from '../../../../finance/_types'

type Props = {
  courierId: string
  courierName: string
  readOnly?: boolean
}

const NONE = '__none__'

export function TabCostPayout({ courierId, courierName, readOnly }: Props) {
  const [lists, setLists] = useState<CourierCostList[]>([])
  const [costListId, setCostListId] = useState<string>(NONE)
  const [payoutCycle, setPayoutCycle] = useState<PayoutCycle>('weekly')
  const [weeklyPayoutDay, setWeeklyPayoutDay] = useState('5')
  const [monthlyPayoutDay, setMonthlyPayoutDay] = useState('5')
  const [creditDays, setCreditDays] = useState('0')
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState<CourierPayoutSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [costLists, assignment, terms, finance] = await Promise.all([
        listCourierCostLists(),
        getCourierCostAssignment(courierId),
        getCourierPayoutTerms(courierId),
        getCourierPayoutSummary(courierId),
      ])
      setLists(costLists.filter((l) => l.status === 'active'))
      setCostListId(assignment?.costListId ?? NONE)
      if (terms) {
        setPayoutCycle(terms.payoutCycle)
        setWeeklyPayoutDay(String(terms.weeklyPayoutDay ?? 5))
        setMonthlyPayoutDay(String(terms.monthlyPayoutDay ?? 5))
        setCreditDays(String(terms.creditDays ?? 0))
        setNotes(terms.notes ?? '')
      } else {
        setPayoutCycle('weekly')
        setWeeklyPayoutDay('5')
        setMonthlyPayoutDay('5')
        setCreditDays('0')
        setNotes('')
      }
      setSummary(finance)
    } catch {
      toast.error('Ücret & ödeme bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [courierId])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (readOnly) return
    const weekly = Number(weeklyPayoutDay)
    const monthly = Number(monthlyPayoutDay)
    if (payoutCycle === 'weekly' && (weekly < 1 || weekly > 7)) {
      toast.error('Haftalık ödeme günü 1–7 arasında olmalı')
      return
    }
    if (payoutCycle === 'monthly_fixed_day' && (monthly < 1 || monthly > 28)) {
      toast.error('Ayın sabit günü 1–28 arasında olmalı')
      return
    }

    setSaving(true)
    try {
      await Promise.all([
        setCourierCostAssignment(courierId, costListId === NONE ? null : costListId),
        setCourierPayoutTerms(courierId, {
          payoutCycle,
          weeklyPayoutDay: payoutCycle === 'weekly' ? weekly : undefined,
          monthlyPayoutDay: payoutCycle === 'monthly_fixed_day' ? monthly : undefined,
          creditDays: Number(creditDays) || 0,
          notes: notes.trim() || undefined,
        }),
      ])
      toast.success(`${courierName} ücret & ödeme ayarları kaydedildi`)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kayıt başarısız')
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
            <CardTitle className='text-xs font-medium text-slate-500'>Açık hakediş</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {formatCurrency(summary?.openBalance ?? 0)}
          </CardContent>
        </Card>
        <Card className='shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-slate-500'>Toplam ödeme</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {formatCurrency(summary?.totalPaid ?? 0)}
          </CardContent>
        </Card>
        <Card className='shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-slate-500'>Geciken</CardTitle>
          </CardHeader>
          <CardContent className='text-xl font-semibold tabular-nums'>
            {summary?.overdueCount ?? 0}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-4 rounded-2xl border p-4'>
          <div>
            <h3 className='text-sm font-semibold'>Ücret listesi ataması</h3>
            <p className='text-xs text-slate-500'>
              Atanmazsa tenant varsayılan kurye ücret listesi kullanılır.
            </p>
          </div>
          <div className='space-y-1.5'>
            <Label>Ücret listesi</Label>
            <Select
              value={costListId}
              onValueChange={setCostListId}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder='Seçin' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Varsayılan liste</SelectItem>
                {lists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {summary?.assignedCostListName ? (
            <p className='text-xs text-slate-500'>
              Aktif: {summary.assignedCostListName}
            </p>
          ) : null}
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.lastmile.finance.courierCostLists.list}>
              Ücret listelerini yönet
            </Link>
          </Button>
        </div>

        <div className='space-y-4 rounded-2xl border p-4'>
          <div>
            <h3 className='text-sm font-semibold'>Ödeme vadesi</h3>
            <p className='text-xs text-slate-500'>
              Haftalık, aylık veya ayın sabit günü ile hakediş ödemesi.
            </p>
          </div>
          <div className='space-y-1.5'>
            <Label>Döngü</Label>
            <Select
              value={payoutCycle}
              onValueChange={(v) => setPayoutCycle(v as PayoutCycle)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYOUT_CYCLE_LABELS) as PayoutCycle[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {PAYOUT_CYCLE_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {payoutCycle === 'weekly' ? (
            <div className='space-y-1.5'>
              <Label>Haftanın günü</Label>
              <Select
                value={weeklyPayoutDay}
                onValueChange={setWeeklyPayoutDay}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {WEEKDAY_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {payoutCycle === 'monthly_fixed_day' ? (
            <div className='space-y-1.5'>
              <Label>Ayın günü (1–28)</Label>
              <Input
                type='number'
                min={1}
                max={28}
                value={monthlyPayoutDay}
                onChange={(e) => setMonthlyPayoutDay(e.target.value)}
                disabled={readOnly}
              />
            </div>
          ) : null}
          <div className='space-y-1.5'>
            <Label>Vade günü</Label>
            <Input
              type='number'
              min={0}
              value={creditDays}
              onChange={(e) => setCreditDays(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Not</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {!readOnly ? (
        <div className='flex flex-wrap gap-2'>
          <Button
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
          <Button variant='outline' asChild>
            <Link href={ARF_ROUTES.lastmile.finance.courierPayouts.courier(courierId)}>
              Hakedişlere git
            </Link>
          </Button>
        </div>
      ) : null}

      <CourierCostQuoteSimulator courierId={courierId} />
    </div>
  )
}
