"use client"

import { formatMoney } from "../../_lib/invoice-presenters"
import type { InvoiceServiceLineSnapshot } from "../../_types/invoice"

const formatNumber = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(value)

interface Props {
  lines: InvoiceServiceLineSnapshot[]
}

export function ServiceLinesDisplay({ lines }: Props) {
  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Hizmet / ürün kalemi bulunamadı.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <div key={line.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-medium text-slate-400">Satır {index + 1}</div>
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="mb-1.5 text-xs text-slate-500">Hizmet / Ürün</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm font-medium text-slate-700">{line.aciklama}</span>
              </div>
            </div>
            <div className="lg:col-span-1">
              <p className="mb-1.5 text-xs text-slate-500">Miktar</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm text-slate-600">{line.miktar}</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs text-slate-500">Birim</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm text-slate-600">{line.birim}</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs text-slate-500">Birim Fiyat</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm text-slate-600">{formatNumber(line.birimFiyat)}</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs text-slate-500">Vergi</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm text-slate-600">%{line.kdvOran}</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs text-slate-500">Toplam</p>
              <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm font-semibold text-slate-900">{formatMoney(line.toplamTutar)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
