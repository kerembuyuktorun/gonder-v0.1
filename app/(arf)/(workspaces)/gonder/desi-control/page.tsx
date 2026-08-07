import { Suspense } from 'react'
import { DesiControlContent } from './_components/desi-control-content'

export default function DesiControlPage() {
  return (
    <Suspense fallback={null}>
      <DesiControlContent />
    </Suspense>
  )
}
