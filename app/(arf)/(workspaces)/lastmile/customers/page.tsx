import { Suspense } from 'react'
import CustomersPageContent from './page-content'

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm text-slate-500'>Müşteriler yükleniyor…</div>}>
      <CustomersPageContent />
    </Suspense>
  )
}
