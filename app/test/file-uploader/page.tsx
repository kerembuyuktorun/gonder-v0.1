'use client'

import { Upload } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'File upload akışları tek bir standart landing sayfasında merkezileştirilir.',
  'Drag-drop, file validation ve preview davranışları manuel olarak kapsanır.',
  'İçerik yapısı diğer tüm kit sayfalarıyla hizalıdır.',
]

const SCENARIOS = [
  {
    title: 'File Uploader Demo Hub',
    href: '/test/file-uploader/demo',
    description: 'Detaylı senaryolar içeren tam upload etkileşim sayfası.',
    tags: ['demo', 'drag-drop', 'validation'],
  },
]

const API_ITEMS = [
  { name: 'FileUploader', type: 'component', required: true, description: 'Standalone upload component.' },
  { name: 'RHFFileUploader', type: 'component', required: false, description: 'React Hook Form adapter component.' },
  { name: 'maxFiles', type: 'number', required: false, description: 'Maximum allowed file count.', defaultValue: '1' },
  { name: 'maxSize', type: 'number', required: false, description: 'Maximum file size limit in MB.' },
  { name: 'accept', type: 'string', required: false, description: 'Accepted MIME/file extension filters.' },
]

const TEST_CASES = [
  { title: 'Upload flow select ve drag-drop ile çalışır', status: 'manual' as const },
  { title: "Geçersiz file kısıtları beklenen feedback'i üretir", status: 'manual' as const },
  { title: 'Yüklenen file listesi ve remove aksiyonları çalışır', status: 'manual' as const },
]

export default function FileKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="File Kit"
      description="Tutarlı docs ve demo yapısına odaklanan standart file kit landing sayfası."
      icon={Upload}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
