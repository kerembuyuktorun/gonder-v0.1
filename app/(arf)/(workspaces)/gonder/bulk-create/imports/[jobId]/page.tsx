import { Suspense } from 'react'
import { BulkCreateJobDetailContent } from '../../_components/bulk-create-job-detail-content'

type Props = {
  params: Promise<{ jobId: string }>
}

async function BulkCreateImportDetailInner({ params }: Props) {
  const { jobId } = await params
  return <BulkCreateJobDetailContent jobId={jobId} />
}

export default function BulkCreateImportDetailPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <BulkCreateImportDetailInner params={params} />
    </Suspense>
  )
}
