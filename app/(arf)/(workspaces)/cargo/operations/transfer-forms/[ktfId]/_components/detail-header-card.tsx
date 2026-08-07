"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock3, Printer, User, XCircle } from "lucide-react"
import { KTF_STATUS_CLASSES, KTF_STATUS_LABELS, formatCurrency, formatDateTime, formatNumber } from "../../_lib/transfer-form-helpers"
import type { TransferFormDetail } from "../_types/detail"

interface Props {
  detail: TransferFormDetail
  onPrint: () => void
  onCloseKtf: () => void
}

export function DetailHeaderCard({ detail, onPrint, onCloseKtf }: Props) {
  const isKtfClosed = detail.status === "CLOSED"

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] px-0 py-0">

        {/* Üst bant */}
        <div className="flex flex-col gap-4 px-6 pt-6 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Kurye Teslimat Formu </p>
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
              {detail.ktfNumber}
              <Badge variant="outline" className={KTF_STATUS_CLASSES[detail.status]}>
                {KTF_STATUS_LABELS[detail.status]}
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span>
                Toplam Zimmete Alınan Parça: <strong className="font-semibold text-slate-900">{formatNumber(detail.totalConsignments)}</strong>
              </span>
              <span>
                Toplam Yapılacak Tahsilat: <strong className="font-semibold text-slate-900">{formatCurrency(detail.totalCollectionAmount)}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button
              variant="outline"
              className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={onPrint}
            >
              <Printer className="mr-1.5 size-3.5" />
              KTF Yazdır
            </Button>
            {!isKtfClosed && (
              <Button
                variant="outline"
                className="h-9 rounded-xl border-red-200 bg-white px-4 text-sm text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700"
                onClick={onCloseKtf}
              >
                <XCircle className="mr-1.5 size-3.5" />
                KTF&apos;yi Kapat
              </Button>
            )}
          </div>
        </div>

        {/* Alt bant — Kurye + Şube + Oluşturulma + Kapanış */}
        <div className="grid gap-0 border-t border-slate-200 md:grid-cols-4">
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <div className="flex items-center gap-1.5 text-slate-400">
              <User className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Kurye</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{detail.courierName}</p>
          </div>
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Şube</p>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{detail.branchName}</p>
          </div>
          <div className="border-slate-200 px-6 py-4 md:border-r">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock3 className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Oluşturulma Zamanı</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{formatDateTime(detail.openedAt)}</p>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock3 className="size-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Kapanış Zamanı</p>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700">{detail.closedAt ? formatDateTime(detail.closedAt) : "—"}</p>
          </div>
        </div>

      </CardHeader>
    </Card>
  )
}
