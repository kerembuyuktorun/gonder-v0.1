"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createRole,
  fetchRoles,
} from "../_api/roles-api"
import type { RoleDetail, RolePermissions } from "../_types"

const schema = z.object({
  name: z.string().min(3, "Rol adı en az 3 karakter olmalidir."),
  description: z.string().max(250, "Aciklama en fazla 250 karakter olabilir.").optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode?: "create" | "edit"
  initialRole?: RoleDetail
  onCancel: () => void
  onSaved: () => void
}

export function RoleCreationWizard({
  mode: _mode = "create",
  initialRole,
  onCancel,
  onSaved,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [permissions] = useState<RolePermissions>(initialRole?.permissions ?? {})

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialRole?.name ?? "",
      description: initialRole?.description ?? "",
    },
  })

  async function handleSave() {
    const valid = await form.trigger(["name", "description"])
    if (!valid) return

    const values = form.getValues()
    const existing = await fetchRoles({ q: values.name.trim() })
    const collision = existing.find(
      (role) =>
        role.name.toLocaleLowerCase("tr-TR") === values.name.trim().toLocaleLowerCase("tr-TR") &&
        role.id !== initialRole?.id,
    )

    if (collision) {
      form.setError("name", { message: "Bu isimde bir rol zaten mevcut." })
      return
    }

    setIsSubmitting(true)
    try {
      await createRole({
        name: values.name,
        description: values.description,
        permissions,
      })
      onSaved()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Şube Yöneticisi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Rol hakkında açıklama giriniz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={() => void handleSave()}>
              {isSubmitting ? "Kaydediliyor..." : "Rol Oluştur"}
            </Button>
          </div>
      </div>
    </Form>
  )
}
