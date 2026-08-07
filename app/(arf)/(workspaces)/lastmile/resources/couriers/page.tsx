import { Suspense } from 'react'
import CouriersListPage from './page-content'

export default function CouriersPage() {
  return (
    <Suspense fallback={null}>
      <CouriersListPage />
    </Suspense>
  )
}
