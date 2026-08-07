"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import type { BankAccountDetail } from "../../_types"
import { Copy, Edit3, Power, PowerOff } from "lucide-react"

interface Props {
  bankAccount: BankAccountDetail
  onToggleStatus: () => void
  onEdit: () => void
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function DetailHeaderCard({ bankAccount, onToggleStatus, onEdit }: Props) {
  const isActive = bankAccount.status === "active"

  return (
    <Card className="sticky top-4 z-20 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] px-0 py-0">
        {/* Üst bant — Title + IBAN + Badges + Buttons */}
        <div className="flex flex-col gap-4 px-6 pt-6 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Banka Hesabı Detay</p>
            <h1 className="text-2xl font-semibold text-slate-900">{bankAccount.label}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button asChild variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50">
              <Link href="/arf/cargo/finance/headquarters/bank-accounts">Listeye Dön</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50" onClick={() => void navigator.clipboard?.writeText(bankAccount.iban)}>
              <Copy className="mr-1.5 size-3.5" />
              IBAN Kopyala
            </Button>
            <Button type="button" variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50" onClick={onToggleStatus}>
              {isActive ? <PowerOff className="mr-1.5 size-3.5" /> : <Power className="mr-1.5 size-3.5" />}
              {isActive ? "Pasif Yap" : "Aktif Yap"}
            </Button>
            <Button type="button" className="h-9 rounded-xl px-4 text-sm" onClick={onEdit}>
              <Edit3 className="mr-1.5 size-3.5" />
              Düzenle
            </Button>
          </div>
        </div>

        {/* Alt bant — Grid bilgileri */}
        <div className="grid gap-0 border-t border-slate-200 md:grid-cols-2 lg:grid-cols-4">
          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Banka İsmi</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.bankName}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:col-start-1 md:border-r lg:border-r lg:col-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Banka Şubesi</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.branchName}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">IBAN</p>
            <p className="mt-1.5 font-mono text-sm font-medium text-slate-900">{bankAccount.iban.replace(/(.{4})/g, "$1 ").trim()}</p>
          </div>

          <div className="border-slate-200 px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hesap Türü</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.accountType === "collection" ? "Tahsilat Hesabı" : "Gider / Ödeme Hesabı"}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hesap Sahibi</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.accountHolder}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Durum</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{isActive ? "Aktif" : "Pasif"}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:col-start-1 md:border-r lg:border-r lg:col-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Entegrasyon</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.integrationStatus === "active" ? "Aktif" : "Pasif"}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Oluşturan</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.createdByName || "—"}</p>
          </div>

          <div className="border-slate-200 px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Oluşturulma</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{formatDateTime(bankAccount.createdAt)}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Güncelleme</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{formatDateTime(bankAccount.updatedAt)}</p>
          </div>

          <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Son Veri Güncelleme</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.lastDataSyncAt ? formatDateTime(bankAccount.lastDataSyncAt) : "—"}</p>
          </div>

          <div className="border-slate-200 px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Görünürlük</p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{bankAccount.isOpenToAllBranches ? "Tüm Şubeler" : "Seçili Şubeler"}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
