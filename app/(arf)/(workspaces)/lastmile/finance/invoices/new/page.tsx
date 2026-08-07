import { Suspense } from 'react'
import InvoiceCreatePageContent from './page-content'

export default function InvoiceCreatePage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm text-slate-500'>Fatura formu yükleniyor…</div>}>
      <InvoiceCreatePageContent />
    </Suspense>
  )
}
