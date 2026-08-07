"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import type { LineListKpi, LineRecord, LocationOption } from "../_types"
import { LinesKpiCards } from "./lines-kpi-cards"
import { LinesTableSection } from "./lines-table-section"

interface Props {
  lines: LineRecord[]
  kpi: LineListKpi
  locations: LocationOption[]
}

export function LinesListPageContent({ lines, kpi, locations }: Props) {
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hat Listesi</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSummaryVisible((prev) => !prev)}
          >
            {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
          </Button>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Hat Ekle
          </Button>
        </div>
      </div>

      {isSummaryVisible && <LinesKpiCards kpi={kpi} />}
      <LinesTableSection
        initialData={lines}
        locations={locations}
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
      />
    </div>
  )
}
