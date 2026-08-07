'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import {
  getCourierCostList,
  listCourierCostAssignments,
  updateCourierCostList,
} from '../../_api/courier-cost-api'
import { listPriceZones } from '../../_api/pricing-api'
import { CourierCostQuoteSimulator } from '../../_components/courier-cost-quote-simulator'
import { CourierCostRulesEditor } from '../../_components/courier-cost-rules-editor'
import { formatCurrency } from '../../_lib/format'
import type { CompensationModel, CourierCostList, PriceZone } from '../../_types'
import {
  COMPENSATION_MODEL_LABELS,
  COURIER_COST_MODE_LABELS,
} from '../../_types'

export default function CourierCostListDetailPageContent() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [list, setList] = useState<CourierCostList | null>(null)
  const [zones, setZones] = useState<PriceZone[]>([])
  const [assignedCount, setAssignedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('overview')

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [compensationModel, setCompensationModel] = useState<CompensationModel>('tariff')
  const [fixedSalaryMonthly, setFixedSalaryMonthly] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [rules, setRules] = useState<CourierCostList['rules']>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [detail, zoneRows, assignments] = await Promise.all([
        getCourierCostList(id),
        listPriceZones(),
        listCourierCostAssignments(),
      ])
      if (!detail) {
        toast.error('Ücret listesi bulunamadı')
        router.push(ARF_ROUTES.lastmile.finance.courierCostLists.list)
        return
      }
      setList(detail)
      setZones(zoneRows)
      setAssignedCount(assignments.filter((a) => a.costListId === id).length)
      setCode(detail.code)
      setName(detail.name)
      setDescription(detail.description ?? '')
      setIsDefault(detail.isDefault)
      setCompensationModel(detail.compensationModel)
      setFixedSalaryMonthly(
        detail.fixedSalaryMonthly != null ? String(detail.fixedSalaryMonthly) : ''
      )
      setValidFrom(detail.validFrom ?? '')
      setValidTo(detail.validTo ?? '')
      setRules(detail.rules)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await updateCourierCostList(id, {
        code,
        name,
        description,
        isDefault,
        compensationModel,
        fixedSalaryMonthly:
          compensationModel === 'tariff'
            ? undefined
            : fixedSalaryMonthly === ''
              ? undefined
              : Number(fixedSalaryMonthly),
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
        status: list?.status ?? 'active',
        rules,
      })
      if (updated) {
        setList(updated)
        toast.success('Değişiklikler kaydedildi')
      }
    } catch {
      toast.error('Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !list) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            {
              label: 'Kurye Ücret Listeleri',
              href: ARF_ROUTES.lastmile.finance.courierCostLists.list,
            },
            { label: '…' },
          ]}
        />
        <div className='p-6 text-sm text-slate-500'>Yükleniyor…</div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          {
            label: 'Kurye Ücret Listeleri',
            href: ARF_ROUTES.lastmile.finance.courierCostLists.list,
          },
          { label: list.name },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight'>{list.name}</h1>
              {list.isDefault ? (
                <Badge className='bg-lime-100 text-lime-900 hover:bg-lime-100'>Varsayılan</Badge>
              ) : null}
              <Badge variant={list.status === 'active' ? 'default' : 'secondary'}>
                {list.status === 'active' ? 'Aktif' : 'Pasif'}
              </Badge>
              <Badge variant='outline'>
                {COMPENSATION_MODEL_LABELS[list.compensationModel]}
              </Badge>
            </div>
            <p className='mt-1 font-mono text-xs text-slate-500'>{list.code}</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.courierCostLists.list}>Listeye dön</Link>
            </Button>
            <Button
              className='bg-lime-400 text-black hover:bg-lime-300'
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </div>

        <Card className='rounded-[24px] border-slate-200/80 shadow-none'>
          <CardContent className='p-4 lg:p-5'>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value='overview'>Özet</TabsTrigger>
                <TabsTrigger value='rules'>Kurallar</TabsTrigger>
                <TabsTrigger value='assignments'>Atanan Kuryeler</TabsTrigger>
                <TabsTrigger value='sim'>Simülasyon</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='mt-4 space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <Label>Kod</Label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Ad</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className='space-y-1.5 sm:col-span-2'>
                    <Label>Açıklama</Label>
                    <Textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Ücret modeli</Label>
                    <Select
                      value={compensationModel}
                      onValueChange={(v) => setCompensationModel(v as CompensationModel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(COMPENSATION_MODEL_LABELS) as CompensationModel[]).map(
                          (m) => (
                            <SelectItem key={m} value={m}>
                              {COMPENSATION_MODEL_LABELS[m]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {compensationModel !== 'tariff' ? (
                    <div className='space-y-1.5'>
                      <Label>Aylık sabit maaş (₺)</Label>
                      <Input
                        type='number'
                        value={fixedSalaryMonthly}
                        onChange={(e) => setFixedSalaryMonthly(e.target.value)}
                      />
                    </div>
                  ) : null}
                  <div className='space-y-1.5'>
                    <Label>Geçerlilik başlangıç</Label>
                    <Input
                      type='date'
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Geçerlilik bitiş</Label>
                    <Input
                      type='date'
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                    />
                  </div>
                  <div className='flex items-center gap-2 sm:col-span-2'>
                    <Switch
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                      id='detail-default-cc'
                    />
                    <Label htmlFor='detail-default-cc'>Varsayılan liste</Label>
                  </div>
                </div>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <Card className='shadow-none'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-xs font-medium text-slate-500'>Kurallar</CardTitle>
                    </CardHeader>
                    <CardContent className='text-2xl font-semibold'>{rules.length}</CardContent>
                  </Card>
                  <Card className='shadow-none'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-xs font-medium text-slate-500'>
                        Atanan kurye
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='text-2xl font-semibold'>{assignedCount}</CardContent>
                  </Card>
                  <Card className='shadow-none'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-xs font-medium text-slate-500'>
                        Aylık maaş
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='text-2xl font-semibold'>
                      {list.fixedSalaryMonthly != null
                        ? formatCurrency(list.fixedSalaryMonthly)
                        : '—'}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='rules' className='mt-4'>
                <CourierCostRulesEditor
                  rules={rules}
                  zones={zones}
                  costListId={list.id}
                  onChange={setRules}
                />
                <div className='mt-3 overflow-x-auto rounded-xl border'>
                  <table className='w-full min-w-[640px] text-left text-sm'>
                    <thead className='border-b bg-slate-50 text-xs text-slate-500'>
                      <tr>
                        <th className='px-3 py-2'>Ad</th>
                        <th className='px-3 py-2'>Mod</th>
                        <th className='px-3 py-2'>Öncelik</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {[...rules]
                        .sort((a, b) => b.priority - a.priority)
                        .map((r) => (
                          <tr key={r.id}>
                            <td className='px-3 py-2'>{r.name || '—'}</td>
                            <td className='px-3 py-2'>
                              {COURIER_COST_MODE_LABELS[r.pricingMode]}
                            </td>
                            <td className='px-3 py-2'>{r.priority}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value='assignments' className='mt-4'>
                <p className='text-sm text-slate-600'>
                  Bu listeye atanan kurye sayısı: <strong>{assignedCount}</strong>
                </p>
                <p className='mt-2 text-sm text-slate-500'>
                  Atama işlemi kurye detayındaki <em>Ücret & Ödeme</em> sekmesinden yapılır.
                </p>
                <Button variant='outline' className='mt-4' asChild>
                  <Link href={ARF_ROUTES.lastmile.resources.couriers.list}>
                    Kurye listesine git
                  </Link>
                </Button>
              </TabsContent>

              <TabsContent value='sim' className='mt-4'>
                <CourierCostQuoteSimulator costListId={list.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
