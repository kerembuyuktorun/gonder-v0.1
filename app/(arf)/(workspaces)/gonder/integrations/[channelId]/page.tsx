import { Suspense } from 'react'
import { IntegrationSetupContent } from '../_components/integration-setup-content'

type Props = {
  params: Promise<{ channelId: string }>
}

export default async function IntegrationSetupPage({ params }: Props) {
  const { channelId } = await params

  return (
    <Suspense fallback={null}>
      <IntegrationSetupContent channelId={channelId} />
    </Suspense>
  )
}
