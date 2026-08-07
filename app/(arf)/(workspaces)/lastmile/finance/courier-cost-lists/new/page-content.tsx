'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
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
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import { createCourierCostList } from '../../_api/courier-cost-api'
import { listPriceZones } from '../../_api/pricing-api'
import { CourierCostQuoteSimulator } from '../../_components/courier-cost-quote-simulator'
import { CourierCostRulesEditor } from '../../_components/courier-cost-rules-editor'
import { createId } from '../../_lib/format'
import type { CompensationModel, CourierCostRule, PriceZone } from '../../_types'
import { COMPENSATION_MODEL_LABELS } from '../../_types'

const STEPS = [
  { id: 1, title: 'Kimlik' },
  { id: 2, title: 'Kurallar' },
  { id: 3, title: 'Simülasyon' },
  { id: 4, title: 'Özet' },
] as const

export default function NewCourierCostListPageContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [zones, setZones] = useState<PriceZone[]>([])
  const tempId = useState(() => createId('ccl'))[0]

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [compensationModel, setCompensationModel] = useState<CompensationModel>('tariff')
  const [fixedSalaryMonthly, setFixedSalaryMonthly] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [rules, setRules] = useState<CourierCostRule[]>([])

  useEffect(() => {
    void listPriceZones().then(setZones)
  }, [])

  const canNext = () => {
    if (step === 1) return code.trim().length >= 2 && name.trim().length >= 2
    return true
  }

  const save = async () => {
    if (!canNext()) {
      toast.error('Kod ve ad zorunludur')
      return
    }
    setSaving(true)
    try {
      const created = await createCourierCostList({
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
        status: 'active',
        rules,
      })
      toast.success('Kurye ücret listesi oluşturuldu')
      router.push(ARF_ROUTES.lastmile.finance.courierCostLists.detail(created.id))
    } catch {
      toast.error('Kayıt başarısız')
    } finally {
      setSaving(false)
    }
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
          { label: 'Yeni Liste' },
        ]}
      />
      <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Yeni Kurye Ücret Listesi</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Tarife, maaş + prim veya hibrit model ile maliyet tanımlayın.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {STEPS.map((s) => (
            <button
              key={s.id}
              type='button'
              onClick={() => setStep(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                step === s.id
                  ? 'bg-lime-400 text-black'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {s.id}. {s.title}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <Card className='rounded-2xl shadow-none'>
            <CardHeader>
              <CardTitle className='text-base'>Ücret Listesi Kimliği</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Kod *</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder='KURYE-KM-2026'
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Ad *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Kurye km tarifesi'
                />
              </div>
              <div className='space-y-1.5 sm:col-span-2'>
                <Label>Açıklama</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
                    {(Object.keys(COMPENSATION_MODEL_LABELS) as CompensationModel[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {COMPENSATION_MODEL_LABELS[m]}
                      </SelectItem>
                    ))}
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
                    placeholder='28500'
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
                <Input type='date' value={validTo} onChange={(e) => setValidTo(e.target.value)} />
              </div>
              <div className='flex items-center gap-2 sm:col-span-2'>
                <Switch checked={isDefault} onCheckedChange={setIsDefault} id='is-default-cc' />
                <Label htmlFor='is-default-cc'>Varsayılan ücret listesi yap</Label>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <CourierCostRulesEditor
            rules={rules}
            zones={zones}
            costListId={tempId}
            onChange={setRules}
          />
        ) : null}

        {step === 3 ? (
          <div className='space-y-3'>
            <p className='text-sm text-slate-500'>
              Simülasyon kayıtlı listeler üzerinden çalışır. Kaydettikten sonra detayda deneyin.
            </p>
            <CourierCostQuoteSimulator />
            <p className='text-xs text-slate-400'>Aktif kural sayısı: {rules.length}</p>
          </div>
        ) : null}

        {step === 4 ? (
          <Card className='rounded-2xl shadow-none'>
            <CardHeader>
              <CardTitle className='text-base'>Özet</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <p>
                <span className='text-slate-500'>Kod:</span> {code || '—'}
              </p>
              <p>
                <span className='text-slate-500'>Ad:</span> {name || '—'}
              </p>
              <p>
                <span className='text-slate-500'>Model:</span>{' '}
                {COMPENSATION_MODEL_LABELS[compensationModel]}
              </p>
              <p>
                <span className='text-slate-500'>Varsayılan:</span> {isDefault ? 'Evet' : 'Hayır'}
              </p>
              <p>
                <span className='text-slate-500'>Kural sayısı:</span> {rules.length}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className='flex items-center justify-between gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              step === 1
                ? router.push(ARF_ROUTES.lastmile.finance.courierCostLists.list)
                : setStep((s) => (s - 1) as 1 | 2 | 3 | 4)
            }
          >
            {step === 1 ? 'İptal' : 'Geri'}
          </Button>
          <div className='flex gap-2'>
            {step < 4 ? (
              <Button
                type='button'
                className='bg-lime-400 text-black hover:bg-lime-300'
                disabled={!canNext()}
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
              >
                İleri
              </Button>
            ) : (
              <Button
                type='button'
                className='bg-lime-400 text-black hover:bg-lime-300'
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
