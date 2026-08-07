'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import { createPriceList, listPriceZones } from '../../_api/pricing-api'
import {
  PriceListEditor,
  type PriceListEditorValues,
} from '../../_components/price-list-editor'
import { createId } from '../../_lib/format'
import type { PriceZone } from '../../_types'

export default function NewPriceListPageContent() {
  const router = useRouter()
  const [zones, setZones] = useState<PriceZone[]>([])
  const [saving, setSaving] = useState(false)
  const tempId = useState(() => createId('pl'))[0]

  useEffect(() => {
    void listPriceZones().then(setZones)
  }, [])

  const save = async (values: PriceListEditorValues) => {
    setSaving(true)
    try {
      const created = await createPriceList({
        name: values.name,
        isDefault: values.isDefault,
        distanceStructure: values.distanceStructure,
        status: 'active',
        rules: values.rules,
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
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          { label: 'Fiyat Listeleri', href: ARF_ROUTES.lastmile.finance.priceLists.list },
          { label: 'Yeni Liste' },
        ]}
      />
      <PriceListEditor
        mode='create'
        priceListId={tempId}
        initial={{
          name: '',
          isDefault: false,
          distanceStructure: 'km',
          rules: [],
        }}
        zones={zones}
        saving={saving}
        onSubmit={save}
        onCancel={() => router.push(ARF_ROUTES.lastmile.finance.priceLists.list)}
      />
    </>
  )
}
