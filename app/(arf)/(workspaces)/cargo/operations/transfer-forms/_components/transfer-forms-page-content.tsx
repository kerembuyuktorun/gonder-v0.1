"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createNewTransferForm, fetchTransferFormListKpi } from "../_api/transfer-forms-list-api"
import type { TransferFormListKpi, TransferFormListRecord } from "../_types"
import { TransferFormsKpiCards } from "./transfer-forms-kpi-cards"
import { TransferFormsTableSection } from "./transfer-forms-table-section"

interface Props {
  initialData: TransferFormListRecord[]
  initialKpi: TransferFormListKpi
}

export function TransferFormsPageContent({ initialData, initialKpi }: Props) {
  const router = useRouter()

  const [rows, setRows] = useState(initialData)
  const [kpi, setKpi] = useState(initialKpi)
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const stableRows = useMemo(() => rows, [rows])

  async function refreshKpi() {
    const refreshed = await fetchTransferFormListKpi()
    setKpi(refreshed)
  }

  async function handleNewKtf() {
    setIsCreating(true)
    try {
      const result = await createNewTransferForm()

      if ("code" in result) {
        // Kuryenin açık KTF'si var
        toast.warning(result.message, {
          action: {
            label: "KTF'ye Git",
            onClick: () => router.push(`/arf/cargo/operations/transfer-forms/${result.existingKtfId}`),
          },
        })
        return
      }

      // Başarılı: listeye ekle ve KPI güncelle
      const newRow: TransferFormListRecord = {
        id: result.id,
        ktfNumber: result.ktfNumber,
        courierId: result.courierId,
        courierName: result.courierName,
        branchId: "branch-001",
        branchName: "İstanbul Anadolu Şubesi",
        status: "OPEN",
        openedAt: new Date().toISOString(),
        closedAt: null,
        totalConsignments: 0,
        totalCollectionAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRows((prev) => [newRow, ...prev])
      await refreshKpi()
      toast.success(`KTF ${result.ktfNumber} başarıyla oluşturuldu`)
    } catch {
      toast.error("KTF oluşturulurken bir hata oluştu")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">KTF Listesi</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsSummaryVisible((prev) => !prev)}>
            {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
          </Button>
          <Button type="button" size="sm" onClick={handleNewKtf} disabled={isCreating}>
            <Plus className="mr-2 size-4" />
            Yeni KTF Al
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isSummaryVisible && <TransferFormsKpiCards kpi={kpi} />}

      {/* Table */}
      <TransferFormsTableSection rows={stableRows} />
    </div>
  )
}
