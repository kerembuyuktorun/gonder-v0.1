import { Suspense } from 'react'
import UninvoicedOrdersPageContent from './page-content'

export default function UninvoicedOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className='p-6 text-sm text-slate-500'>Faturalanmamış siparişler yükleniyor…</div>
      }
    >
      <UninvoicedOrdersPageContent />
    </Suspense>
  )
}
