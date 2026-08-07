"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser, findExistingUserByEmail } from "../_api/users-api"
import type { LocationOption, UserRecord } from "../_types"
import { USER_ROLE_LABELS, USER_ROLE_REQUIRES_LOCATION } from "../_types"
import type { UserRole } from "../_types/user"

const phoneRegex = /^(\+90|0)?\s?[1-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/

const formSchema = z
  .object({
    firstName: z.string().min(2, "Ad zorunludur."),
    lastName: z.string().min(2, "Soyad zorunludur."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phoneNumber: z.string().regex(phoneRegex, "Geçerli bir telefon numarası giriniz."),
    role: z.enum([
      "superadmin",
      "hq_manager",
      "tm_manager",
      "branch_manager",
      "courier",
      "operator",
    ] as const),
    locationId: z.string().nullable(),
  })
  .superRefine((val, ctx) => {
    if (USER_ROLE_REQUIRES_LOCATION[val.role] && !val.locationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locationId"],
        message: "Bu rol için birim seçimi zorunludur.",
      })
    }
  })

type WizardFormValues = z.infer<typeof formSchema>

interface Props {
  locations: LocationOption[]
  onCancel: () => void
  onSubmit: (created: UserRecord) => Promise<void>
}

export function UserCreationWizard({ locations, onCancel, onSubmit }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicateEmailError, setDuplicateEmailError] = useState<string | null>(null)

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "operator",
      locationId: null,
    },
  })

  const selectedRole = form.watch("role") as UserRole
  const requiresLocation = USER_ROLE_REQUIRES_LOCATION[selectedRole]

  async function handleStep1Next() {
    const valid = await form.trigger(["firstName", "lastName", "email", "phoneNumber"])
    if (!valid) return

    const email = form.getValues("email")
    const existing = await findExistingUserByEmail(email)
    if (existing) {
      setDuplicateEmailError("Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.")
      form.setError("email", { message: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut." })
      return
    }
    setDuplicateEmailError(null)
    setStep(2)
  }

  async function handleStep2Next() {
    const valid = await form.trigger(["role", "locationId"])
    if (!valid) return
    setStep(3)
  }

  async function handleFinalSubmit() {
    const values = form.getValues()
    setIsSubmitting(true)
    try {
      const created = await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: values.role,
        locationId: values.locationId,
      })
      await onSubmit(created)
    } finally {
      setIsSubmitting(false)
    }
  }

  const values = form.watch()

  const filteredLocations = requiresLocation
    ? locations.filter((loc) => {
        if (selectedRole === "tm_manager") return loc.type === "tm"
        if (selectedRole === "branch_manager") return loc.type === "branch"
        return loc.type !== "hq"
      })
    : []

  return (
    <Form {...form}>
      {/* Adım göstergesi */}
      <div className="mb-6 flex items-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                step === s
                  ? "bg-slate-900 text-white"
                  : step > s
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className="h-px w-8 bg-slate-200" />}
          </div>
        ))}
        <span className="ml-2 text-sm text-slate-500">
          {step === 1 && "Hesap Bilgileri"}
          {step === 2 && "Rol ve Birim"}
          {step === 3 && "Özet ve Onay"}
        </span>
      </div>

      {/* --- Adım 1 --- */}
      {step === 1 && (
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Kişi Bilgileri</h3>
              <p className="text-xs text-slate-500">Kullanıcının adı ve soyadını girin.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Yılmaz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">İletişim Bilgileri</h3>
              <p className="text-xs text-slate-500">
                E-posta adresi giriş kimliği olarak kullanılır.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta Adresi *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ahmet@sirket.com"
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e)
                          setDuplicateEmailError(null)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {duplicateEmailError && (
                      <p className="text-xs text-red-600">{duplicateEmailError}</p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Numarası *</FormLabel>
                    <FormControl>
                      <Input placeholder="0532 111 22 33" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-700">
              <strong>Güvenlik Notu:</strong> Şifre burada belirlenmez. Kayıt sonrası kullanıcıya
              e-posta ile aktivasyon linki gönderilir; kişi kendi şifresini belirler.
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button type="button" onClick={() => void handleStep1Next()}>
              İleri →
            </Button>
          </div>
        </div>
      )}

      {/* --- Adım 2 --- */}
      {step === 2 && (
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Kullanıcı Rolü</h3>
              <p className="text-xs text-slate-500">
                Rol, kullanıcının sistem içindeki erişim yetkisini belirler.
              </p>
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol Seçiniz *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        field.onChange(value)
                        form.setValue("locationId", null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rol seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {requiresLocation && (
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Bağlı Birim</h3>
                <p className="text-xs text-slate-500">
                  Kullanıcının hangi şube veya transfer merkezine zimmetleneceğini seçin.
                </p>
              </div>
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birim Seçiniz *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value: string) => field.onChange(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Birim seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredLocations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          )}

          {!requiresLocation && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              Seçilen rol (
              <strong>{USER_ROLE_LABELS[selectedRole]}</strong>) tüm sisteme erişim sağlar;
              lokasyon zimmetigerekli değildir.
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              ← Geri
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
              <Button type="button" onClick={() => void handleStep2Next()}>
                İleri →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Adım 3 --- */}
      {step === 3 && (
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Özet</h3>
              <p className="text-xs text-slate-500">
                Bilgileri doğrulayın ve kullanıcıyı oluşturun.
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <dt className="text-xs text-slate-500">Ad Soyad</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {values.firstName} {values.lastName}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <dt className="text-xs text-slate-500">E-posta</dt>
                <dd className="text-sm font-medium text-slate-900">{values.email}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <dt className="text-xs text-slate-500">Telefon</dt>
                <dd className="text-sm font-medium text-slate-900">{values.phoneNumber}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <dt className="text-xs text-slate-500">Rol</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {USER_ROLE_LABELS[values.role as UserRole]}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
                <dt className="text-xs text-slate-500">Bağlı Birim</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {values.locationId
                    ? (locations.find((loc) => loc.id === values.locationId)?.name ?? "—")
                    : "Tüm Sistem (Genel Merkez)"}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-700">
              Kullanıcı oluşturulduktan sonra e-posta adresine aktivasyon linki gönderilecektir.
              Geçici şifre sistemi tarafından atanacaktır.
            </div>
          </section>

          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              ← Geri
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleFinalSubmit()}
              >
                {isSubmitting ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Form>
  )
}
