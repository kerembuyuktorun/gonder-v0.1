import { notFound } from "next/navigation"
import {
  fetchGmBranchCashDetail,
  fetchGmBranchCashItemsByBranch,
  fetchGmBranchCashNotes,
  fetchGmBranchCashTransferHistory,
} from "../_api/gm-branch-cashes-api"
import { GmBranchCashDetailPageContent } from "./_components/gm-branch-cash-detail-page-content"

interface Props {
  params: Promise<{ branchId: string }>
}

export default async function GmBranchCashDetailPage({ params }: Props) {
  const { branchId } = await params

  const [branch, cashItems, transfers, notes] = await Promise.all([
    fetchGmBranchCashDetail(branchId),
    fetchGmBranchCashItemsByBranch(branchId),
    fetchGmBranchCashTransferHistory(branchId),
    fetchGmBranchCashNotes(branchId),
  ])

  if (!branch) {
    notFound()
  }

  return <GmBranchCashDetailPageContent branch={branch} cashItems={cashItems} transfers={transfers} notes={notes} />
}
