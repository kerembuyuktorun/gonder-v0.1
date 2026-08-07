import { Suspense } from 'react'
import { ReturnsContent } from './_components/returns-content'

export default function ReturnsPage() {
  return (
    <Suspense fallback={null}>
      <ReturnsContent />
    </Suspense>
  )
}
