'use client'

import { useEffect, useState } from 'react'
import { estimateRange } from '../_lib/pricing'

type DelayedEstimate = {
  calculating: boolean
  range: { min: number; max: number } | null
}

/**
 * Ölçü / seçim değişince fiyatı hemen basmaz.
 * Kısa bir debounce + hesaplama bekleyişi sonrası aralık döner.
 */
export function useDelayedEstimate(total: number | null, signature = ''): DelayedEstimate {
  const [calculating, setCalculating] = useState(Boolean(total && total > 0))
  const [range, setRange] = useState<{ min: number; max: number } | null>(null)

  useEffect(() => {
    if (total == null || total <= 0) {
      setRange(null)
      setCalculating(false)
      return
    }

    setCalculating(true)
    let holdTimer: number | undefined
    const debounceTimer = window.setTimeout(() => {
      const holdMs = 680 + (Math.abs(Math.round(total)) % 240)
      holdTimer = window.setTimeout(() => {
        setRange(estimateRange(total))
        setCalculating(false)
      }, holdMs)
    }, 280)

    return () => {
      window.clearTimeout(debounceTimer)
      if (holdTimer) window.clearTimeout(holdTimer)
    }
  }, [total, signature])

  return { calculating, range }
}
