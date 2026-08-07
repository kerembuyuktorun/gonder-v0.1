"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TasimaDetayRecord, TeklifKalem, TeklifSonuc } from "../_types/transport-detail"

/* ─── Money Format ─── */

const formatMoney = (value: number) =>
  `₺${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`

/* ─── Result Badge ─── */

const resultConfig: Record<TeklifSonuc, { label: string; className: string }> = {
  beklemede: { label: "Beklemede", className: "text-amber-600" },
  kabul_edildi: { label: "Kabul Edildi", className: "text-emerald-600" },
  reddedildi: { label: "Reddedildi", className: "text-rose-600" },
}

/* ─── OfferTable ─── */

function OfferTable({ rows }: { rows: TeklifKalem[] }) {
  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="px-4 py-3 text-left font-medium text-slate-600">Müşteri</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Önceki Teklifler</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Yeni Teklif</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Sonuç</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      ◎
                    </div>
                    <span className="font-medium text-slate-900">{row.musteri}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-primary">{formatMoney(row.oncekiTeklif)}</span>
                  <span className="ml-1 text-slate-400">›</span>
                </td>
                <td className="px-4 py-4 text-slate-700">{formatMoney(row.yeniTeklif)}</td>
                <td className="px-4 py-4">
                  {row.sonuc === "beklemede" ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-8 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600">
                        Kabul et
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg border-rose-300 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                        Pazarlık yap
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={cn("inline-block size-2 rounded-full", row.sonuc === "kabul_edildi" ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className={cn("text-sm font-medium", resultConfig[row.sonuc].className)}>
                        {resultConfig[row.sonuc].label}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  Henüz teklif bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ─── Tab Component ─── */

export function TabOffers({ data }: { data: TasimaDetayRecord }) {
  const [activeSubTab, setActiveSubTab] = useState<"musteri" | "tasima">("musteri")

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition",
            activeSubTab === "musteri" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
          )}
          onClick={() => setActiveSubTab("musteri")}
        >
          Müşteri Teklifler
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition",
            activeSubTab === "tasima" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
          )}
          onClick={() => setActiveSubTab("tasima")}
        >
          Taşıma Teklifler
        </button>
      </div>

      <OfferTable rows={activeSubTab === "musteri" ? data.musteriTeklifler : data.tasimaTeklifler} />
    </div>
  )
}
