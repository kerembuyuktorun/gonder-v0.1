"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const schema = z.object({
  rememberProducts: z.enum(["yes", "no"]),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: FormValues) => void
}

export function IncomingEInvoiceProductsModal({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rememberProducts: "yes",
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-900">Hizmet / Ürünleri Eşleştir</DialogTitle>
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
                Faturadaki ürün kalemlerinin kaydedilerek hatırlanmasını istiyor musunuz?
              </p>

              <FormField
                control={form.control}
                name="rememberProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200"
                      >
                        <label className="flex cursor-pointer items-center gap-2 border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                          <RadioGroupItem value="no" />
                          <span>Hayır</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700">
                          <RadioGroupItem value="yes" />
                          <span>Evet</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-row justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button type="button" variant="outline" className="h-10 px-6 text-sm" onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <Button type="submit" className="h-10 px-6 text-sm">
                İçeri Al
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
