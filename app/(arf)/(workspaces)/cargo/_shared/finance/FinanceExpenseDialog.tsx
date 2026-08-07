"use client"

import { type ChangeEvent, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { calculateTotals, type FinanceWithholdingBase } from "./calculateTotals"

interface FinanceOption {
  value: string
  label: string
}

interface FinanceExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  description: string
  amountPlaceholder: string
  includeDate?: boolean
  withholdingBase: FinanceWithholdingBase
  tevkifatOptions: FinanceOption[]
  kdvOptions: FinanceOption[]
  totalClassName?: string
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  )
}

export function FinanceExpenseDialog({
  open,
  onOpenChange,
  supplierName,
  description,
  amountPlaceholder,
  includeDate = false,
  withholdingBase,
  tevkifatOptions,
  kdvOptions,
  totalClassName = "font-bold tabular-nums text-rose-700",
}: FinanceExpenseDialogProps) {
  const [aciklama, setAciklama] = useState("")
  const [tarih, setTarih] = useState("")
  const [birimFiyat, setBirimFiyat] = useState("")
  const [tevkifat, setTevkifat] = useState("yok")
  const [kdvOran, setKdvOran] = useState("20")

  const birim = parseFloat(birimFiyat) || 0
  const { kdvTutar, tevkifatTutar, toplamTutar } = calculateTotals({
    baseAmount: birim,
    kdvRate: parseFloat(kdvOran) || 0,
    tevkifat,
    withholdingBase,
  })

  const resetForm = useCallback(() => {
    setAciklama("")
    setTarih("")
    setBirimFiyat("")
    setTevkifat("yok")
    setKdvOran("20")
  }, [])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }, [onOpenChange, resetForm])

  const handleSubmit = () => {
    handleOpenChange(false)
  }

  const canSubmit = Boolean(aciklama && supplierName && birimFiyat && (!includeDate || tarih))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gider Ekle</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <FormField label="Açıklama">
            <Input placeholder={amountPlaceholder} value={aciklama} onChange={(event: ChangeEvent<HTMLInputElement>) => setAciklama(event.target.value)} />
          </FormField>

          <FormField label="Tedarikçi">
            <Input value={supplierName} disabled className="bg-slate-50 text-slate-600" />
          </FormField>

          <div className={cn("grid gap-3", includeDate ? "grid-cols-2" : "grid-cols-1")}>
            {includeDate ? (
              <FormField label="Tarih">
                <Input type="date" value={tarih} onChange={(event: ChangeEvent<HTMLInputElement>) => setTarih(event.target.value)} />
              </FormField>
            ) : null}
            <FormField label="Birim Fiyat (₺)">
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={birimFiyat} onChange={(event: ChangeEvent<HTMLInputElement>) => setBirimFiyat(event.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tevkifat">
              <Select value={tevkifat} onValueChange={setTevkifat}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tevkifatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="KDV Oranı">
              <Select value={kdvOran} onValueChange={setKdvOran}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kdvOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">KDV Tutarı</p>
                <p className="font-semibold tabular-nums">{formatMoney(kdvTutar)}₺</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tevkifat Tutarı</p>
                <p className="font-semibold tabular-nums">{formatMoney(tevkifatTutar)}₺</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Tutar</p>
                <p className={totalClassName}>{formatMoney(toplamTutar)}₺</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Vazgeç</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
