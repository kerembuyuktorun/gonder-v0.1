"use client"

import { type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, X } from "lucide-react"
import { TOPLAM_EK_AKSIYONLARI } from "../_mock/invoice-create-mock-data"
import type { FaturaDovizi, FaturaEkKalem, FaturaEkKalemTipi, InvoiceComputedTotals } from "../_types"

const ARA_TOPLAM_EKLERI: FaturaEkKalemTipi[] = [
  "subtotal_discount",
  "withholding_20",
  "withholding_17",
  "withholding_15",
  "withholding_10",
  "withholding_5",
  "withholding_3",
]
const KDV_EKLERI: FaturaEkKalemTipi[] = [
  "vat_withholding_10_10",
  "vat_withholding_9_10",
  "vat_withholding_7_10",
  "vat_withholding_5_10",
  "vat_withholding_4_10",
  "vat_withholding_3_10",
  "vat_withholding_2_10",
]

interface Props {
  doviz: FaturaDovizi
  totals: InvoiceComputedTotals
  ekKalemler: FaturaEkKalem[]
  onAddEkKalem: (type: FaturaEkKalemTipi) => void
  onRemoveEkKalem: (id: string) => void
  onUpdateEkKalemAmount: (id: string, amount: number) => void
  onClearTevkifat: (ratio: string) => void
}

function formatMoney(amount: number, currency: FaturaDovizi): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatSignedMoney(amount: number, currency: FaturaDovizi): string {
  if (amount < 0) {
    return `(${formatMoney(Math.abs(amount), currency)})`
  }

  return formatMoney(amount, currency)
}

function renderExtraLabel(ekKalem: FaturaEkKalem) {
  return <span className="text-slate-700">{ekKalem.label}</span>
}

export function FaturaToplamlarCard({
  doviz,
  totals,
  ekKalemler,
  onAddEkKalem,
  onRemoveEkKalem,
  onUpdateEkKalemAmount,
  onClearTevkifat,
}: Props) {
  const araToplamEkleri = ekKalemler.filter((item) => ARA_TOPLAM_EKLERI.includes(item.type))
  const hasAnyStopaj = ekKalemler.some((item) => item.type.startsWith("withholding_"))
  const hasAnyVatWithholding = totals.withholdingRows.length > 0

  const renderAddButton = (types: FaturaEkKalemTipi[]) => {
    const menuItems = TOPLAM_EK_AKSIYONLARI.filter((item) => {
      if (!types.includes(item.type)) {
        return false
      }

      if (item.type.startsWith("withholding_") && hasAnyStopaj) {
        return false
      }

      if (item.type.startsWith("vat_withholding_") && hasAnyVatWithholding) {
        return false
      }

      return true
    })

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="size-8 shrink-0 rounded-md">
            <Plus className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.type} onClick={() => onAddEkKalem(item.type)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const renderExtraRow = (ekKalem: FaturaEkKalem) => (
    <div key={ekKalem.id} className="flex items-center justify-between border-t border-slate-200 py-3 text-sm">
      {renderExtraLabel(ekKalem)}
      <div className="flex items-center gap-3">
        {ekKalem.type === "subtotal_discount" ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              className="h-8 w-28"
              value={Math.abs(ekKalem.amount)}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const nextValue = Math.max(0, Number(event.target.value) || 0)
                onUpdateEkKalemAmount(ekKalem.id, -nextValue)
              }}
            />
            <span className="text-xs text-slate-500">TL</span>
          </div>
        ) : (
          <span className={ekKalem.amount >= 0 ? "font-medium text-slate-900" : "font-medium text-slate-700"}>
            {formatSignedMoney(ekKalem.amount, doviz)}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded-md text-slate-500 hover:text-slate-700"
          onClick={() => onRemoveEkKalem(ekKalem.id)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )

  const renderWithholdingRow = (row: InvoiceComputedTotals["withholdingRows"][number]) => (
    <div key={row.ratio} className="flex items-center justify-between border-t border-slate-200 py-3 text-sm">
      <span className="text-slate-700">{row.label}</span>
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-700">{formatSignedMoney(-row.amount, doviz)}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded-md text-slate-500 hover:text-slate-700"
          onClick={() => onClearTevkifat(row.ratio)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">Toplamlar</CardTitle>
      </CardHeader>

      <CardContent className="space-y-0">
        <div className="flex items-center justify-between py-3 text-sm text-slate-700">
          <span>Ara Toplam</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formatMoney(totals.lineGrossTotal, doviz)}</span>
            {renderAddButton(ARA_TOPLAM_EKLERI)}
          </div>
        </div>

        {totals.lineDiscountTotal > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
            <span>Satır İndirimi</span>
            <span className="font-medium text-slate-700">{formatMoney(totals.lineDiscountTotal, doviz)}</span>
          </div>
        )}

        {totals.lineDiscountTotal > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
            <span>Brüt Toplam</span>
            <span className="font-medium text-slate-900">{formatMoney(totals.lineSubTotal, doviz)}</span>
          </div>
        )}

        {totals.lineOtvTotal > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
            <span>Toplam ÖTV</span>
            <span className="font-medium text-slate-900">{formatMoney(totals.lineOtvTotal, doviz)}</span>
          </div>
        )}

        {araToplamEkleri.map(renderExtraRow)}

        <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
          <span>Toplam KDV</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formatMoney(totals.lineVatTotal, doviz)}</span>
            {renderAddButton(KDV_EKLERI)}
          </div>
        </div>

        {totals.withholdingRows.map(renderWithholdingRow)}

        {totals.withholdingRows.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 py-3 text-sm text-slate-700">
            <span>Tevkifat Toplamı</span>
            <span className="font-medium text-slate-700">{formatSignedMoney(-totals.tevkifatTotal, doviz)}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-700">
          <span>Genel Toplam</span>
          <span className="text-base font-semibold text-slate-900">{formatMoney(totals.grandTotal, doviz)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
