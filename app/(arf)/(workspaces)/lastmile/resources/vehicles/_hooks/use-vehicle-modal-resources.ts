'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { fetchDriverOptions, fetchVehicleSkillCatalog } from '../_api/vehicles'
import type { CourierOption } from '../_lib/map-vehicle'
import { buildSkillLabelMap } from '../_lib/query-vehicles'
import type { VehicleSkillOption } from '../_types/vehicle'

export function useVehicleModalResources() {
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([])
  const [skillOptions, setSkillOptions] = useState<VehicleSkillOption[]>([])
  const [isSkillCatalogLoading, setIsSkillCatalogLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchDriverOptions().then((result) => {
      if (cancelled || !result.success) return
      setCourierOptions(result.data)
    })

    setIsSkillCatalogLoading(true)
    fetchVehicleSkillCatalog().then((result) => {
      if (cancelled) return
      setIsSkillCatalogLoading(false)
      if (!result.success) {
        toast.error(result.error ?? 'Yetenek kataloğu yüklenemedi.')
        return
      }
      setSkillOptions(result.data)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const skillLabelMap = useMemo(() => buildSkillLabelMap(skillOptions), [skillOptions])

  return {
    courierOptions,
    skillOptions,
    isSkillCatalogLoading,
    skillLabelMap,
  }
}
