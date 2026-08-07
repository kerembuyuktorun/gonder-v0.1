import { Suspense } from 'react'
import { BulkCreateImportsContent } from '../_components/bulk-create-imports-content'

export default function BulkCreateImportsPage() {
  return (
    <Suspense fallback={null}>
      <BulkCreateImportsContent />
    </Suspense>
  )
}
