'use client'

import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  FieldRenderer,
  WizardForm,
  useAutoSave,
  useSchemaForm,
  type FieldConfig,
} from '@hascanb/arf-ui-kit/form-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

function AutoSaveDemo() {
  const schema = z.object({
    title: z.string().min(2, 'Baslik en az 2 karakter olmalidir'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
  })

  const fields: FieldConfig[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Task Basligi',
      placeholder: 'Orn: Kargo mutabakat kontrolu',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Aciklama',
      placeholder: 'Detaylari yazin...',
      rows: 4,
    },
    {
      name: 'priority',
      type: 'select',
      label: 'Oncelik',
      required: true,
      options: [
        { label: 'Dusuk', value: 'low' },
        { label: 'Orta', value: 'medium' },
        { label: 'Yuksek', value: 'high' },
      ],
    },
  ]

  const { form, handleSubmit } = useSchemaForm({
    schema,
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
    onSubmit: async (data) => {
      toast.success('Taslak kayit tamamlandi', {
        description: data.title,
      })
    },
  })

  const watchedValues = useWatch({ control: form.control }) as Record<string, unknown>
  const autoSave = useAutoSave({
    form,
    storageKey: 'arf-ui-kit-form-autosave-demo',
    mode: 'debounce',
    debounceMs: 900,
    draftVersion: 'advanced-form-demo-v1',
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            config={field}
            control={form.control}
            watchValues={watchedValues}
            showDescription
            showRequired
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit">Kaydet</Button>
        <Button type="button" variant="outline" onClick={() => void autoSave.saveNow()}>
          Simdi Taslak Kaydet
        </Button>
        <Button type="button" variant="ghost" onClick={autoSave.clearDraft}>
          Taslagi Temizle
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Draft durumu: {autoSave.hasDraft ? 'Bulundu' : 'Yok'}
      </p>
    </form>
  )
}

export default function AdvancedFormKitPage() {
  const wizardSteps = useMemo(
    () => [
      {
        id: 'customer',
        title: 'Musteri Bilgileri',
        description: 'Bagimli alanlar condition ve requiredWhen ile yonetiliyor.',
        schema: z
          .object({
            customerType: z.enum(['individual', 'corporate']),
            fullName: z.string().min(2),
            email: z.string().email(),
            companyName: z.string().optional(),
            taxNumber: z.string().optional(),
          })
          .superRefine((values, ctx) => {
            if (values.customerType === 'corporate' && !values.companyName) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyName'],
                message: 'Kurumsal musteride sirket adi zorunludur',
              })
            }
          }),
        fields: [
          {
            name: 'customerType',
            type: 'select',
            label: 'Musteri Tipi',
            required: true,
            options: [
              { label: 'Bireysel', value: 'individual' },
              { label: 'Kurumsal', value: 'corporate' },
            ],
          },
          {
            name: 'fullName',
            type: 'text',
            label: 'Ad Soyad',
            required: true,
          },
          {
            name: 'email',
            type: 'email',
            label: 'E-Posta',
            required: true,
          },
          {
            name: 'companyName',
            type: 'text',
            label: 'Sirket Adi',
            condition: (values) => values.customerType === 'corporate',
            requiredWhen: (values) => values.customerType === 'corporate',
          },
          {
            name: 'taxNumber',
            type: 'text',
            label: 'Vergi No',
            condition: (values) => values.customerType === 'corporate',
          },
        ] satisfies FieldConfig[],
      },
      {
        id: 'items',
        title: 'Siparis Satirlari',
        description: "Field Array destegi: type 'array' ile dinamik liste",
        schema: z.object({
          orderItems: z
            .array(
              z.object({
                productName: z.string().min(2),
                quantity: z.number().min(1),
                unitPrice: z.number().min(1),
              })
            )
            .min(1),
        }),
        fields: [
          {
            name: 'orderItems',
            type: 'array',
            label: 'Siparis Kalemleri',
            required: true,
            minItems: 1,
            maxItems: 8,
            itemLabel: 'Kalem',
            defaultItem: {
              productName: '',
              quantity: 1,
              unitPrice: 0,
            },
            fields: [
              {
                name: 'productName',
                type: 'text',
                label: 'Urun Adi',
                required: true,
              },
              {
                name: 'quantity',
                type: 'number',
                label: 'Adet',
                required: true,
                min: 1,
              },
              {
                name: 'unitPrice',
                type: 'number',
                label: 'Birim Fiyat',
                required: true,
                min: 1,
              },
            ],
          },
        ] satisfies FieldConfig[],
      },
      {
        id: 'review',
        title: 'Onay',
        description: 'Son adım: notlar ve gönderim',
        schema: z.object({
          notes: z.string().optional(),
          approval: z.boolean().refine((v) => v === true, {
            message: 'Onay kutusu işaretlenmelidir',
          }),
        }),
        fields: [
          {
            name: 'notes',
            type: 'textarea',
            label: 'Notlar',
            rows: 4,
          },
          {
            name: 'approval',
            type: 'checkbox',
            label: 'Onay',
            checkboxLabel: 'Siparis verilerini kontrol ettim ve onayliyorum.',
            required: true,
          },
        ] satisfies FieldConfig[],
      },
    ],
    []
  )

  return (
    <div className="container py-8 space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Form Kit Advanced</h1>
        <p className="text-muted-foreground mt-2">
          Wizard, Field Array, Dynamic Fields ve AutoSave draft mode örnekleri
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>1. Wizard Form</CardTitle>
          <CardDescription>Her adım kendi Zod schema'sı ile doğrulanır</CardDescription>
        </CardHeader>
        <CardContent>
          <WizardForm
            config={{
              steps: wizardSteps,
              defaultValues: {
                customerType: 'individual',
                fullName: '',
                email: '',
                companyName: '',
                taxNumber: '',
                orderItems: [{ productName: '', quantity: 1, unitPrice: 0 }],
                notes: '',
                approval: false,
              },
              onSubmit: async (values) => {
                toast.success('Wizard tamamlandi', {
                  description: `Musteri: ${values.fullName}`,
                })
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. AutoSave & Draft</CardTitle>
          <CardDescription>Debounce ile localStorage uzerine otomatik taslak kaydi</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoSaveDemo />
        </CardContent>
      </Card>
    </div>
  )
}
