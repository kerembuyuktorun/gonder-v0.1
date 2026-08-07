import { Suspense } from 'react'
import { QuotesContent } from './_components/quotes-content'

export default function QuotesPage() {
  return (
    <Suspense fallback={null}>
      <QuotesContent />
    </Suspense>
  )
}
