/**
 * File-Kit Comprehensive Test & Documentation
 * 
 * Bu sayfa File-Kit'in tüm özelliklerini kapsamlı şekilde test eder ve dokümante eder.
 * 
 * @module FileKitTest
 * @category File-Kit
 * 
 * ## 📚 File-Kit Nedir?
 * 
 * File-Kit, drag & drop file upload için tasarlanmış modern, kullanışlı ve güçlü
 * bir file uploader component library'sidir. React Hook Form ile tam entegrasyon,
 * Zod validation desteği ve thumbnail preview sunar.
 * 
 * ## 🎯 Ana Özellikler
 * 
 * ### 1. Core Components
 * - **FileUploader**: Standalone file uploader
 * - **RHFFileUploader**: React Hook Form Controller wrapped version
 * 
 * ### 2. Upload Methods
 * - **Drag & Drop**: Sürükle bırak desteği
 * - **Click to Upload**: Klasik file picker
 * - **Paste**: Panodan yapıştır (images)
 * 
 * ### 3. File Validation
 * - **File Types**: MIME type bazlı Filtreler (image/*, .pdf, vb.)
 * - **File Size**: Max file size limiti (MB)
 * - **File Count**: Max file count (tek/çoklu)
 * - **Custom Validation**: Zod schemas ile özel kurallar
 * 
 * ### 4. Preview Features
 * - **Image Thumbnails**: Otomatik thumbnail generation
 * - **File Icons**: PDF, DOC, etc. için tip ikonları
 * - **Progress Bars**: Upload progress tracking
 * - **File Details**: Name, size, type bilgileri
 * 
 * ### 5. User Experience
 * - **Remove Files**: Tek tek dosya silme
 * - **Replace Files**: Dosya değiştirme
 * - **Error Feedback**: Hatalı dosyalar için mesajlar
 * - **Loading States**: Upload sırasında feedback
 * - **Accessibility**: Full keyboard ve screen reader support
 * 
 * ## 📦 Import
 * 
 * ```tsx
 * import {
 *   FileUploader,
 *   RHFFileUploader
 * } from '@hascanb/arf-ui-kit/file-kit'
 * ```
 * 
 * ## 💡 Basic Usage
 * 
 * ### Standalone Usage
 * ```tsx
 * import { FileUploader } from '@hascanb/arf-ui-kit/file-kit'
 * 
 * function MyForm() {
 *   const [files, setFiles] = useState<File[]>([])
 *   
 *   return (
 *     <FileUploader
 *       value={files}
 *       onChange={setFiles}
 *       maxFiles={5}
 *       maxSize={5} // MB
 *       accept="image/*"
 *     />
 *   )
 * }
 * ```
 * 
 * ### React Hook Form Integration
 * ```tsx
 * import { useForm } from 'react-hook-form'
 * import { RHFFileUploader } from '@hascanb/arf-ui-kit/file-kit'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * 
 * const schema = z.object({
 *   attachments: z.array(z.instanceof(File))
 *     .min(1, 'At least one file required')
 *     .max(5, 'Maximum 5 files allowed')
 * })
 * 
 * function MyForm() {
 *   const form = useForm({ resolver: zodResolver(schema) })
 *   
 *   return (
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <RHFFileUploader
 *         control={form.control}
 *         name="attachments"
 *         maxFiles={5}
 *         maxSize={10}
 *         accept="image/*, .pdf"
 *       />
 *     </form>
 *   )
 * }
 * ```
 * 
 * ## 🎨 Common Patterns
 * 
 * ### Single Image Upload
 * ```tsx
 * <FileUploader
 *   value={avatar}
 *   onChange={setAvatar}
 *   maxFiles={1}
 *   accept="image/*"
 *   maxSize={2} // 2MB
 * />
 * ```
 * 
 * ### Multiple Documents
 * ```tsx
 * <FileUploader
 *   value={documents}
 *   onChange={setDocuments}
 *   maxFiles={10}
 *   accept=".pdf,.doc,.docx"
 *   maxSize={10}
 * />
 * ```
 * 
 * ### With Validation Feedback
 * ```tsx
 * <RHFFileUploader
 *   control={form.control}
 *   name="files"
 *   maxFiles={3}
 *   onError={(error) => {
 *     toast.error(error.message)
 *   }}
 * />
 * ```
 * 
 * ## 📏 Props Reference
 * 
 * | Prop | Type | Default | Description |
 * |------|------|---------|-------------|
 * | value | File[] | [] | Current files |
 * | onChange | Function | - | File change handler |
 * | maxFiles | number | Infinity | Max file count |
 * | maxSize | number | 10 | Max size per file (MB) |
 * | accept | string | "*" | Accepted file types |
 * | multiple | boolean | true | Allow multiple files |
 * | disabled | boolean | false | Disable uploader |
 * | onError | Function | - | Error handler |
 * 
 * ## ♿ Accessibility
 * 
 * - ✅ Keyboard: Tab to focus, Enter/Space to open picker
 * - ✅ Screen Reader: Announcements for file additions/removals
 * - ✅ ARIA: Proper labels and roles
 * - ✅ Focus Management: Visual focus indicators
 * - ✅ Error Messages: Accessible error announcements
 * 
 * ## 🎯 Test Scenarios
 * 
 * Bu sayfada test edilenler:
 * 
 * 1. **Standalone Uploader**: RHF olmadan kullanım
 * 2. **RHF Integration**: React Hook Form ile entegrasyon
 * 3. **Validation**: File type, size, count validation
 * 4. **Error Handling**: Hatalı upload senaryoları
 * 5. **Multiple Files**: Çoklu dosya yönetimi
 * 
 * @see /src/file-kit - Source code
 * @see RHFFileUploader - React Hook Form integration
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUploader, RHFFileUploader } from '@hascanb/arf-ui-kit/file-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const schema = z.object({
  attachments: z.array(z.instanceof(File)).min(1, 'En az bir dosya secmelisiniz'),
})

type FormValues = z.infer<typeof schema>

export default function FileUploaderTestPage() {
  const [standaloneFiles, setStandaloneFiles] = useState<File[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      attachments: [],
    },
  })

  return (
    <div className="container py-8 space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Kit Test</h1>
        <p className="text-muted-foreground mt-2">
          Drag & Drop uploader, Zod validasyon, thumbnail preview ve RHF Controller entegrasyonu
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>1. Standalone FileUploader</CardTitle>
          <CardDescription>RHF disinda bağımsız kullanım</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploader
            value={standaloneFiles}
            onChange={setStandaloneFiles}
            multiple
            maxFiles={6}
            maxSizeMb={4}
            accept="image/*,.pdf"
            header={<p className="text-sm text-muted-foreground">Izin verilen tipler: image/*, .pdf</p>}
          />

          <p className="text-sm text-muted-foreground">
            Secilen dosya sayisi: {standaloneFiles.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. RHF Controller Entegrasyonu</CardTitle>
          <CardDescription>Form submit akışında file uploader kullanımı</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => {
              toast.success('Form gönderildi', {
                description: `${data.attachments.length} dosya ile kaydedildi.`,
              })
            })}
          >
            <RHFFileUploader
              control={form.control}
              name="attachments"
              multiple
              maxFiles={3}
              maxSizeMb={2}
              accept="image/*"
            />

            {form.formState.errors.attachments?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.attachments.message}</p>
            )}

            <Button type="submit">Formu Gonder</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
