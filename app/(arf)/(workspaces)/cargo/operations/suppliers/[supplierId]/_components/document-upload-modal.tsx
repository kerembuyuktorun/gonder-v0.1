"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { uploadSupplierDocument } from "../_api/supplier-detail-api"
import type { SupplierDocument } from "../_types"

const schema = z.object({
  documentType: z.enum([
    "vergi_levhasi",
    "imza_sirkuleri",
    "tasima_sozlesmesi",
    "k_belgesi",
    "src_belgesi",
    "trafik_sigortasi",
    "kasko",
    "diger",
  ]),
  label: z.string().optional(),
  expiryDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  vergi_levhasi: "Vergi Levhası",
  imza_sirkuleri: "İmza Sirküleri",
  tasima_sozlesmesi: "Taşıma Sözleşmesi",
  k_belgesi: "K Belgesi",
  src_belgesi: "SRC Belgesi",
  trafik_sigortasi: "Trafik Sigortası",
  kasko: "Kasko",
  diger: "Diğer",
}

interface Props {
  supplierId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (doc: SupplierDocument) => void
}

export function DocumentUploadModal({ supplierId, open, onOpenChange, onUploaded }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentType: undefined,
      label: "",
      expiryDate: "",
    },
  })

  const documentType = form.watch("documentType")

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const label =
        values.label?.trim() ||
        (values.documentType ? DOCUMENT_TYPE_LABELS[values.documentType] : "Evrak")

      const uploaded = await uploadSupplierDocument(supplierId, {
        documentType: values.documentType,
        label,
        expiryDate: values.expiryDate || undefined,
        uploadedAt: new Date().toISOString().split("T")[0],
      })
      form.reset()
      onUploaded(uploaded)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            Evrak Ekle
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evrak Tipi *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {documentType === "diger" && (
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evrak Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Evrak adını giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bitiş Tarihi (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Upload className="mr-1.5 size-4" />
                {isSubmitting ? "Yükleniyor..." : "Evrakı Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
