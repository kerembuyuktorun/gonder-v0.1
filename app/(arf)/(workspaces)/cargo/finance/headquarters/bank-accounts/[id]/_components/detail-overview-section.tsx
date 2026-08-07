"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { BankAccountDetail } from "../../_types"
import { mockBranches } from "../../../../../settings/branches/_mock/branches-mock-data"

interface Props {
  bankAccount: BankAccountDetail
}

function formatMoney(value: number, currency: BankAccountDetail["currency"]): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function DetailOverviewSection({ bankAccount }: Props) {
  const allowedBranches = mockBranches.filter((branch) => bankAccount.allowedBranchIds.includes(branch.id))
  const accountTypeLabel = bankAccount.accountType === "collection" ? "Tahsilat Hesabı" : "Gider / Ödeme Hesabı"

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Genel Bilgiler</CardTitle>
        <CardDescription>Hesabın finansal, operasyonel ve erişim kapsamına ait tüm bilgiler.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">IBAN</p>
              <p className="font-mono text-sm font-medium text-slate-900">{bankAccount.iban.replace(/(.{4})/g, "$1 ").trim()}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => void navigator.clipboard?.writeText(bankAccount.iban)}
            >
              Kopyala
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Bakiye</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{formatMoney(bankAccount.balance, bankAccount.currency)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Para Birimi</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{bankAccount.currency}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Hesap Türü</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{accountTypeLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Etiket</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{bankAccount.label}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Banka</p>
            <p className="mt-1 font-medium text-slate-900">{bankAccount.bankName}</p>
            <p className="text-sm text-slate-500">{bankAccount.branchName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Hesap Sahibi</p>
            <p className="mt-1 font-medium text-slate-900">{bankAccount.accountHolder}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Operasyon Durumu</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={bankAccount.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}
              >
                {bankAccount.status === "active" ? "Kullanımda" : "Kapalı"}
              </Badge>
              <Badge
                variant="outline"
                className={bankAccount.integrationStatus === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"}
              >
                Entegrasyon {bankAccount.integrationStatus === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Kapsam ve Görünürlük</p>

            {bankAccount.accountType === "expense" ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Bu hesap gider / ödeme hesabıdır ve yalnızca Genel Merkez ekranlarında kullanılmalıdır.
              </div>
            ) : bankAccount.isOpenToAllBranches ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Bu hesap tüm aktif şubelere açıktır.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-slate-800">Sadece seçili şubeler görebilir</p>
                <div className="flex flex-wrap gap-2">
                  {allowedBranches.map((branch) => (
                    <Badge key={branch.id} variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                      <Link href={`/arf/cargo/settings/branches/${branch.id}`}>{branch.ad}</Link>
                    </Badge>
                  ))}
                  {allowedBranches.length === 0 && <span className="text-sm text-slate-500">Whitelist şube bulunmuyor.</span>}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Kayıt Bilgisi</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span>Oluşturan</span>
                <span className="font-medium text-slate-900">{bankAccount.createdByName}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Oluşturulma</span>
                <span className="font-medium text-slate-900">{formatDateTime(bankAccount.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Güncelleme</span>
                <span className="font-medium text-slate-900">{formatDateTime(bankAccount.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {bankAccount.integrationStatus === "active"
            ? "Bu hesap için otomatik ekstre akışı açık. Mutabakat ve eşleştirme ekranları bu hesaptan veri alabilir."
            : "Bu hesapta otomatik entegrasyon kapalı. Hareketler manuel veya dış yükleme ile takip edilir."}
        </div>
      </CardContent>
    </Card>
  )
}
