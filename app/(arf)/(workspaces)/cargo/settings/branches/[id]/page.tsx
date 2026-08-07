import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchBranchCargoes } from "./_api/branch-cargoes-api"
import { fetchBranchDetail } from "./_api/branch-detail-api"
import { BranchDetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubeDetayPage({ params }: Props) {
  const { id } = await params
  const [branch, cargoes] = await Promise.all([fetchBranchDetail(id), fetchBranchCargoes(id)])

  if (!branch) {
    notFound()
  }

  return (
    <Suspense>
      <BranchDetailContent initialBranch={branch} initialCargoes={cargoes} />
    </Suspense>
  )
}
