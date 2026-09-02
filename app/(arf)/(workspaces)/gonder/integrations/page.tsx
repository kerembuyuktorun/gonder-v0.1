import { Suspense } from 'react'
import { IntegrationsListContent } from './_components/integrations-list-content'

export default function IntegrationsPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationsListContent />
    </Suspense>
  )
}
