"use client"

import { useState } from "react"
import type { OnChangeFn, PaginationState } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SupplierListKpi, SupplierRecord } from "../_types"
import { CreateSupplierModal } from "./create-supplier-modal"
import { SuppliersKpiCards } from "./suppliers-kpi-cards"
import { SuppliersTableSection } from "./suppliers-table-section"

interface Props {
  suppliers: SupplierRecord[]
  kpi: SupplierListKpi
}

export function SuppliersListPageContent({ suppliers, kpi }: Props) {
  const [rows, setRows] = useState(suppliers)
  const [summary, setSummary] = useState(kpi)
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setPagination((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Başlık */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tedarikçi Listesi</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSummaryVisible((v) => !v)}
          >
            {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Tedarikçi Oluştur
          </Button>
        </div>
      </div>

      {/* KPI Kartları */}
      {isSummaryVisible && <SuppliersKpiCards kpi={summary} />}

      {/* Tablo */}
      <SuppliersTableSection
        rows={rows}
        onRowsChange={(updated) => {
          setRows(updated)
          // KPI yeniden hesapla
          const active = updated.filter((r) => r.status === "active").length
          const passive = updated.filter((r) => r.status === "passive").length
          setSummary((prev) => ({ ...prev, active, passive }))
        }}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onCreateOpen={() => setCreateOpen(true)}
      />

      {/* Tedarikçi Oluştur Modalı */}
      <CreateSupplierModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(newSupplier) => {
          setRows((prev) => [newSupplier, ...prev])
          setSummary((prev) => ({
            ...prev,
            total: prev.total + 1,
            active: prev.active + 1,
            [newSupplier.supplierType === "truck_owner"
              ? "truckOwner"
              : newSupplier.supplierType]: (prev[newSupplier.supplierType === "truck_owner" ? "truckOwner" : (newSupplier.supplierType as keyof SupplierListKpi)] as number) + 1,
          }))
          setCreateOpen(false)
        }}
      />
    </div>
  )
}
