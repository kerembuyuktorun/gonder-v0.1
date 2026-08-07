'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { fetchDriverSkillCatalog, fetchVehicleOptionsForCourier } from '../_api/drivers'
import { buildCourierSkillLabelMap } from '../_lib/query-couriers'
import type { VehicleOption } from '../_lib/vehicle-options'
import type { CourierSkillOption } from '../_types/courier'

export function useCourierModalResources() {
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  const [skillOptions, setSkillOptions] = useState<CourierSkillOption[]>([])
  const [isSkillCatalogLoading, setIsSkillCatalogLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchVehicleOptionsForCourier().then((result) => {
      if (cancelled) return
      if (!result.success) {
        toast.error(result.error ?? 'Araç listesi yüklenemedi.')
        return
      }
      setVehicleOptions(result.data)
    })

    setIsSkillCatalogLoading(true)
    fetchDriverSkillCatalog().then((result) => {
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

  const skillLabelMap = useMemo(() => buildCourierSkillLabelMap(skillOptions), [skillOptions])

  return useMemo(
    () => ({
      vehicleOptions,
      skillOptions,
      isSkillCatalogLoading,
      skillLabelMap,
    }),
    [isSkillCatalogLoading, skillLabelMap, skillOptions, vehicleOptions]
  )
}
