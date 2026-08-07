'use client'

import { FileText } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Schema-driven form kurulumu, tekrar kullanılabilir field config yapısıyla sunulur.',
  'Validation ve advanced form örnekleri tek bir kit girişinden bağlanır.',
  'Form kit sayfası diğer kit landing sayfalarıyla aynı yapıyı kullanır.',
]

const SCENARIOS = [
  {
    title: 'Form Kit Demo Hub',
    href: '/test/form/demo',
    description: 'Kapsamlı form-kit demo ve dokümantasyon sayfası.',
    tags: ['demo', 'full'],
  },
  {
    title: 'Advanced Form Scenarios',
    href: '/test/form/advanced',
    description: 'Autosave ve dynamic field içeren karmaşık form senaryoları.',
    tags: ['advanced', 'autosave'],
  },
  {
    title: 'Validation Helpers',
    href: '/test/utils/validation',
    description: 'Schema ve field kuralları için validation utility kontrolleri.',
    tags: ['utils', 'validation'],
  },
]

const API_ITEMS = [
  { name: 'SchemaForm', type: 'component', required: true, description: 'Main schema-driven form renderer.' },
  { name: 'buildSchema', type: 'function', required: false, description: 'Build zod schema from field config list.' },
  { name: 'useSchemaForm', type: 'hook', required: false, description: 'Typed form state and helper hook.' },
  { name: 'FieldConfig[]', type: 'type', required: true, description: 'Declarative field definition list.' },
  { name: 'onSubmit', type: '(values) => void', required: true, description: 'Submit handler for validated values.' },
]

const TEST_CASES = [
  { title: 'Basic field render ve submit flow çalışır', status: 'manual' as const },
  { title: 'Advanced form senaryosu uçtan uca çalışır', status: 'manual' as const },
  { title: 'Validation utility kontrolleri erişilebilir', status: 'manual' as const },
]

export default function FormKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="Form Kit"
      description="Ortak bölüm sırası ve içerik modeliyle birleşik form kit landing sayfası."
      icon={FileText}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
