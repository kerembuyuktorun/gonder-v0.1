import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchUserDetail } from "./_api/user-detail-api"
import { DetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params
  const userDetail = await fetchUserDetail(userId)

  if (!userDetail) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Yükleniyor...</div>}>
      <DetailContent initialUser={userDetail} />
    </Suspense>
  )
}
