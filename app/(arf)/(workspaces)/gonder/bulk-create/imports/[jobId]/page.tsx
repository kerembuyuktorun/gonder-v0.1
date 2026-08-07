'use client'

import { use } from 'react'
import { BulkCreateJobDetailContent } from '../../_components/bulk-create-job-detail-content'

type Props = {
  params: Promise<{ jobId: string }>
}

export default function BulkCreateImportDetailPage({ params }: Props) {
  const { jobId } = use(params)
  return <BulkCreateJobDetailContent jobId={jobId} />
}
