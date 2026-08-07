import { notFound } from "next/navigation"
import { fetchPriceDefinitionDetail } from "./_api/price-definition-detail-api"
import { DetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SystemPricingDetailPage({ params }: Props) {
  const { id } = await params
  const detail = await fetchPriceDefinitionDetail(id)

  if (!detail) {
    notFound()
  }

  return <DetailContent initialDetail={detail} />
}
