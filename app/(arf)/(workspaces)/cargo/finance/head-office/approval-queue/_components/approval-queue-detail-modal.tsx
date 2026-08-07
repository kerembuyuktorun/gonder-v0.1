"use client"

import { useEffect, useMemo, useState } from "react"
import type { IncomingBankTransactionMatchCandidate } from "../../../headquarters/bank-accounts/_api/bank-accounts-api"
import { fetchManualApprovalCandidates } from "../_api/approval-queue-api"
import type { ApprovalQueueRecord } from "../_types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: ApprovalQueueRecord | null
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(date?: string): string {
  if (!date) return "-"

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function statusLabel(status: ApprovalQueueRecord["durum"]): string {
  if (status === "onaylandi") return "Onaylandı"
  if (status === "reddedildi") return "Reddedildi"
  if (status === "yarida_birakildi") return "Yarıda Bırakıldı"
  if (status === "dogrulama_hatasi") return "Doğrulama Hatası"
  return "Beklemede"
}

function approvalInfoStatusLabel(status: "manual" | "auto" | "none"): string {
  if (status === "manual") return "Manuel"
  if (status === "auto") return "Otomatik"
  return "Onay Yok"
}

export function ApprovalQueueDetailModal({ open, onOpenChange, row }: Props) {
  const [candidates, setCandidates] = useState<IncomingBankTransactionMatchCandidate[]>([])

  useEffect(() => {
    let cancelled = false

    if (!open || !row) {
      setCandidates([])
      return
    }

    void (async () => {
      const result = await fetchManualApprovalCandidates(row.sorguNo)
      if (!cancelled) {
        setCandidates(result)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, row])

  const matchedCandidate = useMemo(() => {
    if (!row) {
      return undefined
    }

    if (row.matchedBankTransactionId) {
      return candidates.find((candidate) => candidate.transactionId === row.matchedBankTransactionId)
    }

    return candidates[0]
  }, [candidates, row])

  if (!row) {
    return null
  }

  const senderName = matchedCandidate?.senderName?.trim() ? matchedCandidate.senderName : "-"
  const senderIban = senderName !== "-" && matchedCandidate?.senderIban ? matchedCandidate.senderIban : "-"
  const canShowReceiverInfo = row.durum === "onaylandi"
  const receiverBankBranch = canShowReceiverInfo && matchedCandidate
    ? `${matchedCandidate.bankName} / ${matchedCandidate.branchName}`
    : "-"
  const receiverAccountName = canShowReceiverInfo && matchedCandidate?.bankAccountLabel
    ? matchedCandidate.bankAccountLabel
    : "-"
  const isApproved = row.durum === "onaylandi"
  const isManuallyApproved = isApproved && Boolean(row.manuelOnaylayanKullanici)
  const isAutoApproved = isApproved && !isManuallyApproved
  const approvalStatus: "manual" | "auto" | "none" = isManuallyApproved
    ? "manual"
    : isAutoApproved
      ? "auto"
      : "none"
  const approvalApprover = isManuallyApproved
    ? row.manuelOnaylayanKullanici
    : isAutoApproved
      ? "Sistem"
      : "-"
  const approvalDate = isApproved ? formatDateTime(row.onayTarihi) : "-"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>{row.transferNo} Detayı</DialogTitle>
          <DialogDescription>
            Onay kuyruğu transfer kaydının detay ve onaylama bilgileri.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Transfer ID</p>
              <p className="font-medium text-slate-900">{row.transferNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Durum</p>
              <p className="font-medium text-slate-900">{statusLabel(row.durum)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Şube</p>
              <p className="font-medium text-slate-900">{row.branchName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Referans No</p>
              <p className="font-medium text-slate-900">{row.sorguNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Transferi Oluşturan</p>
              <p className="font-medium text-slate-900">{row.olusturanKullanici}</p>
            </div>
                        <div>
              <p className="text-xs text-slate-500">Transfer Tarihi</p>
              <p className="font-medium text-slate-900">{formatDateTime(row.talepTarihi)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tutar</p>
              <p className="font-medium text-slate-900">{formatMoney(row.transferTutari)}</p>
            </div>

          </div>

          <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Gönderici İsmi</p>
              <p className="font-medium text-slate-900">{senderName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Gönderici IBAN</p>
              <p className="font-mono text-sm text-slate-900">{senderIban}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Alıcı Banka İsmi ve Şubesi</p>
              <p className="font-medium text-slate-900">{receiverBankBranch}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Alıcı Hesap İsmi</p>
              <p className="font-medium text-slate-900">{receiverAccountName}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Onaylama Bilgileri</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Onay Durumu</p>
                <p className="font-medium text-slate-900">{approvalInfoStatusLabel(approvalStatus)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Onaylayan Kullanıcı</p>
                <p className="font-medium text-slate-900">{approvalApprover}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Onay Tarihi</p>
                <p className="font-medium text-slate-900">{approvalDate}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
