import { notFound } from "next/navigation"
import { fetchInterlandDetail } from "./_api/interland-detail-api"
import { DetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function InterlandDetailPage({ params }: Props) {
  const { id } = await params
  const interland = await fetchInterlandDetail(id)

  if (!interland) {
    notFound()
  }

  return <DetailContent initialInterland={interland} />
}
