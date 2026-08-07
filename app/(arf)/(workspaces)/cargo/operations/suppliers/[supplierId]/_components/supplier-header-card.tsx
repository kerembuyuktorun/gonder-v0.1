"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  Car,
  CheckCircle2,
  MapPin,
  Pencil,
  Phone,
  PowerOff,
  Star,
  Trash2,
  Truck,
  Users,
} from "lucide-react"
import { ARF_ROUTES } from "../../../../../../_shared/routes"
import { deleteSupplierDetail, toggleSupplierDetailStatus } from "../_api/supplier-detail-api"
import type { SupplierDetail } from "../_types"

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  ozmal: "Özmal",
  logistics: "Lojistik",
  truck_owner: "Kamyon Sahibi",
  warehouse: "Ambar",
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fixed_salary: "Sabit Maaşlı",
  per_trip: "Sefer Başı",
  per_desi: "Desi Başı",
  commission: "Komisyon",
}

interface Props {
  supplier: SupplierDetail
  onEditClick: () => void
  onSupplierChange: (updated: SupplierDetail) => void
}

export function SupplierHeaderCard({ supplier, onEditClick, onSupplierChange }: Props) {
  const [isActioning, setIsActioning] = useState(false)
  const router = useRouter()

  const isOzmal = !supplier.isDeactivatable
  const isPassive = supplier.status === "passive"

  async function handleToggleStatus() {
    if (isOzmal) return
    setIsActioning(true)
    try {
      const updated = await toggleSupplierDetailStatus(supplier.id)
      onSupplierChange(updated)
    } finally {
      setIsActioning(false)
    }
  }

  async function handleDelete() {
    if (!supplier.isDeletable) return
    const confirmed = window.confirm(`${supplier.name} silinecek. Onaylıyor musunuz?`)
    if (!confirmed) return

    setIsActioning(true)
    try {
      await deleteSupplierDetail(supplier.id)
      router.push(ARF_ROUTES.cargo.operations.suppliers)
      router.refresh()
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <Card
      className={`overflow-hidden rounded-3xl border shadow-sm ${
        isPassive ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-white"
      }`}
    >
      <CardContent className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] p-0">
        <div className="px-6 pb-5 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Sol: Kimlik */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Tedarikçi Detay
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {isOzmal && <Star className="size-5 fill-amber-400 text-amber-400" />}
                <h1 className="text-2xl font-semibold text-slate-900">{supplier.name}</h1>
                <Badge
                  variant="outline"
                  className={
                    isPassive
                      ? "border-rose-200 bg-rose-100 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }
                >
                  {isPassive ? "Pasif" : "Aktif"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-slate-400" />
                  {SUPPLIER_TYPE_LABELS[supplier.supplierType] ?? supplier.supplierType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Car className="size-3.5 text-slate-400" />
                  {CONTRACT_TYPE_LABELS[supplier.contractType] ?? supplier.contractType}
                </span>
                {supplier.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-slate-400" />
                    {supplier.city}
                  </span>
                )}
                {supplier.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {supplier.contactPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Sağ: Butonlar */}
            <div className="flex items-start gap-2 self-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4"
                onClick={onEditClick}
              >
                <Pencil className="mr-1.5 size-4" />
                Düzenle
              </Button>
              <Button
                type="button"
                variant={isPassive ? "default" : "outline"}
                size="sm"
                className="h-10 rounded-xl px-4"
                disabled={isOzmal || isActioning}
                onClick={() => void handleToggleStatus()}
                title={isOzmal ? "Özmal tedarikçi pasif yapılamaz" : undefined}
              >
                {isPassive ? (
                  <>
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Aktif Yap
                  </>
                ) : (
                  <>
                    <PowerOff className="mr-1.5 size-4" />
                    Pasif Yap
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 text-red-700 hover:text-red-700"
                disabled={!supplier.isDeletable || isActioning}
                onClick={() => void handleDelete()}
                title={!supplier.isDeletable ? "Bu tedarikçi silinemez" : undefined}
              >
                <Trash2 className="mr-1.5 size-4" />
                Sil
              </Button>
            </div>
          </div>
        </div>

        {/* Alt bilgi şeridi */}
        <div className="grid gap-0 border-t border-slate-200 md:grid-cols-4">
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Truck className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Araç</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{supplier.vehicleCount} araç</p>
          </div>
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Sürücü</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{supplier.driverCount} sürücü</p>
          </div>
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Aktif Sefer</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{supplier.activeTripsCount} sefer</p>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Toplam Sefer</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{supplier.totalTripsCount} sefer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
