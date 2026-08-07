"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Building2, Check, Copy, FileText, Briefcase, Warehouse } from "lucide-react"
import type { BranchDetail, BranchDocumentType } from "../_types"

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-slate-800">{value ?? <span className="text-slate-400">-</span>}</dd>
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value?: string | null }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value) return
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="flex items-center justify-end gap-2 text-slate-800">
        <span>{value ?? <span className="text-slate-400">-</span>}</span>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        )}
      </dd>
    </div>
  )
}

const documentTypeLabels: Record<BranchDocumentType, string> = {
  vergi_levhasi: "Vergi Levhası",
  sozlesme: "Sözleşme",
  imza_sirkuleri: "İmza Sirküleri",
  diger: "Diğer",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function maskIban(iban?: string) {
  if (!iban) return undefined
  const cleaned = iban.replace(/\s+/g, "")
  if (cleaned.length < 8) return iban
  return `${cleaned.slice(0, 4)} **** **** **** ${cleaned.slice(-4)}`
}

function parseWorkingSchedule(schedule?: string) {
  if (!schedule) return { days: undefined, hours: undefined }

  const match = schedule.match(/^(.*?)\s+(\d{2}:\d{2}-\d{2}:\d{2})$/)
  if (!match) return { days: undefined, hours: schedule }

  return {
    days: match[1],
    hours: match[2],
  }
}

interface Props {
  branch: BranchDetail
}

export function DetailInfoSection({ branch }: Props) {
  const documents = branch.documents
  const workingSchedule = parseWorkingSchedule(branch.calismaSaatleri)
  const maskedIban = maskIban(branch.iban)
  const manager = branch.managerUserId
    ? branch.users.find((user) => user.id === branch.managerUserId)
    : undefined
  const managerName = manager ? `${manager.firstName} ${manager.lastName}` : undefined

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 className="size-4 text-slate-400" />
              Şube Bilgileri
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl>
              <InfoRow label="İl" value={branch.il} />
              <InfoRow label="İlçe" value={branch.ilce} />
              <InfoRow label="Mahalle" value={branch.mahalle} />
              <InfoRow label="Açık Adres" value={branch.acikAdres} />
              <InfoRow label="Şube Telefon" value={branch.telefon} />
              <InfoRow label="Şube E-posta" value={branch.eposta} />
              <InfoRow label="Çalışma Günleri" value={workingSchedule.days} />
              <InfoRow label="Çalışma Saatleri" value={workingSchedule.hours} />
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 text-sm last:border-b-0">
                <dt className="font-medium text-slate-500">Şube Yöneticisi</dt>
                <dd className="text-right">
                  {managerName && branch.managerUserId ? (
                    <Link
                      href={`/arf/cargo/settings/users/${branch.managerUserId}`}
                      className="font-medium text-slate-800 underline-offset-2 hover:text-slate-600 hover:underline"
                    >
                      {managerName}
                    </Link>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Briefcase className="size-4 text-slate-400" />
              Şube Acente Bilgileri
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl>
              <InfoRow label="Vergi Dairesi" value={branch.vergiDairesi} />
              <InfoRow label="VKN" value={branch.vkn} />
              <InfoRow label="Acente Sahibi" value={branch.acenteSahibi} />
              <InfoRow label="Telefon" value={branch.acenteSahibiTelefon} />
              <InfoRow label="E-Posta" value={branch.acenteSahibiEposta} />
              <InfoRow label="Alım Hakediş Oranı" value={branch.alimHakedisOrani != null ? `%${Math.round(branch.alimHakedisOrani * 100)}` : undefined} />
              <InfoRow label="Dağıtım Hakediş Oranı" value={branch.dagitimHakedisOrani != null ? `%${Math.round(branch.dagitimHakedisOrani * 100)}` : undefined} />
              <InfoRow label="Banka Adı" value={branch.bankAdi} />
              <CopyRow label="IBAN" value={maskedIban} />
              <CopyRow label="Banka Hesap İsmi" value={branch.hesapSahibi} />
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="size-4 text-slate-400" />
              Şube Acente Dosyaları
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                <FileText className="size-8" />
                <p className="text-sm">Henüz dosya yüklenmemiş</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((document) => (
                  <li key={document.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800">{documentTypeLabels[document.type]}</p>
                        <p className="text-xs text-slate-500">
                          {formatBytes(document.fileSize)} • {new Date(document.uploadedAt).toLocaleDateString("tr-TR")} • {document.uploadedBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <a href={document.url} target="_blank" rel="noreferrer">
                            İndir
                          </a>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Warehouse className="size-4 text-slate-400" />
              Bağlı Transfer Merkezi
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {branch.bagliMerkezId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <dl>
                  <InfoRow label="Merkez Adı" value={branch.bagliMerkezAdi} />
                  <InfoRow label="Merkez Kodu" value={branch.bagliMerkezKodu} />
                  <InfoRow label="Şehir" value={branch.bagliMerkezSehir} />
                </dl>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link href={`/arf/cargo/settings/transfer-centers/${branch.bagliMerkezId}`}>
                      Detayı Görüntüle
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Bağlı merkez bulunamadı.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
