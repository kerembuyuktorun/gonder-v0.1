import { Suspense } from 'react'
import PlanningRouteDetailPageContent from './page-content'

export default function PlanningRouteDetailPage() {
  return (
    <Suspense fallback={null}>
      <PlanningRouteDetailPageContent />
    </Suspense>
  )
}
