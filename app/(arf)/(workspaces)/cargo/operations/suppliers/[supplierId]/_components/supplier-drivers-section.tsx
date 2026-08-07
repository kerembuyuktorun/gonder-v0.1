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
import { Filter, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  deleteSupplierDriver,
  toggleSupplierDriverStatus,
} from "../_api/supplier-detail-api"
import { AddDriverModal } from "./add-driver-modal"
import { DriverDocumentsModal } from "./driver-documents-modal"
import { getDriversColumns } from "../_columns/drivers-columns"
import type { SupplierDetail, SupplierDriver } from "../_types"

interface Props {
  supplier: SupplierDetail
  onSupplierChange: (updated: SupplierDetail) => void
}

export function SupplierDriversSection({ supplier, onSupplierChange }: Props) {
  const [table, setTable] = useState<TanStackTable<SupplierDriver> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<SupplierDriver | null>(null)
  const [documentsOpen, setDocumentsOpen] = useState(false)

  const statusOptions = useMemo(
    () => [
      { label: "Müsait", value: "available" },
      { label: "Seferde", value: "on_trip" },
      { label: "Görev Dışı", value: "off_duty" },
    ],
    [],
  )

  const licenseClassOptions = useMemo(
    () => [
      { label: "B", value: "B" },
      { label: "C", value: "C" },
      { label: "CE", value: "CE" },
      { label: "D", value: "D" },
    ],
    [],
  )

  const columns = useMemo(
    () =>
      getDriversColumns({
        onViewDocuments: (driver) => {
          setSelectedDriver(driver)
          setDocumentsOpen(true)
        },
        onEdit: (driver) => {
          setSelectedDriver(driver)
          setAddOpen(true)
        },
        onDelete: async (driver) => {
          const confirmed = window.confirm(`${driver.firstName} ${driver.lastName} adlı sürücü silinecek. Onaylıyor musunuz?`)
          if (!confirmed) return
          await deleteSupplierDriver(supplier.id, driver.id)
          onSupplierChange({
            ...supplier,
            drivers: supplier.drivers.filter((d) => d.id !== driver.id),
            driverCount: Math.max(0, supplier.driverCount - 1),
          })
        },
        onToggleStatus: async (driver) => {
          const updatedDriver = await toggleSupplierDriverStatus(supplier.id, driver.id)
          onSupplierChange({
            ...supplier,
            drivers: supplier.drivers.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)),
          })
        },
      }),
    [onSupplierChange, supplier],
  )

  function handleDriverSaved(driver: SupplierDriver) {
    const exists = supplier.drivers.some((d) => d.id === driver.id)
    onSupplierChange({
      ...supplier,
      drivers: exists
        ? supplier.drivers.map((d) => (d.id === driver.id ? driver : d))
        : [...supplier.drivers, driver],
      driverCount: exists ? supplier.driverCount : supplier.driverCount + 1,
    })
    setSelectedDriver(null)
    setAddOpen(false)
  }

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Users className="size-4 text-slate-400" />
          Sürücü Listesi
          {supplier.drivers.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
              {supplier.drivers.length}
            </span>
          )}
        </CardTitle>
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setSelectedDriver(null)
            setAddOpen(true)
          }}
        >
          <Plus className="mr-1.5 size-3.5" />
          Sürücü Ekle
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {supplier.drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <Users className="size-8" />
            <p className="text-sm">Henüz sürücü eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {table && (
              <div className="flex items-center gap-2">
                {!showFilters && (
                  <DataTableExcelActions table={table} filename="tedarikci-surucu-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}
                <DataTableToolbar table={table} searchPlaceholder="Sürücü, TCKN, telefon ara..." showColumnSelector={!showFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button type="button" variant={showFilters ? "default" : "outline"} size="sm" className="mr-3 h-8" onClick={() => setShowFilters((value) => !value)}>
                    <Filter className="mr-2 size-4" />
                    Filtreler
                  </Button>
                </DataTableToolbar>
              </div>
            )}

            {showFilters && table && (
              <div className="flex flex-wrap gap-2">
                <DataTableFacetedFilter column={table.getColumn("status")} title="Durum" options={statusOptions} />
                <DataTableFacetedFilter column={table.getColumn("licenseClass")} title="Ehliyet Sınıfı" options={licenseClassOptions} />
              </div>
            )}

            <DataTable
              columns={columns}
              data={supplier.drivers}
              onTableReady={setTable}
              enableSorting
              enableColumnVisibility
              enableHorizontalScroll
              stickyFirstColumn
              stickyLastColumn
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
              emptyMessage="Gösterilecek sürücü bulunamadı."
            />
            {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
          </div>
        )}
      </CardContent>

      <AddDriverModal
        supplierId={supplier.id}
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedDriver(null)
          setAddOpen(open)
        }}
        onSaved={handleDriverSaved}
        driver={selectedDriver}
      />

      <DriverDocumentsModal
        open={documentsOpen}
        onOpenChange={setDocumentsOpen}
        driver={selectedDriver}
      />
    </Card>
  )
}

