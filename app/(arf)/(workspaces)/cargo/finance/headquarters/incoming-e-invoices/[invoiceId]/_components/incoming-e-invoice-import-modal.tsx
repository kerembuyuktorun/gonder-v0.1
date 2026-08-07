"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Info, Search, UserRound } from "lucide-react"

const schema = z.object({
  rememberSupplier: z.enum(["yes", "no"]),
  matchedSupplier: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  supplierOptions: string[]
  onConfirm: (values: FormValues) => void
}

export function IncomingEInvoiceImportModal({
  open,
  onOpenChange,
  supplierName,
  supplierOptions,
  onConfirm,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rememberSupplier: "yes",
      matchedSupplier: "",
    },
  })

  const rememberSupplier = form.watch("rememberSupplier")
  const matchedSupplier = form.watch("matchedSupplier") ?? ""

  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("tr-TR")
    if (!q) return supplierOptions
    return supplierOptions.filter((o) => o.toLocaleLowerCase("tr-TR").includes(q))
  }, [searchQuery, supplierOptions])

  const primaryActionLabel = rememberSupplier === "no"
    ? "Devam Et"
    : matchedSupplier.trim()
      ? "Eşleştir ve Devam Et"
      : "Yeni Kayıt Oluştur ve Devam Et"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-900">Tedarikçiyi Eşleştir</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onConfirm(values)
              onOpenChange(false)
            })}
          >
            <div className="space-y-5 px-6 pb-6">
              <p className="text-sm text-slate-600">
                Tedarikçi bilgisinin kaydedilerek hatırlanmasını istiyor musunuz?
              </p>

              <FormField
                control={form.control}
                name="rememberSupplier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex items-center gap-6"
                      >
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                          <RadioGroupItem value="yes" />
                          <span>Evet</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                          <RadioGroupItem value="no" />
                          <span>Hayır</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {rememberSupplier === "yes" && !matchedSupplier.trim() && (
                <div className="flex items-start gap-2.5 rounded-lg bg-slate-100 px-3.5 py-3 text-sm text-slate-600">
                  <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <p>
                    Tedarikçi kayıtlarınızda bulunamadı ve <strong className="text-slate-800">yeni bir firma olarak kaydedilecek.</strong>{" "}
                    Dilerseniz müşteriyi mevcut bir kayıtla eşleştirebilirsiniz.
                  </p>
                </div>
              )}

              {rememberSupplier === "yes" && (
                <>
                  <div className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-slate-500">Faturadaki Tedarikçi</FormLabel>
                    <Input value={supplierName} readOnly className="h-10 bg-slate-50 text-sm text-slate-700" />
                  </div>

                  <FormField
                    control={form.control}
                    name="matchedSupplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-slate-500">Eşleşeceği Tedarikçi</FormLabel>
                        <FormControl>
                          <div className="relative" ref={dropdownRef}>
                            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              value={field.value ? field.value : searchQuery}
                              placeholder="Tedarikçi"
                              className="h-10 pl-9 pr-9 text-sm"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setSearchQuery(e.target.value)
                                if (field.value) {
                                  field.onChange("")
                                }
                                setIsDropdownOpen(true)
                              }}
                              onFocus={() => setIsDropdownOpen(true)}
                              onBlur={() => {
                                setTimeout(() => setIsDropdownOpen(false), 150)
                              }}
                            />
                            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                            {isDropdownOpen && filteredOptions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                                {filteredOptions.map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      field.onChange(option)
                                      setSearchQuery("")
                                      setIsDropdownOpen(false)
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

            </div>

            <DialogFooter className="flex-row justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button type="button" variant="outline" className="h-10 px-6 text-sm" onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <Button type="submit" className="h-10 px-6 text-sm">
                {primaryActionLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
