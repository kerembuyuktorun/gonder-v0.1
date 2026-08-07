"use client"

import { useCallback, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Building2,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { getBranchesColumns } from "../_columns/branches-columns"
import { BranchAddModal, type AddBranchInput } from "./branch-add-modal"
import type { TransferCenter, TransferCenterBranch, TransferCenterDocument } from "../_types"

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-slate-800">
        {value ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  )
}

const documentTypeLabels: Record<TransferCenterDocument["type"], string> = {
  vergi_levhasi: "Vergi Levhası",
  sozlesme: "Sözleşme",
  imza_sirkuleri: "İmza Sirküleri",
  diger: "Diğer",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const commissionModelLabel: Record<string, string> = {
  per_piece: "Parça Başı",
  percentage: "Oransal",
}

interface Props {
  center: TransferCenter
}

export function DetailInfoSection({ center }: Props) {
  const [branches, setBranches] = useState<TransferCenterBranch[]>(center.branches)
  const [table, setTable] = useState<TanStackTable<TransferCenterBranch> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)

  const handleAddBranch = useCallback((payload: AddBranchInput) => {
    setBranches((prev) => [
      {
        id: `branch-${Date.now()}`,
        connectedAt: new Date().toISOString().slice(0, 10),
        status: "active",
        ...payload,
      },
      ...prev,
    ])
  }, [])

  const handleRemoveBranch = useCallback((branch: TransferCenterBranch) => {
    setBranches((prev) => prev.filter((item) => item.id !== branch.id))
  }, [])

  const branchesColumns = useMemo(
    () => getBranchesColumns(handleRemoveBranch),
    [handleRemoveBranch],
  )

  const statusOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Pasif", value: "passive" },
    ],
    [],
  )

  const maskedIban = center.iban
    ? center.iban.replace(/\S(?=.{4})/g, "*")
    : undefined

  return (
    <div className="space-y-5">
      {/* Üst 2 kart */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Transfer Merkezi Bilgileri */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 className="size-4 text-slate-400" />
              Transfer Merkezi Bilgileri
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Pencil className="mr-1 size-3.5" />
              Düzenle
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl>
              <InfoRow label="Merkez Adı" value={center.name} />
              <InfoRow label="Kod" value={center.code} />
              <InfoRow label="İl" value={center.city} />
              <InfoRow label="İlçe" value={center.district} />
              <InfoRow label="Adres" value={center.address} />
              <InfoRow label="Yönetici" value={center.managerName} />
              <InfoRow label="Telefon" value={center.managerPhone} />
              <InfoRow label="E-posta" value={center.managerEmail} />
              <InfoRow label="Çalışma Saatleri" value={center.workingHours} />
              <div className="grid grid-cols-2 gap-2 py-2 text-sm">
                <dt className="font-medium text-slate-500">Kuruluş Tarihi</dt>
                <dd className="flex items-center justify-end gap-1 text-slate-800">
                  <Clock className="size-3.5 text-slate-400" />
                  {center.createdAt}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Acente Bilgileri */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="size-4 text-slate-400" />
              Acente Bilgileri
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Pencil className="mr-1 size-3.5" />
              Düzenle
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl>
              <InfoRow label="Vergi Dairesi" value={center.taxOffice} />
              <InfoRow label="VKN" value={center.taxNumber} />
              <InfoRow label="Acente Sahibi" value={center.agencyOwner} />
              <InfoRow label="Telefon" value={center.agencyOwnerPhone} />
              <InfoRow label="E-posta" value={center.agencyOwnerEmail} />
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 text-sm">
                <dt className="font-medium text-slate-500">Hakediş Modeli</dt>
                <dd className="flex justify-end">
                  {center.commissionModel ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "border text-xs",
                        center.commissionModel === "per_piece"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-purple-200 bg-purple-50 text-purple-700",
                      )}
                    >
                      {commissionModelLabel[center.commissionModel]}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
              <InfoRow
                label="Hakediş Değeri"
                value={
                  center.commissionValue !== undefined
                    ? center.commissionModel === "per_piece"
                      ? `${center.commissionValue}₺ / parça`
                      : `%${center.commissionValue}`
                    : undefined
                }
              />
              <InfoRow label="Banka" value={center.bankName} />
              <InfoRow label="IBAN" value={maskedIban} />
              <InfoRow label="Hesap Sahibi" value={center.accountHolder} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Acente Dosyaları */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="size-4 text-slate-400" />
            Acente Dosyaları
          </CardTitle>
          <Button size="sm" className="h-8 text-xs">
            <Upload className="mr-1.5 size-3.5" />
            Dosya Yükle
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {center.documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <FileText className="size-8" />
              <p className="text-sm">Henüz dosya yüklenmemiş</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {center.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {documentTypeLabels[doc.type]} · {formatBytes(doc.fileSize)} ·{" "}
                        {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                      <a href={doc.url} download>
                        <Download className="mr-1 size-3.5" />
                        İndir
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Bağlı Şubeler */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MapPin className="size-4 text-slate-400" />
            Bağlı Şubeler
            {branches.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {branches.length}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" className="h-8 text-xs" onClick={() => setBranchModalOpen(true)}>
            <Plus className="mr-1.5 size-3.5" />
            Şube Ekle
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <MapPin className="size-8" />
              <p className="text-sm">Henüz bağlı şube yok</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={() => setBranchModalOpen(true)}
              >
                <Plus className="mr-1.5 size-3.5" />
                İlk Şubeyi Ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {table && (
                <div className="flex items-center gap-2">
                  {!showFilters && (
                    <DataTableExcelActions
                      table={table}
                      filename="bagli-subeler"
                      exportSelected={false}
                      exportLabel="Dışarı Aktar"
                    />
                  )}
                  <DataTableToolbar
                    table={table}
                    showColumnSelector={!showFilters}
                    viewLabel="Görünüm"
                    columnsLabel="Sütunlar"
                    resetLabel="Sıfırla"
                  >
                    <Button
                      type="button"
                      variant={showFilters ? "default" : "outline"}
                      size="sm"
                      className="mr-3 h-8"
                      onClick={() => setShowFilters((p) => !p)}
                    >
                      <Filter className="mr-2 size-4" />
                      Filtrele
                    </Button>
                  </DataTableToolbar>
                </div>
              )}
              {showFilters && table && (
                <div className="flex flex-wrap gap-2">
                  <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Durum"
                    options={statusOptions}
                  />
                </div>
              )}
              <DataTable
                columns={branchesColumns}
                data={branches}
                onTableReady={setTable}
              />
              {table && (
                <DataTablePagination
                  table={table as TanStackTable<unknown>}
                  pageSizeOptions={[5, 10, 20]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <BranchAddModal
        open={branchModalOpen}
        onOpenChange={setBranchModalOpen}
        onAdd={handleAddBranch}
      />
    </div>
  )
}
