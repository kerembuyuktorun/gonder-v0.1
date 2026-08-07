"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency, formatNumber } from "../../_lib/transfer-form-helpers"

interface Props {
  isKtfClosed: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => Promise<{
    totalDeliveries: number
    totalFailed: number
    totalCollection: number
    deferredCargos: string[]
  } | null>
  onAfterClose: () => void
}

export function TransferFormCloseModal({ isKtfClosed, open, onOpenChange, onClose, onAfterClose }: Props) {
  const [isClosing, setIsClosing] = useState(false)
  const [summary, setSummary] = useState<{
    totalDeliveries: number
    totalFailed: number
    totalCollection: number
    deferredCargos: string[]
  } | null>(null)

  async function handleConfirm() {
    setIsClosing(true)
    try {
      const result = await onClose()
      if (result) {
        setSummary(result)
      }
    } finally {
      setIsClosing(false)
    }
  }

  if (isKtfClosed) return null

  return (
    <>
      {/* Aşama 1: Onay */}
      <AlertDialog open={open && !summary} onOpenChange={(v: boolean) => { if (!v) onOpenChange(false) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>KTF&apos;yi Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              Bu transfer formu kapatıldıktan sonra zimmet listesinde değişiklik yapılamayacaktır. Emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isClosing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Evet, Kapat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aşama 2: Başarı Özeti */}
      <AlertDialog open={!!summary} onOpenChange={() => { setSummary(null); onAfterClose() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-700">KTF Kapatıldı</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Teslim Edilen: <strong>{formatNumber(summary?.totalDeliveries ?? 0)}</strong> parça</p>
                <p>Teslim Edilemeyen (Devir): <strong>{formatNumber(summary?.totalFailed ?? 0)}</strong> parça</p>
                <p>Kurye Tahsilat Tutarı: <strong className="text-emerald-700">{formatCurrency(summary?.totalCollection ?? 0)}</strong></p>
                {summary && summary.deferredCargos.length > 0 && (
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                    Devir parçalar depoya döndü: {summary.deferredCargos.join(", ")}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setSummary(null); onAfterClose() }}>
              Kapat & KTF Listesi&apos;ne Dön
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
