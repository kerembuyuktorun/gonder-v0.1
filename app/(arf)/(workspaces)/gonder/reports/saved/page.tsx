import { Suspense } from 'react'
import { SavedReportsContent } from '../_components/saved-reports-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SavedReportsContent />
    </Suspense>
  )
}
