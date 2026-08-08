import { Suspense } from 'react'
import ConnectionsPageContent from './page-content'

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={<div className='p-6 text-sm text-slate-500'>Bağlantılar yükleniyor…</div>}
    >
      <ConnectionsPageContent />
    </Suspense>
  )
}
