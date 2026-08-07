"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Filter, Plus, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  deleteSupplierVehicle,
  toggleSupplierVehicleStatus,
} from "../_api/supplier-detail-api"
import { AddVehicleModal } from "./add-vehicle-modal"
import { VehicleDocumentsModal } from "./vehicle-documents-modal"
import { getVehiclesColumns } from "../_columns/vehicles-columns"
import type { SupplierDetail, SupplierVehicle } from "../_types"

interface Props {
  supplier: SupplierDetail
  onSupplierChange: (updated: SupplierDetail) => void
}

export function SupplierFleetSection({ supplier, onSupplierChange }: Props) {
  const [table, setTable] = useState<TanStackTable<SupplierVehicle> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<SupplierVehicle | null>(null)
  const [documentsOpen, setDocumentsOpen] = useState(false)

  const vehicleTypeOptions = useMemo(
    () => [
      { label: "TIR", value: "tir" },
      { label: "Kamyon", value: "kamyon" },
      { label: "Van", value: "van" },
      { label: "Pickup", value: "pickup" },
    ],
    [],
  )

  const statusOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Pasif", value: "passive" },
    ],
    [],
  )

  const bodyTypeOptions = useMemo(
    () => [
      { label: "Tenteli", value: "tenteli" },
      { label: "Kapalı Kasa", value: "kapali_kasa" },
      { label: "Frigorifik", value: "frigorifik" },
      { label: "Açık Kasa", value: "acik_kasa" },
      { label: "Panelvan", value: "panelvan" },
      { label: "Diğer", value: "diger" },
    ],
    [],
  )

  const columns = useMemo(
    () =>
      getVehiclesColumns({
        onViewDocuments: (vehicle) => {
          setSelectedVehicle(vehicle)
          setDocumentsOpen(true)
        },
        onEdit: (vehicle) => {
          setSelectedVehicle(vehicle)
          setAddOpen(true)
        },
        onDelete: async (vehicle) => {
          const confirmed = window.confirm(`${vehicle.plate} plakalı araç silinecek. Onaylıyor musunuz?`)
          if (!confirmed) return
          await deleteSupplierVehicle(supplier.id, vehicle.id)
          onSupplierChange({
            ...supplier,
            vehicles: supplier.vehicles.filter((item) => item.id !== vehicle.id),
            vehicleCount: Math.max(0, supplier.vehicleCount - 1),
          })
        },
        onToggleStatus: async (vehicle) => {
          const updatedVehicle = await toggleSupplierVehicleStatus(supplier.id, vehicle.id)
          onSupplierChange({
            ...supplier,
            vehicles: supplier.vehicles.map((item) => (item.id === updatedVehicle.id ? updatedVehicle : item)),
          })
        },
      }),
    [onSupplierChange, supplier],
  )

  function handleVehicleAdded(vehicle: SupplierVehicle) {
    const exists = supplier.vehicles.some((item) => item.id === vehicle.id)

    onSupplierChange({
      ...supplier,
      vehicles: exists ? supplier.vehicles.map((item) => (item.id === vehicle.id ? vehicle : item)) : [...supplier.vehicles, vehicle],
      vehicleCount: exists ? supplier.vehicleCount : supplier.vehicleCount + 1,
    })

    setSelectedVehicle(null)
    setAddOpen(false)
  }

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Truck className="size-4 text-slate-400" />
          Araç Listesi
          {supplier.vehicles.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
              {supplier.vehicles.length}
            </span>
          )}
        </CardTitle>
        <Button size="sm" className="h-8 text-xs" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 size-3.5" />
          Araç Ekle
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {supplier.vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <Truck className="size-8" />
            <p className="text-sm">Henüz araç eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {table && (
              <div className="flex items-center gap-2">
                {!showFilters && (
                  <DataTableExcelActions table={table} filename="tedarikci-arac-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}
                <DataTableToolbar table={table} searchPlaceholder="Plaka, araç, sürücü ara..." showColumnSelector={!showFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button type="button" variant={showFilters ? "default" : "outline"} size="sm" className="mr-3 h-8" onClick={() => setShowFilters((value) => !value)}>
                    <Filter className="mr-2 size-4" />
                    Filtreler
                  </Button>
                </DataTableToolbar>
              </div>
            )}

            {showFilters && table && (
              <div className="flex flex-wrap gap-2">
                <DataTableFacetedFilter column={table.getColumn("vehicleType")} title="Tip" options={vehicleTypeOptions} />
                <DataTableFacetedFilter column={table.getColumn("bodyType")} title="Kasa Tipi" options={bodyTypeOptions} />
                <DataTableFacetedFilter column={table.getColumn("status")} title="Durum" options={statusOptions} />
              </div>
            )}

            <DataTable
              columns={columns}
              data={supplier.vehicles}
              onTableReady={setTable}
              enableSorting
              enableColumnVisibility
              enableHorizontalScroll
              stickyFirstColumn
              stickyLastColumn
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
              emptyMessage="Gösterilecek araç bulunamadı."
            />
            {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
          </div>
        )}
      </CardContent>

      <AddVehicleModal
        supplierId={supplier.id}
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) {
            setSelectedVehicle(null)
          }
        }}
        onSaved={handleVehicleAdded}
        vehicle={selectedVehicle}
      />

      <VehicleDocumentsModal open={documentsOpen} onOpenChange={setDocumentsOpen} vehicle={selectedVehicle} />
    </Card>
  )
}
