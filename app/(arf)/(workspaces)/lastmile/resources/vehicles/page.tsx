import { Suspense } from 'react'
import VehiclesPageContent from './page-content'

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm text-slate-500'>Araçlar yükleniyor…</div>}>
      <VehiclesPageContent />
    </Suspense>
  )
}
