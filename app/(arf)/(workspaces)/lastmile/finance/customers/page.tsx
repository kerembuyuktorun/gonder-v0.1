import { Suspense } from 'react'
import FinanceCustomersPageContent from './page-content'

export default function FinanceCustomersPage() {
  return (
    <Suspense
      fallback={<div className='p-6 text-sm text-slate-500'>Finans müşterileri yükleniyor…</div>}
    >
      <FinanceCustomersPageContent />
    </Suspense>
  )
}
