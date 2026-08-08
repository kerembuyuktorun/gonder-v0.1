'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { toast } from 'sonner'
import { createCourierCostList } from '../../_api/courier-cost-api'
import { listPriceZones } from '../../_api/pricing-api'
import {
  CourierCostListEditor,
  type CourierCostListEditorValues,
} from '../../_components/courier-cost-list-editor'
import { createId } from '../../_lib/format'
import type { PriceZone } from '../../_types'

export default function NewCourierCostListPageContent() {
  const router = useRouter()
  const [zones, setZones] = useState<PriceZone[]>([])
  const [saving, setSaving] = useState(false)
  const tempId = useState(() => createId('ccl'))[0]

  useEffect(() => {
    void listPriceZones().then(setZones)
  }, [])

  const save = async (values: CourierCostListEditorValues) => {
    setSaving(true)
    try {
      const created = await createCourierCostList({
        name: values.name,
        isDefault: values.isDefault,
        distanceStructure: values.distanceStructure,
        quantityBasis: values.quantityBasis,
        compensationModel: values.compensationModel,
        fixedSalaryMonthly: values.fixedSalaryMonthly,
        status: 'active',
        rules: values.rules,
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
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          {
            label: 'Kurye Ücret Listeleri',
            href: ARF_ROUTES.lastmile.finance.courierCostLists.list,
          },
          { label: 'Yeni Liste' },
        ]}
      />
      <CourierCostListEditor
        mode='create'
        costListId={tempId}
        initial={{
          name: '',
          isDefault: false,
          distanceStructure: 'km',
          compensationModel: 'tariff',
          quantityBasis: 'desi',
          rules: [],
        }}
        zones={zones}
        saving={saving}
        onSubmit={save}
        onCancel={() => router.push(ARF_ROUTES.lastmile.finance.courierCostLists.list)}
      />
    </>
  )
}
