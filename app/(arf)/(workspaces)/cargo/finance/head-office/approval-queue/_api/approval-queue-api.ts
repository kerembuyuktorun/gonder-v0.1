import type { ApprovalQueueRecord, ApprovalQueueSummary } from "../_types"
import { approvalQueueMockRows } from "../_mock/approval-queue-mock-data"
import {
  fetchIncomingBankTransactionsByReference,
  type IncomingBankTransactionMatchCandidate,
} from "../../../headquarters/bank-accounts/_api/bank-accounts-api"

export async function fetchApprovalQueueRows(): Promise<ApprovalQueueRecord[]> {
  return [...approvalQueueMockRows].sort(
    (left, right) => new Date(right.talepTarihi).getTime() - new Date(left.talepTarihi).getTime(),
  )
}

export async function fetchApprovalQueueSummary(): Promise<ApprovalQueueSummary> {
  const rows = await fetchApprovalQueueRows()
  const pendingRows = rows.filter((row) => row.durum === "beklemede")
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

  return {
    toplamTalepAdet: rows.length,
    bekleyenAdet: pendingRows.length,
    bekleyenToplam: pendingRows.reduce((sum, row) => sum + row.transferTutari, 0),
    son30GunOnaylananToplam: rows
      .filter((row) => row.durum === "onaylandi")
      .filter((row) => {
        const approvedAt = row.onayTarihi ?? row.talepTarihi
        return new Date(approvedAt).getTime() >= thirtyDaysAgo
      })
      .reduce((sum, row) => sum + row.transferTutari, 0),
  }
}

export interface ManualApprovalPayload {
  approvalQueueId: string
  transaction: IncomingBankTransactionMatchCandidate
}

export async function fetchManualApprovalCandidates(
  referenceNumber: string,
): Promise<IncomingBankTransactionMatchCandidate[]> {
  return fetchIncomingBankTransactionsByReference(referenceNumber)
}

export async function approveQueueTransferManually(
  payload: ManualApprovalPayload,
): Promise<ApprovalQueueRecord | undefined> {
  const target = approvalQueueMockRows.find((row) => row.id === payload.approvalQueueId)

  if (!target || target.durum !== "beklemede") {
    return undefined
  }

  const now = new Date().toISOString()
  target.durum = "onaylandi"
  target.onayTarihi = now
  target.manuelOnaylayanKullanici = "Mevcut Kullanıcı"
  target.matchedBankTransactionId = payload.transaction.transactionId
  target.matchedBankAccountId = payload.transaction.bankAccountId
  target.matchedBankAccountLabel = payload.transaction.bankAccountLabel
  target.aciklama = `Manuel onay: ${payload.transaction.bankAccountLabel} / ${payload.transaction.transactionId}`

  return { ...target }
}
