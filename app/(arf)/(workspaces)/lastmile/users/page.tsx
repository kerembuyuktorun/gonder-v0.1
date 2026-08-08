import { Suspense } from 'react'
import UsersPageContent from './page-content'

export default function UsersPage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm text-slate-500'>Kullanıcılar yükleniyor…</div>}>
      <UsersPageContent />
    </Suspense>
  )
}
