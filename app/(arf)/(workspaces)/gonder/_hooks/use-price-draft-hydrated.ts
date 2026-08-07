'use client'

import { useEffect, useState } from 'react'
import { usePriceDraftStore } from '../_stores/price-calculation-draft-store'

export function usePriceDraftHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const finish = () => setHydrated(true)

    if (usePriceDraftStore.persist.hasHydrated()) {
      finish()
      return
    }

    return usePriceDraftStore.persist.onFinishHydration(finish)
  }, [])

  return hydrated
}
