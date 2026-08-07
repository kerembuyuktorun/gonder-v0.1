import { Suspense } from 'react'
import PlanningRoutesPageContent from './page-content'

export default function PlanningRoutesPage() {
  return (
    <Suspense fallback={null}>
      <PlanningRoutesPageContent />
    </Suspense>
  )
}
