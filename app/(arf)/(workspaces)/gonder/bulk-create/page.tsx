import { Suspense } from 'react'
import { BulkCreateUploadContent } from './_components/bulk-create-upload-content'

export default function BulkCreatePage() {
  return (
    <Suspense fallback={null}>
      <BulkCreateUploadContent />
    </Suspense>
  )
}
