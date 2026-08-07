"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef, ColumnFiltersState, Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination, DataTableToolbar } from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CustomerAddressModal,
  resolveAddressBranch,
  type AddressFormState,
  type CustomerFormState,
  type ModalState,
} from "../../../../shipments/_components/customer-address-modal"
import { AddressBulkImportModal } from "./address-bulk-import-modal"
import type { CustomerAddressRecord } from "../../_data/customers"
import { Eye, Filter, Plus, SquarePen, Upload } from "lucide-react"

type AddressRow = CustomerAddressRecord

const emptyAddressForm: AddressFormState = {
  label: "",
  city: "",
  district: "",
  neighborhood: "",
  line1: "",
  contactName: "",
  phone: "",
  branch: "",
}

const emptyCustomerForm: CustomerFormState = {
  customerType: "corporate",
  tradeName: "",
  taxNumber: "",
  taxOffice: "",
  tcIdentityNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  contactName: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  branch: "",
}

function createAddressForm(address?: CustomerAddressRecord): AddressFormState {
  if (!address) {
    return emptyAddressForm
  }

  return {
    label: address.label,
    city: address.city,
    district: address.district,
    neighborhood: address.neighborhood,
    line1: address.line1,
    contactName: address.contactName,
    phone: address.phone,
    branch: address.branch,
  }
}

function updateFilter(filters: ColumnFiltersState, id: string, value?: string) {
  const next = filters.filter((item) => item.id !== id)
  if (value) {
    next.push({ id, value })
  }
  return next
}

export function CustomerAddressesSection({ addresses }: { addresses: CustomerAddressRecord[] }) {
  const [rows, setRows] = useState<CustomerAddressRecord[]>(addresses)
  const [table, setTable] = useState<TanStackTable<AddressRow> | null>(null)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showFilters, setShowFilters] = useState(false)
  const [cityFilter, setCityFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")

  const [detailAddressId, setDetailAddressId] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const [modalState, setModalState] = useState<ModalState | null>(null)
  const [customerCreateStep, setCustomerCreateStep] = useState<"address">("address")
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(emptyCustomerForm)
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm)
  const [modalError, setModalError] = useState("")

  useEffect(() => {
    setRows(addresses)
  }, [addresses])

  useEffect(() => {
    setColumnFilters((prev) => updateFilter(prev, "city", cityFilter === "all" ? undefined : cityFilter))
  }, [cityFilter])

  useEffect(() => {
    setColumnFilters((prev) => updateFilter(prev, "branch", branchFilter === "all" ? undefined : branchFilter))
  }, [branchFilter])

  const cityOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.city))).sort((a, b) => a.localeCompare(b, "tr")),
    [rows],
  )

  const branchOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.branch))).sort((a, b) => a.localeCompare(b, "tr")),
    [rows],
  )

  const detailAddress = useMemo(
    () => rows.find((row) => row.id === detailAddressId) ?? null,
    [detailAddressId, rows],
  )

  const openCreateModal = () => {
    setModalError("")
    setCustomerCreateStep("address")
    setAddressForm(emptyAddressForm)
    setModalState({ side: "sender", entity: "address", mode: "create" })
  }

  const openEditModal = (address: CustomerAddressRecord) => {
    setModalError("")
    setCustomerCreateStep("address")
    setAddressForm(createAddressForm(address))
    setModalState({ side: "sender", entity: "address", mode: "edit", targetId: address.id })
  }

  const closeModal = () => {
    setModalState(null)
    setModalError("")
  }

  const handleBackFromEdit = () => {
    const targetId = modalState?.targetId
    setModalState(null)
    setModalError("")
    if (targetId) {
      setDetailAddressId(targetId)
    }
  }

  const handleSaveAddress = () => {
    if (!addressForm.label.trim() || !addressForm.city.trim() || !addressForm.line1.trim()) {
      setModalError("Adres başlığı, şehir ve açık adres zorunludur.")
      return
    }

    const resolvedBranch =
      modalState?.mode === "create"
        ? resolveAddressBranch(addressForm.city, addressForm.district, addressForm.neighborhood)
        : addressForm.branch.trim()

    const nextAddress: CustomerAddressRecord = {
      id: modalState?.targetId ?? `addr-${Date.now()}`,
      label: addressForm.label.trim(),
      line1: addressForm.line1.trim(),
      city: addressForm.city.trim(),
      district: addressForm.district.trim() || "-",
      neighborhood: addressForm.neighborhood.trim() || "-",
      branch: resolvedBranch || "-",
      phone: addressForm.phone.trim() || "-",
      contactName: "",
    }

    setRows((prev) => {
      if (modalState?.mode === "create") {
        return [nextAddress, ...prev]
      }

      return prev.map((item) => (item.id === nextAddress.id ? { ...item, ...nextAddress } : item))
    })

    setModalState(null)
    setModalError("")
  }

  const handleBulkImport = (newRows: CustomerAddressRecord[]) => {
    setRows((prev) => [...newRows, ...prev])
  }

  const clearFilters = () => {
    setCityFilter("all")
    setBranchFilter("all")
  }

  const columns = useMemo<ColumnDef<AddressRow>[]>(
    () => [
      {
        accessorKey: "label",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Adres Başlığı" />,
        cell: ({ row }) => <span className="font-semibold text-slate-900">{row.original.label}</span>,
      },
      {
        accessorKey: "line1",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Adres" />,
        cell: ({ row }) => <span className="text-slate-700">{row.original.line1}</span>,
      },
      {
        accessorKey: "city",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Şehir" />,
      },
      {
        accessorKey: "district",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İlçe" />,
      },
      {
        accessorKey: "branch",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Şube" />,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Telefon" />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <span className="sr-only">İşlemler</span>,
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setDetailAddressId(row.original.id)}>
            <Eye className="mr-2 size-4" />
            Detay
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">Adres Bilgileri</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-2 size-4" />
              Excel ile Toplu Ekle
            </Button>
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="mr-2 size-4" />
              Yeni Adres Ekle
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {table && (
            <div className="flex items-center gap-2">
              <DataTableToolbar table={table} showColumnSelector>
                <Button
                  type="button"
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  className="mr-3 h-8"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreler
                </Button>

                {showFilters && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger className="h-8 w-[170px]">
                        <SelectValue placeholder="Şehir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Şehirler</SelectItem>
                        {cityOptions.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Şube" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Şubeler</SelectItem>
                        {branchOptions.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={clearFilters}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </DataTableToolbar>
            </div>
          )}

          <DataTable
            data={rows}
            columns={columns}
            enablePagination
            enableSorting
            enableColumnVisibility
            enableHorizontalScroll
            stickyFirstColumn
            stickyLastColumn
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Gösterilecek adres bulunamadı."
            onTableReady={(instance) => setTable(instance as TanStackTable<AddressRow>)}
          />

          {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} />}
        </CardContent>
      </Card>

      {detailAddress && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-16 backdrop-blur-[2px]">
          <div className="max-h-[calc(100vh-5rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold text-slate-900">Adres Detayı</h3>
                <p className="text-sm text-slate-500">Adres kaydını görüntüleyebilir veya düzenlemeye geçebilirsiniz.</p>
              </div>
            </div>

            <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
              <DetailField label="Adres Başlığı" value={detailAddress.label} />
              <DetailField label="Telefon" value={detailAddress.phone} />
              <DetailField label="Şehir" value={detailAddress.city} />
              <DetailField label="İlçe" value={detailAddress.district} />
              <DetailField label="Mahalle" value={detailAddress.neighborhood} />
              <DetailField label="Şube" value={detailAddress.branch} />
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-slate-600">Açık Adres</p>
                <div className="min-h-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  {detailAddress.line1}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={() => setDetailAddressId(null)}>
                Kapat
              </Button>
              <Button
                className="rounded-2xl"
                onClick={() => {
                  setDetailAddressId(null)
                  openEditModal(detailAddress)
                }}
              >
                <SquarePen className="mr-2 size-4" />
                Düzelt
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalState && (
        <CustomerAddressModal
          modalState={modalState}
          customerCreateStep={customerCreateStep}
          customerForm={customerForm}
          addressForm={addressForm}
          modalError={modalError}
          setCustomerForm={setCustomerForm}
          setAddressForm={setAddressForm}
          onClose={closeModal}
          onBack={modalState?.mode === "edit" && modalState?.entity === "address" ? handleBackFromEdit : closeModal}
          onSave={handleSaveAddress}
        />
      )}

      {showImportModal && (
        <AddressBulkImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleBulkImport}
        />
      )}
    </>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800">
        {value || "-"}
      </div>
    </div>
  )
}
