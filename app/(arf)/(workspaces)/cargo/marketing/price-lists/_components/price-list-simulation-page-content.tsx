"use client"

import { useState } from "react"
import { SimulationFilterPanel } from "./simulation-filter-panel-component"
import { SimulationResultCard } from "./simulation-result-card"
import { SimulationEmptyState } from "./simulation-empty-state"
import { simulatePrice } from "../_api/price-list-simulation-api"
import type { PriceListSimulationInput, PriceListSimulationResult, SimulationLookups } from "../_types"

interface Props {
  lookups: SimulationLookups
}

export function PriceListSimulationPageContent({ lookups }: Props) {
  const [result, setResult] = useState<PriceListSimulationResult | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  async function handleSimulate(input: PriceListSimulationInput) {
    setHasSubmitted(true)
    const response = await simulatePrice(input)
    setResult(response)
  }

  return (
    <div className="space-y-4">
      <SimulationFilterPanel lookups={lookups} onSimulate={handleSimulate} />

      {!hasSubmitted && (
        <SimulationEmptyState
          title=""
        description="Gönderici-Alıcı bilgilerini ve parça listesini seçip fiyat hesaplayın."

        />
      )}

      {hasSubmitted && !result && (
        <SimulationEmptyState
          title=""
          description="Seçilen adres ve toplam desi için aktif bir fiyat tanımı bulunamadı."
        />
      )}

      {result && <SimulationResultCard result={result} />}
    </div>
  )
}
