import { Suspense } from 'react'
import CollectionsPageContent from './page-content'

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm text-slate-500'>Yükleniyor…</div>}>
      <CollectionsPageContent />
    </Suspense>
  )
}
