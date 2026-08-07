'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import { createPriceList, listPriceZones } from '../../_api/pricing-api'
import { PriceQuoteSimulator } from '../../_components/price-quote-simulator'
import { PriceRulesEditor } from '../../_components/price-rules-editor'
import { createId } from '../../_lib/format'
import type { PriceRule, PriceZone } from '../../_types'

const STEPS = [
  { id: 1, title: 'Kimlik' },
  { id: 2, title: 'Kurallar' },
  { id: 3, title: 'Simülasyon' },
  { id: 4, title: 'Özet' },
] as const

export default function NewPriceListPageContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [zones, setZones] = useState<PriceZone[]>([])
  const tempId = useState(() => createId('pl'))[0]

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [rules, setRules] = useState<PriceRule[]>([])

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
      const created = await createPriceList({
        code,
        name,
        description,
        isDefault,
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
        status: 'active',
        rules,
      })
      toast.success('Fiyat listesi oluşturuldu')
      router.push(ARF_ROUTES.lastmile.finance.priceLists.detail(created.id))
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
          { label: 'Fiyat Listeleri', href: ARF_ROUTES.lastmile.finance.priceLists.list },
          { label: 'Yeni Liste' },
        ]}
      />
      <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Yeni Fiyat Listesi</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Kimlik, kurallar ve simülasyon adımlarıyla ücretlendirme tanımlayın.
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
              <CardTitle className='text-base'>Fiyatlandırma Kimliği</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Kod *</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder='GENEL-2026' />
              </div>
              <div className='space-y-1.5'>
                <Label>Ad *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Genel tarife' />
              </div>
              <div className='space-y-1.5 sm:col-span-2'>
                <Label>Açıklama</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className='space-y-1.5'>
                <Label>Geçerlilik başlangıç</Label>
                <Input type='date' value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div className='space-y-1.5'>
                <Label>Geçerlilik bitiş</Label>
                <Input type='date' value={validTo} onChange={(e) => setValidTo(e.target.value)} />
              </div>
              <div className='flex items-center gap-2 sm:col-span-2'>
                <Switch checked={isDefault} onCheckedChange={setIsDefault} id='is-default' />
                <Label htmlFor='is-default'>Varsayılan fiyat listesi yap</Label>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <PriceRulesEditor
            rules={rules}
            zones={zones}
            priceListId={tempId}
            onChange={setRules}
          />
        ) : null}

        {step === 3 ? (
          <div className='space-y-3'>
            <p className='text-sm text-slate-500'>
              Simülasyon kayıtlı listeler üzerinden çalışır. Önce kaydedip detayda deneyebilir veya seed
              listeleriyle karşılaştırabilirsiniz. Bu adımda kural sayınızı gözden geçirin.
            </p>
            <PriceQuoteSimulator />
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
                <span className='text-slate-500'>Varsayılan:</span> {isDefault ? 'Evet' : 'Hayır'}
              </p>
              <p>
                <span className='text-slate-500'>Kural sayısı:</span> {rules.length}
              </p>
              {description ? <p className='text-slate-600'>{description}</p> : null}
            </CardContent>
          </Card>
        ) : null}

        <div className='flex items-center justify-between gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              step === 1
                ? router.push(ARF_ROUTES.lastmile.finance.priceLists.list)
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
