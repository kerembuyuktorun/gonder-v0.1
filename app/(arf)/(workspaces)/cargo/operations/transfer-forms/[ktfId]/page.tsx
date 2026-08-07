import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchKtfAudit } from "./_api/ktf-audit-api"
import { fetchTransferFormDetail } from "./_api/transfer-form-detail-api"
import { DetailPageContent } from "./_components/detail-page-content"

interface Props {
  params: Promise<{ ktfId: string }>
}

export default async function TransferFormDetailPage({ params }: Props) {
  const { ktfId } = await params

  const [detail, audit] = await Promise.all([
    fetchTransferFormDetail(ktfId),
    fetchKtfAudit(ktfId),
  ])

  if (!detail) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">KTF detayı yükleniyor...</div>}>
      <DetailPageContent initialDetail={detail} initialAudit={audit} />
    </Suspense>
  )
}
