'use client'

import { useEffect, useState } from 'react'
import { useCreateShipmentStore } from '../_stores/create-shipment-draft-store'

export function useCreateShipmentHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useCreateShipmentStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useCreateShipmentStore.persist.hasHydrated())
    return unsub
  }, [])

  return hydrated
}
