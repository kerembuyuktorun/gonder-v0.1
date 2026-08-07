"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Save, User } from "lucide-react"

const CITIES = [
  "Adana", "Ankara", "Antalya", "Bursa", "Diyarbakır", "Eskişehir",
  "Gaziantep", "İstanbul", "İzmir", "Kayseri", "Konya", "Mersin",
  "Samsun", "Trabzon",
]

interface FormValues {
  name: string
  code: string
  city: string
  district: string
  address: string
  capacity: string
  managerName: string
  managerPhone: string
  managerEmail: string
  status: "active" | "passive" | "maintenance"
}

const INITIAL: FormValues = {
  name: "",
  code: "",
  city: "",
  district: "",
  address: "",
  capacity: "",
  managerName: "",
  managerPhone: "",
  managerEmail: "",
  status: "active",
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Icon className="size-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <Separator className="mb-4 mx-6" />
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}

export default function TransferMerkeziOlusturPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }))

  const setSelect = (key: keyof FormValues) => (val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }))

  const validate = () => {
    const errs: Partial<Record<keyof FormValues, string>> = {}
    if (!values.name.trim()) errs.name = "Merkez adı zorunludur"
    if (!values.code.trim()) errs.code = "Kod zorunludur"
    if (!values.city) errs.city = "Şehir seçiniz"
    if (!values.capacity || isNaN(Number(values.capacity)) || Number(values.capacity) <= 0)
      errs.capacity = "Geçerli bir kapasite girin"
    if (!values.managerName.trim()) errs.managerName = "Yönetici adı zorunludur"
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    // Mock: navigate to list
    router.push("/arf/cargo/settings/transfer-centers")
  }

  const statusLabels = {
    active: "Aktif",
    passive: "Pasif",
    maintenance: "Bakımda",
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Transfer Merkezleri", href: "/arf/cargo/settings/transfer-centers" },
          { label: "Yeni Transfer Merkezi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        {/* Page title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="size-9 rounded-lg border border-slate-200 bg-white shadow-sm">
              <Link href="/arf/cargo/settings/transfer-centers">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Yeni Transfer Merkezi</h1>
              <p className="mt-0.5 text-sm text-slate-500">Sisteme yeni bir transfer merkezi ekleyin</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 xl:grid-cols-3">
            {/* Sol sütun — Merkez & Adres bilgileri */}
            <div className="space-y-5 xl:col-span-2">
              {/* Merkez Bilgileri */}
              <FormSection title="Merkez Bilgileri" icon={Building2}>
                <FormRow>
                  <Field label="Merkez Adı" required>
                    <Input
                      placeholder="Örn: Konya Transfer Merkezi"
                      value={values.name}
                      onChange={set("name")}
                      className={errors.name ? "border-red-400" : ""}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </Field>
                  <Field label="Kod" required>
                    <Input
                      placeholder="Örn: KNY"
                      value={values.code}
                      onChange={set("code")}
                      maxLength={6}
                      className={`uppercase ${errors.code ? "border-red-400" : ""}`}
                    />
                    {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                  </Field>
                </FormRow>

                <FormRow>
                  <Field label="Şehir" required>
                    <Select value={values.city} onValueChange={setSelect("city")}>
                      <SelectTrigger className={errors.city ? "border-red-400" : ""}>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </Field>
                  <Field label="İlçe">
                    <Input
                      placeholder="Örn: Selçuklu"
                      value={values.district}
                      onChange={set("district")}
                    />
                  </Field>
                </FormRow>

                <FormRow>
                  <Field label="Kapasite (paket)" required>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Örn: 1200"
                      value={values.capacity}
                      onChange={set("capacity")}
                      className={errors.capacity ? "border-red-400" : ""}
                    />
                    {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
                  </Field>
                  <Field label="Durum">
                    <Select value={values.status} onValueChange={setSelect("status")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(statusLabels) as [FormValues["status"], string][]).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FormRow>

                <Field label="Açık Adres">
                  <Textarea
                    placeholder="Sokak, Cadde, Sanayi Bölgesi..."
                    rows={3}
                    value={values.address}
                    onChange={set("address")}
                    className="resize-none"
                  />
                </Field>
              </FormSection>
            </div>

            {/* Sağ sütun — Yönetici & Kaydet */}
            <div className="space-y-5">
              <FormSection title="Yönetici Bilgileri" icon={User}>
                <Field label="Yönetici Adı Soyadı" required>
                  <Input
                    placeholder="Ad Soyad"
                    value={values.managerName}
                    onChange={set("managerName")}
                    className={errors.managerName ? "border-red-400" : ""}
                  />
                  {errors.managerName && <p className="mt-1 text-xs text-red-500">{errors.managerName}</p>}
                </Field>
                <Field label="Telefon">
                  <Input
                    placeholder="0xxx xxx xx xx"
                    value={values.managerPhone}
                    onChange={set("managerPhone")}
                  />
                </Field>
                <Field label="E-posta">
                  <Input
                    type="email"
                    placeholder="ornek@kargom.com"
                    value={values.managerEmail}
                    onChange={set("managerEmail")}
                  />
                </Field>
              </FormSection>

              {/* Kaydet / İptal */}
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <Button type="submit" className="w-full gap-2">
                    <Save className="size-4" />
                    Transfer Merkezini Kaydet
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/arf/cargo/settings/transfer-centers">İptal</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
