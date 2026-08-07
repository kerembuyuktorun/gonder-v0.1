import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchTransferCenterDetail } from "./_api/transfer-center-detail-api"
import { TransferCenterDetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function TransferMerkeziDetayPage({ params }: Props) {
  const { id } = await params
  const center = await fetchTransferCenterDetail(id)

  if (!center) {
    notFound()
  }

  return (
    <Suspense>
      <TransferCenterDetailContent center={center} />
    </Suspense>
  )
}
