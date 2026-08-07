/**
 * Form-Kit Comprehensive Test & Documentation
 * 
 * Bu sayfa Form-Kit'in tüm özelliklerini kapsamlı şekilde test eder ve dokümante eder.
 * Production kullanımı için referans noktasıdır.
 * 
 * @module FormKitTest
 * @category Form-Kit
 * 
 * ## 📚 Form-Kit Nedir?
 * 
 * Form-Kit, schema-driven form generation için tasarlanmış production-ready bir çözümdür.
 * React Hook Form ve Zod validation üzerine kurulmuş, TypeScript ile tam tip güvenli,
 * özelleştirilebilir ve kullanımı kolay bir form sistemidir.
 * 
 * ## 🎯 Ana Özellikler
 * 
 * ### 1. Field Types (9 Tip)
 * - **text**: Tek satır metin girişi
 * - **email**: Email validation ile email girişi
 * - **password**: Şifre girişi (show/hide toggle)
 * - **number**: Sayısal değer girişi (min/max)
 * - **textarea**: Çok satırlı metin (rows özelleştirilebilir)
 * - **select**: Dropdown seçim (single)
 * - **checkbox**: Boolean checkbox
 * - **radio**: Radio button grubları
 * - **date**: Tarih seçici (date picker)
 * 
 * ### 2. Validation System
 * - **Zod Integration**: Type-safe schema validation
 * - **Built-in Rules**: required, min, max, minLength, maxLength, pattern
 * - **Custom Validation**: Zod refinements ile özel kurallar
 * - **Cross-Field Validation**: Field'lar arası bağımlılık kontrolü
 * - **Async Validation**: Server-side validation desteği
 * - **Real-time Feedback**: onChange validasyonu
 * 
 * ### 3. Layout System
 * - **12-Column Grid**: Flexbox tabanlı responsive grid
 * - **Span Control**: Her field için span: 1-12
 * - **Gap Control**: Row ve column gap özelleştirilebilir
 * - **Responsive**: Breakpoint-aware layout
 * 
 * ### 4. Advanced Features
 * - **Auto-save**: Otomatik form kaydetme (debounced)
 * - **Wizard Forms**: Multi-step form support
 * - **Conditional Fields**: Dynamic field visibility
 * - **Custom Renderers**: Own field components
 * - **Loading States**: Submit sırasında UI feedback
 * - **Error Handling**: Comprehensive error messages
 * 
 * ## 📦 Import
 * 
 * ```tsx
 * import {
 *   SchemaForm,
 *   FieldConfig,
 *   buildSchema,
 *   addRefinements,
 *   useSchemaForm
 * } from '@hascanb/arf-ui-kit/form-kit'
 * ```
 * 
 * ## 💡 Basic Usage
 * 
 * ```tsx
 * const fields: FieldConfig[] = [
 *   {
 *     name: 'email',
 *     type: 'email',
 *     label: 'Email',
 *     required: true
 *   },
 *   {
 *     name: 'password',
 *     type: 'password',
 *     label: 'Password',
 *     required: true,
 *     minLength: 8
 *   }
 * ]
 * 
 * const schema = buildSchema(fields)
 * 
 * <SchemaForm
 *   fields={fields}
 *   schema={schema}
 *   onSubmit={(data) => console.log(data)}
 * />
 * ```
 * 
 * ## 🎨 Layout Examples
 * 
 * ### Two-Column Layout
 * ```tsx
 * const fields = [
 *   { name: 'firstName', label: 'First Name', layout: { span: 6 } },
 *   { name: 'lastName', label: 'Last Name', layout: { span: 6 } }
 * ]
 * ```
 * 
 * ### Three-Column Layout
 * ```tsx
 * const fields = [
 *   { name: 'field1', layout: { span: 4 } },
 *   { name: 'field2', layout: { span: 4 } },
 *   { name: 'field3', layout: { span: 4 } }
 * ]
 * ```
 * 
 * ## 🔧 Validation Patterns
 * 
 * ### Password Strength
 * ```tsx
 * const schema = buildSchema(fields)
 * const refinedSchema = addRefinements(schema, [
 *   createPasswordStrengthRefine('password', { minStrength: 3 })
 * ])
 * ```
 * 
 * ### Password Confirmation
 * ```tsx
 * const refinedSchema = addRefinements(schema, [
 *   createPasswordConfirmRefine('password', 'confirmPassword')
 * ])
 * ```
 * 
 * ### Date Range
 * ```tsx
 * const refinedSchema = addRefinements(schema, [
 *   createDateRangeRefine('startDate', 'endDate')
 * ])
 * ```
 * 
 * ## ♿ Accessibility
 * 
 * - ✅ ARIA Labels: Automatic label association
 * - ✅ Error Announcements: Screen reader feedback
 * - ✅ Keyboard Navigation: Full keyboard support
 * - ✅ Focus Management: Proper focus handling
 * - ✅ Required Indicators: Visual and semantic markers
 * 
 * ## 📱 Responsive Behavior
 * 
 * - Mobile (<640px): All fields full-width (span 12)
 * - Tablet (640-1024px): Respects span values
 * - Desktop (>1024px): Full grid system active
 * 
 * ## 🎯 Test Edilen Form Tipleri
 * 
 * Bu sayfada aşağıdaki form senaryoları test edilir:
 * 
 * 1. **Basic Registration**: Tüm field tipleri
 * 2. **Password Form**: Password validation ve confirm
 * 3. **Survey Form**: Select, radio, checkbox
 * 4. **Date Range Form**: Date pickers ve range validation
 * 5. **Complex Layout**: Advanced grid layouts
 * 
 * @see advanced - Wizard forms ve auto-save
 * @see /src/form-kit - Source code and implementations
 */

'use client'

import { useState } from 'react'
import {
  SchemaForm,
  FieldConfig,
  buildSchema,
  addRefinements,
  createPasswordConfirmRefine,
  createPasswordStrengthRefine,
  createDateRangeRefine,
} from '@hascanb/arf-ui-kit/form-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function FormKitTestPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  // ============================================================================
  // Basic Registration Form
  // ============================================================================

  const basicFields: FieldConfig[] = [
    {
      name: 'firstName',
      type: 'text',
      label: 'İsim',
      placeholder: 'Adınızı giriniz',
      required: true,
      layout: { span: 6 },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Soyisim',
      placeholder: 'Soyadınızı giriniz',
      required: true,
      layout: { span: 6 },
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-posta',
      placeholder: 'ornek@email.com',
      required: true,
      description: 'Geçerli bir e-posta adresi giriniz',
    },
    {
      name: 'age',
      type: 'number',
      label: 'Yaş',
      placeholder: '18',
      required: true,
      min: 18,
      max: 100,
      description: '18 yaşından büyük olmalısınız',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Hakkında',
      placeholder: 'Kendinizden bahsedin...',
      rows: 4,
      maxLength: 500,
      description: 'En fazla 500 karakter',
    },
  ]

  const basicSchema = buildSchema(basicFields)

  // ============================================================================
  // Password Form with Validation
  // ============================================================================

  const passwordFields: FieldConfig[] = [
    {
      name: 'username',
      type: 'text',
      label: 'Kullanıcı Adı',
      placeholder: 'kullaniciadi',
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Şifre',
      placeholder: '••••••••',
      required: true,
      minLength: 8,
      description: 'En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir',
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Şifre Tekrar',
      placeholder: '••••••••',
      required: true,
      description: 'Yukarıdaki şifreyi tekrar giriniz',
    },
  ]

  const passwordSchema = addRefinements(buildSchema(passwordFields), [
    createPasswordStrengthRefine({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: false,
    }),
    createPasswordConfirmRefine('password', 'confirmPassword'),
  ])

  // ============================================================================
  // Complex Form with All Field Types
  // ============================================================================

  const complexFields: FieldConfig[] = [
    {
      name: 'accountType',
      type: 'select',
      label: 'Hesap Tipi',
      required: true,
      options: [
        { label: 'Bireysel', value: 'individual' },
        { label: 'Kurumsal', value: 'corporate' },
        { label: 'Öğrenci', value: 'student' },
      ],
      layout: { span: 6 },
    },
    {
      name: 'country',
      type: 'select',
      label: 'Ülke',
      required: true,
      options: [
        { label: 'Türkiye', value: 'tr' },
        { label: 'Amerika', value: 'us' },
        { label: 'İngiltere', value: 'uk' },
        { label: 'Almanya', value: 'de' },
      ],
      layout: { span: 6 },
    },
    {
      name: 'gender',
      type: 'radio',
      label: 'Cinsiyet',
      required: true,
      options: [
        { label: 'Erkek', value: 'male' },
        { label: 'Kadın', value: 'female' },
        { label: 'Diğer', value: 'other' },
      ],
      orientation: 'horizontal',
    },
    {
      name: 'interests',
      type: 'checkbox',
      label: 'İlgi Alanları',
      checkboxLabel: 'Teknoloji, yazılım ve yenilikler hakkında bildirim almak istiyorum',
    },
    {
      name: 'birthDate',
      type: 'date',
      label: 'Doğum Tarihi',
      required: true,
      description: 'Doğum tarihinizi seçiniz',
    },
    {
      name: 'terms',
      type: 'checkbox',
      label: 'Kullanım Koşulları',
      checkboxLabel: 'Kullanım koşullarını okudum ve kabul ediyorum',
      required: true,
    },
  ]

  const complexSchema = buildSchema(complexFields)

  // ============================================================================
  // Date Range Form
  // ============================================================================

  const dateRangeFields: FieldConfig[] = [
    {
      name: 'startDate',
      type: 'date',
      label: 'Başlangıç Tarihi',
      required: true,
      layout: { span: 6 },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Bitiş Tarihi',
      required: true,
      layout: { span: 6 },
    },
    {
      name: 'reason',
      type: 'textarea',
      label: 'Açıklama',
      placeholder: 'Tarih aralığı açıklaması...',
      rows: 3,
    },
  ]

  const dateRangeSchema = addRefinements(buildSchema(dateRangeFields), [
    createDateRangeRefine('startDate', 'endDate'),
  ])

  // ============================================================================
  // Combobox Form
  // ============================================================================

  const comboboxFields: FieldConfig[] = [
    {
      name: 'framework',
      type: 'combobox',
      label: 'Framework Seçimi',
      description: 'Kullanmak istediğiniz framework\'ü seçin',
      required: true,
      options: [
        { label: 'Next.js', value: 'nextjs' },
        { label: 'SvelteKit', value: 'sveltekit' },
        { label: 'Nuxt.js', value: 'nuxtjs' },
        { label: 'Remix', value: 'remix' },
        { label: 'Astro', value: 'astro' },
      ],
      searchPlaceholder: 'Framework ara...',
      emptyText: 'Framework bulunamadı',
      layout: { span: 12 },
    },
    {
      name: 'projectName',
      type: 'text',
      label: 'Proje Adı',
      placeholder: 'my-awesome-project',
      required: true,
      layout: { span: 12 },
    },
  ]

  const comboboxSchema = buildSchema(comboboxFields)

  // ============================================================================
  // Submit Handlers
  // ============================================================================

  const handleBasicSubmit = async (data: Record<string, unknown>) => {
    setFormData(data)
    toast.success('Form başarıyla gönderildi!', {
      description: `Email: ${data.email}`,
    })
  }

  const handlePasswordSubmit = async (data: Record<string, unknown>) => {
    toast.success('Şifre başarıyla oluşturuldu!', {
      description: `Kullanıcı: ${data.username}`,
    })
  }

  const handleComplexSubmit = async (data: Record<string, unknown>) => {
    toast.success('Kayıt tamamlandı!', {
      description: `Hesap tipi: ${data.accountType}`,
    })
  }

  const handleDateRangeSubmit = async (data: Record<string, unknown>) => {
    toast.success('Tarih aralığı kaydedildi!', {
      description: `${new Date(data.startDate as string).toLocaleDateString()} - ${new Date(data.endDate as string).toLocaleDateString()}`,
    })
  }

  const handleComboboxSubmit = async (data: Record<string, unknown>) => {
    toast.success('Proje oluşturuldu!', {
      description: `${data.projectName} - ${data.framework}`,
    })
  }

  return (
    <div className="container py-8 space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Form-Kit Test Sayfası</h1>
        <p className="text-muted-foreground mt-2">
          Schema-driven form generation with Zod validation
        </p>
      </div>

      <Separator />

      {/* Basic Form */}
      <Card>
        <CardHeader>
          <CardTitle>1. Temel Kayıt Formu</CardTitle>
          <CardDescription>
            Text, email, number, textarea field tipleri - Layout: 2 sütun (firstName/lastName)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm
            config={{
              schema: basicSchema,
              fields: basicFields,
              layout: { columns: 12, gap: 'default', maxWidth: '800px' },
              submitButton: { label: 'Kayıt Ol', variant: 'default' },
              onSubmit: handleBasicSubmit,
            }}
          />
        </CardContent>
      </Card>

      {/* Password Form */}
      <Card>
        <CardHeader>
          <CardTitle>2. Şifre Doğrulama Formu</CardTitle>
          <CardDescription>
            Password strength validation + confirmation matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm
            config={{
              schema: passwordSchema,
              fields: passwordFields,
              layout: { columns: 1, gap: 'default', maxWidth: '500px' },
              submitButton: { label: 'Şifre Oluştur', variant: 'default' },
              onSubmit: handlePasswordSubmit,
            }}
          />
        </CardContent>
      </Card>

      {/* Complex Form */}
      <Card>
        <CardHeader>
          <CardTitle>3. Tüm Field Tipleri</CardTitle>
          <CardDescription>
            Select, radio, checkbox, date - Layout: 2 sütun (accountType/country)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm
            config={{
              schema: complexSchema,
              fields: complexFields,
              layout: { columns: 12, gap: 'lg', maxWidth: '800px' },
              submitButton: { label: 'Gönder', variant: 'default', fullWidth: false },
              onSubmit: handleComplexSubmit,
            }}
          />
        </CardContent>
      </Card>

      {/* Date Range Form */}
      <Card>
        <CardHeader>
          <CardTitle>4. Tarih Aralığı Cross-Field Validation</CardTitle>
          <CardDescription>
            createDateRangeRefine - Bitiş tarihi başlangıçtan sonra olmalı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm
            config={{
              schema: dateRangeSchema,
              fields: dateRangeFields,
              layout: { columns: 12, gap: 'default', maxWidth: '600px' },
              submitButton: { label: 'Kaydet', variant: 'default' },
              onSubmit: handleDateRangeSubmit,
            }}
          />
        </CardContent>
      </Card>

      {/* Combobox Form */}
      <Card>
        <CardHeader>
          <CardTitle>5. Combobox Field - Aranabilir Seçim</CardTitle>
          <CardDescription>
            Combobox field type ile aranabilir ve filtrelenebilir seçim kutusu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm
            config={{
              schema: comboboxSchema,
              fields: comboboxFields,
              layout: { columns: 12, gap: 'default', maxWidth: '600px' },
              submitButton: { label: 'Proje Oluştur', variant: 'default' },
              onSubmit: handleComboboxSubmit,
            }}
          />
        </CardContent>
      </Card>

      {/* Form Data Display */}
      {formData && (
        <Card>
          <CardHeader>
            <CardTitle>Son Gönderilen Form Verisi</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
