'use client'

import { Table } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Client ve server-side tablo senaryoları tek bir giriş modeliyle gruplanır.',
  'Sorting, filtering, pagination ve column davranışları bağlı sayfalarda doğrulanır.',
  'Bu landing sayfası diğer tüm kitlerle aynı içerik yapısını izler.',
]

const SCENARIOS = [
  {
    title: 'Basic DataTable',
    href: '/test/datatable/basic',
    description: 'Temel tablo etkileşimleri: sorting, paging, selection.',
    tags: ['basic', 'sorting', 'pagination'],
  },
  {
    title: 'Advanced DataTable',
    href: '/test/datatable/advanced',
    description: 'Advanced filtreler, grouped row yapısı ve column kontrolleri.',
    tags: ['advanced', 'filters'],
  },
  {
    title: 'Server-side DataTable',
    href: '/test/datatable/server-side',
    description: 'Async ve server-driven tablo etkileşim kapsamı.',
    tags: ['server', 'async'],
  },
]

const API_ITEMS = [
  { name: 'DataTable', type: 'component', required: true, description: 'Main table renderer with generic row type support.' },
  { name: 'columns', type: 'ColumnDef<T>[]', required: true, description: 'Column definitions and cell renderers.' },
  { name: 'data', type: 'T[]', required: true, description: 'Data source rows.' },
  { name: 'pageSize', type: 'number', required: false, description: 'Rows per page.', defaultValue: '10' },
  { name: 'onRowClick', type: '(row) => void', required: false, description: 'Row interaction callback.' },
]

const TEST_CASES = [
  { title: 'Basic table flow (sort/filter/page) çalışır', status: 'manual' as const },
  { title: 'Advanced filtreler ve görünürlük kontrolleri çalışır', status: 'manual' as const },
  { title: 'Server-side fetch etkileşimleri stabil çalışır', status: 'manual' as const },
]

export default function DataTableKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="DataTable Kit"
      description="Tutarlı overview, demo, API ve test-case bölümleriyle birleşik DataTable kit landing sayfası."
      icon={Table}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
