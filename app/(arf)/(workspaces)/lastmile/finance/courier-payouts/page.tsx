import { Suspense } from 'react'
import CourierPayoutsPageContent from './page-content'

export default function CourierPayoutsPage() {
  return (
    <Suspense
      fallback={
        <div className='p-6 text-sm text-slate-500'>Hakedişler yükleniyor…</div>
      }
    >
      <CourierPayoutsPageContent />
    </Suspense>
  )
}
