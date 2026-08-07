"use client"

import { useState } from "react"
import { simulateInterlandUnits } from "../_api/interland-units-simulation-api"
import type { InterlandSimulationInitialData, InterlandUnitsSimulationResult } from "../_types"
import { SimulationEmptyState } from "./simulation-empty-state"
import { SimulationFilterPanel } from "./simulation-filter-panel"
import { SimulationResultCard } from "./simulation-result-card"

interface Props {
  initialData: InterlandSimulationInitialData
}

export function InterlandUnitsSimulationPageContent({ initialData }: Props) {
  const [result, setResult] = useState<InterlandUnitsSimulationResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="space-y-6">
      <SimulationFilterPanel
        cityOptions={initialData.cityOptions}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          setIsSubmitting(true)
          try {
            const next = await simulateInterlandUnits(payload)
            setResult(next)
          } finally {
            setIsSubmitting(false)
          }
        }}
        onClear={() => setResult(null)}
      />

      {result ? <SimulationResultCard result={result} /> : <SimulationEmptyState />}
    </div>
  )
}
