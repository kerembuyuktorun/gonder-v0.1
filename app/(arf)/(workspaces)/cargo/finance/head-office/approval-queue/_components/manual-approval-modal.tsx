"use client"

import { useEffect, useMemo, useState } from "react"
import type { IncomingBankTransactionMatchCandidate } from "../../../headquarters/bank-accounts/_api/bank-accounts-api"
import type { ApprovalQueueRecord } from "../_types"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: ApprovalQueueRecord | null
  candidates: IncomingBankTransactionMatchCandidate[]
  loading: boolean
  onConfirm: (candidate: IncomingBankTransactionMatchCandidate) => Promise<void>
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
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

function normalizeReference(value?: string): string {
  return (value ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/[^0-9A-Z]/g, "")
}

export function ManualApprovalModal({
  open,
  onOpenChange,
  row,
  candidates,
  loading,
  onConfirm,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const strictCandidates = useMemo(() => {
    if (!row) {
      return []
    }

    const normalizedRef = normalizeReference(row.sorguNo)
    return candidates.filter(
      (candidate) => normalizeReference(candidate.referenceNumber) === normalizedRef,
    )
  }, [candidates, row])

  useEffect(() => {
    if (!open) {
      setSelectedId("")
      setSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (selectedId && !strictCandidates.some((candidate) => candidate.transactionId === selectedId)) {
      setSelectedId("")
    }
  }, [selectedId, strictCandidates])

  const selectedCandidate = useMemo(
    () => strictCandidates.find((candidate) => candidate.transactionId === selectedId),
    [strictCandidates, selectedId],
  )

  if (!row) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Manuel Onay</DialogTitle>
          <DialogDescription>
            Beklemede olan transfer için, banka hesap hareketlerindeki gelen işlemi Referans No ile eşleştirip onaylayın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Transfer ID</p>
              <p className="font-medium text-slate-900">{row.transferNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Referans No</p>
              <p className="font-medium text-slate-900">{row.sorguNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tutar</p>
              <p className="font-medium text-slate-900">{formatMoney(row.transferTutari)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Durum</p>
              <p className="font-medium text-slate-900">{row.durum === "beklemede" ? "Beklemede" : "Beklemede Değil"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Eşleşen Gelen İşlem</p>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={loading || strictCandidates.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Eşleşen işlemler yükleniyor..." : "İşlem seçin"} />
              </SelectTrigger>
              <SelectContent>
                {strictCandidates.map((candidate) => (
                  <SelectItem key={candidate.transactionId} value={candidate.transactionId}>
                    {candidate.bankAccountLabel} · {formatMoney(candidate.amount)} · {formatDateTime(candidate.transactionDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loading && strictCandidates.length === 0 && (
              <p className="text-xs text-amber-700">
                Bu referans numarası için banka hesap hareketlerinde gelen işlem bulunamadı.
              </p>
            )}
          </div>

          {selectedCandidate && (
            <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Hesap İsmi</p>
                <p className="font-medium text-slate-900">{selectedCandidate.bankAccountLabel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Banka İsmi ve Şubesi</p>
                <p className="font-medium text-slate-900">{selectedCandidate.bankName} / {selectedCandidate.branchName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Gönderici İsmi</p>
                <p className="font-medium text-slate-900">{selectedCandidate.senderName ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Gönderici IBAN</p>
                <p className="font-mono text-sm text-slate-900">{selectedCandidate.senderIban ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Alıcı Hesap IBAN</p>
                <p className="font-mono text-sm text-slate-900">{selectedCandidate.bankAccountIban}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">İşlem Tarihi</p>
                <p className="font-medium text-slate-900">{formatDateTime(selectedCandidate.transactionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Referans No</p>
                <p className="font-medium text-slate-900">{selectedCandidate.referenceNumber ?? "-"}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={!selectedCandidate || loading || submitting || row.durum !== "beklemede"}
            onClick={async () => {
              if (!selectedCandidate) {
                return
              }
              setSubmitting(true)
              try {
                await onConfirm(selectedCandidate)
                onOpenChange(false)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {submitting ? "Onaylanıyor..." : "Manuel Onayla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
