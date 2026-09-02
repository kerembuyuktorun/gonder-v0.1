'use client'

import { useEffect, useState } from 'react'
import { useSalesChannelIntegrationsStore } from '../_stores/sales-channel-integrations-store'

export function useSalesChannelIntegrationsHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useSalesChannelIntegrationsStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    setHydrated(useSalesChannelIntegrationsStore.persist.hasHydrated())
    return unsub
  }, [])

  return hydrated
}
