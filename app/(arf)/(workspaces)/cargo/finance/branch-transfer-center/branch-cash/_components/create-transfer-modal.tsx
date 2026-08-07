"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { RHFFileUploader } from "@hascanb/arf-ui-kit/file-kit"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import type { BranchCashItem, ValidationResult } from "../_types"
import { mockTransferRecords } from "../_mock/branch-cash-mock-data"

const SAFE_IBANS = [
  { label: "TR33 0006 1005 1978 6457 8413 26 — GM Ana Hesap", value: "TR33 0006 1005 1978 6457 8413 26" },
  { label: "TR82 0001 2009 4520 0058 0000 26 — GM Yedek Hesap", value: "TR82 0001 2009 4520 0058 0000 26" },
]

const transferSchema = z.object({
  targetIban: z.string().min(1, "IBAN seçimi zorunludur"),
  queryNumberManual: z.string().min(5, "Sorgu numarası en az 5 karakter olmalıdır"),
  queryNumberDecont: z.string().min(1, "Dekont sorgu numarası zorunludur"),
  decontAmount: z.number().min(0.01, "Dekont tutarı girilmelidir"),
  decontFile: z.array(z.instanceof(File)).min(1, "Dekont PDF yüklemesi zorunludur"),
  notes: z.string().optional(),
})

type TransferFormValues = z.infer<typeof transferSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: BranchCashItem[]
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(isoString?: string): string {
  if (!isoString) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoString))
}

const paymentTypeLabels: Record<string, string> = {
  alici_odemeli: "Alıcı Ödemeli",
  pesin: "Peşin",
}

const statusLabels: Record<string, string> = {
  teslim_edildi: "Teslim Edildi",
  bekliyor: "Bekliyor",
  iptal: "İptal",
}

const statusClassNames: Record<string, string> = {
  teslim_edildi: "bg-green-500/10 text-green-700 border-green-500/20",
  bekliyor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  iptal: "bg-red-500/10 text-red-600 border-red-500/20",
}

export function CreateTransferModal({ open, onOpenChange, selectedItems }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSelectedAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.amount, 0),
    [selectedItems],
  )

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      targetIban: "",
      queryNumberManual: "",
      queryNumberDecont: "",
      decontAmount: 0,
      decontFile: [],
      notes: "",
    },
  })

  const watchedValues = form.watch()

  const validations: ValidationResult[] = useMemo(() => {
    const approvedQueryNumbers = mockTransferRecords
      .filter((r) => r.status === "approved")
      .map((r) => r.queryNumber)

    const l1Pass =
      watchedValues.decontAmount > 0 &&
      Math.abs(watchedValues.decontAmount - totalSelectedAmount) < 0.01

    const l2Pass =
      watchedValues.queryNumberManual.length >= 5 &&
      watchedValues.queryNumberDecont.length >= 5 &&
      watchedValues.queryNumberManual === watchedValues.queryNumberDecont

    const l3Pass =
      watchedValues.queryNumberManual.length >= 5 &&
      !approvedQueryNumbers.includes(watchedValues.queryNumberManual)

    return [
      {
        level: "L1",
        label: "Tutar Eşitliği",
        description: `Dekonttaki tutar (${formatMoney(watchedValues.decontAmount)}) ile seçilen takiplerin toplamı (${formatMoney(totalSelectedAmount)}) eşit olmalıdır`,
        status: l1Pass ? "pass" : "fail",
      },
      {
        level: "L2",
        label: "Referans No Eşitliği",
        description: "Dekont referans no ile sisteme girilen referans no aynı olmalıdır",
        status: l2Pass ? "pass" : "fail",
      },
      {
        level: "L3",
        label: "Tekillik",
        description: "Bu referans no daha önce onaylanmış bir transferde bulunmamalıdır",
        status: l3Pass ? "pass" : "fail",
      },
    ]
  }, [watchedValues, totalSelectedAmount])

  const passCount = validations.filter((v) => v.status === "pass").length
  const canSubmit = passCount === 3
  const progressPercent = (passCount / 3) * 100

  const progressBarColor =
    passCount === 0
      ? "bg-slate-200"
      : passCount === 1
        ? "bg-red-500"
        : passCount === 2
          ? "bg-amber-500"
          : "bg-green-500"

  async function onSubmit(values: TransferFormValues) {
    setIsSubmitting(true)
    try {
      // TODO: Replace with real API call
      void values
      void selectedItems
      void totalSelectedAmount
      await new Promise((resolve) => setTimeout(resolve, 800))
      form.reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[1240px]! overflow-hidden rounded-2xl border border-slate-200 p-0">
        <DialogHeader className="border-b border-slate-200 bg-linear-to-r from-slate-50 to-white px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Transfer Oluştur (Şube → Genel Merkez)
          </DialogTitle>

          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Doğrulama İlerlemesi</span>
              <span>{passCount}/3 kriter sağlandı</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all duration-300", progressBarColor)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[78vh] flex-col">
            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <FormField
                  control={form.control}
                  name="targetIban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genel Merkez IBAN</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="IBAN seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SAFE_IBANS.map((iban) => (
                            <SelectItem key={iban.value} value={iban.value}>
                              {iban.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="queryNumberManual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referans Numarası</FormLabel>
                        <FormControl>
                          <Input placeholder="REF-984211" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="queryNumberDecont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dekont Referans Numarası</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="REF-984211"
                            className="h-10 cursor-not-allowed bg-slate-50 text-slate-500 pointer-events-none"
                            readOnly
                            disabled
                            tabIndex={-1}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decontAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dekont Tutarı (₺)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="h-10"
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-1">
                    <FormLabel>Ödenecek Tutar</FormLabel>
                    <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold tabular-nums text-slate-900">
                      {formatMoney(totalSelectedAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                  <FormField
                    control={form.control}
                    name="decontFile"
                    render={() => (
                      <FormItem>
                        <FormLabel>Dekont PDF</FormLabel>
                        <FormControl>
                          <RHFFileUploader
                            control={form.control}
                            name="decontFile"
                            accept="application/pdf"
                            multiple={false}
                            maxFiles={1}
                            maxSizeMb={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedItems.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                    <FormLabel>Seçili Kargolar ({selectedItems.length} adet)</FormLabel>
                    <div className="mt-2 max-h-64 overflow-auto rounded-md border border-slate-200">
                      <table className="min-w-[1080px] w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Takip No</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Ödeme Türü</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Gönderici Şube</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Alıcı Şube</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Kargo Durumu</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Oluşturulma Zamanı</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Teslimat Zamanı</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">Toplam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 font-mono">{item.trackingNo}</td>
                              <td className="px-3 py-2 text-slate-600">{paymentTypeLabels[item.paymentType]}</td>
                              <td className="px-3 py-2 text-slate-600">{item.senderBranch}</td>
                              <td className="px-3 py-2 text-slate-600">{item.receiverBranch}</td>
                              <td className="px-3 py-2">
                                <Badge variant="outline" className={statusClassNames[item.status]}>
                                  {statusLabels[item.status]}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-slate-600">{formatDate(item.createdAt)}</td>
                              <td className="px-3 py-2 text-slate-600">{formatDate(item.deliveredAt)}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{formatMoney(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {validations.map((v) => (
                  <div
                    key={v.level}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      v.status === "pass"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {v.status === "pass" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          v.status === "pass" ? "text-green-700" : "text-red-700",
                        )}
                      >
                        {v.level} – {v.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        v.status === "pass" ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ek açıklama..." className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="h-10 gap-2 rounded-xl px-5"
              >
                <Lock className="size-4" />
                {isSubmitting ? "Gönderiliyor..." : "Genel Merkeze Gönder"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
