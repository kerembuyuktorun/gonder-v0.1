'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import { getPriceList, listPriceZones, updatePriceList } from '../../_api/pricing-api'
import {
  PriceListEditor,
  type PriceListEditorValues,
} from '../../_components/price-list-editor'
import { DISTANCE_STRUCTURE_LABELS } from '../../_types'
import type { PriceList, PriceZone } from '../../_types'
import { PriceListCustomersSimPanel } from './_components/price-list-customers-sim-panel'

export default function PriceListDetailPageContent() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [list, setList] = useState<PriceList | null>(null)
  const [zones, setZones] = useState<PriceZone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('pricing')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [detail, zoneRows] = await Promise.all([getPriceList(id), listPriceZones()])
      if (!detail) {
        toast.error('Fiyat listesi bulunamadı')
        router.push(ARF_ROUTES.lastmile.finance.priceLists.list)
        return
      }
      setList(detail)
      setZones(zoneRows)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (values: PriceListEditorValues) => {
    setSaving(true)
    try {
      const updated = await updatePriceList(id, {
        name: values.name,
        isDefault: values.isDefault,
        distanceStructure: values.distanceStructure,
        returnFeePercent: values.returnFeePercent,
        returnFeeMin: values.returnFeeMin,
        status: list?.status ?? 'active',
        rules: values.rules,
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
            { label: 'Fiyat Listeleri', href: ARF_ROUTES.lastmile.finance.priceLists.list },
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
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          { label: 'Fiyat Listeleri', href: ARF_ROUTES.lastmile.finance.priceLists.list },
          { label: list.name },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>{list.name}</h1>
          {list.isDefault ? (
            <Badge className='bg-lime-100 text-lime-900 hover:bg-lime-100'>Varsayılan</Badge>
          ) : null}
          <Badge variant={list.status === 'active' ? 'default' : 'secondary'}>
            {list.status === 'active' ? 'Aktif' : 'Pasif'}
          </Badge>
          <Badge variant='outline'>
            {DISTANCE_STRUCTURE_LABELS[list.distanceStructure]}
          </Badge>
        </div>

        <Card className='rounded-[24px] border-slate-200/80 shadow-none'>
          <CardContent className='p-4 lg:p-5'>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className='h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-slate-100/80 p-1'>
                <TabsTrigger
                  value='pricing'
                  className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                >
                  Fiyatlandırma
                </TabsTrigger>
                <TabsTrigger
                  value='customers'
                  className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                >
                  Müşteriler & Simülasyon
                </TabsTrigger>
              </TabsList>

              <TabsContent value='pricing' className='mt-4'>
                <PriceListEditor
                  key={`${list.id}-${list.updatedAt}`}
                  mode='edit'
                  priceListId={list.id}
                  initial={{
                    name: list.name,
                    isDefault: list.isDefault,
                    distanceStructure: list.distanceStructure,
                    returnFeePercent: list.returnFeePercent,
                    returnFeeMin: list.returnFeeMin,
                    rules: list.rules,
                  }}
                  zones={zones}
                  saving={saving}
                  showSimulator={false}
                  layout='embedded'
                  onSubmit={save}
                  onCancel={() => router.push(ARF_ROUTES.lastmile.finance.priceLists.list)}
                />
              </TabsContent>

              <TabsContent value='customers' className='mt-4'>
                <PriceListCustomersSimPanel priceListId={list.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
