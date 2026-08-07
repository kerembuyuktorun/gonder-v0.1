import type { BranchCashItem, BranchCashSummary, TransferRecord } from "../_types"
import {
  mockBranchCashItems,
  mockTransferRecords,
} from "../_mock/branch-cash-mock-data"
import { gmBranchCashesTransferHistoryMockRows } from "../../../head-office/branch-cashes/_mock/gm-branch-cashes-mock-data"

const DEFAULT_ACTIVE_BRANCH_ID = "branch-konya"

const branchKeywordById: Record<string, string> = {
  "branch-konya": "konya",
  "branch-antalya": "antalya",
  "branch-istanbul": "istanbul",
}

const branchDisplayNameById: Record<string, string> = {
  "branch-konya": "Konya Şube",
  "branch-antalya": "Antalya Şube",
  "branch-istanbul": "İstanbul Şube",
}

const branchAmountMultiplierById: Record<string, number> = {
  "branch-konya": 0.38,
  "branch-antalya": 0.72,
  "branch-istanbul": 1,
}

const gmBranchIdByBranchId: Record<string, string> = {
  "branch-konya": "konya-merkez",
  "branch-antalya": "izmir-merkez",
  "branch-istanbul": "istanbul-avrupa-merkez",
}

function resolveBranchContext(branchId?: string): { branchId: string; branchKeyword: string } {
  const resolvedBranchId = branchId ?? DEFAULT_ACTIVE_BRANCH_ID
  const branchKeyword = (branchKeywordById[resolvedBranchId] ?? "konya").toLocaleLowerCase("tr-TR")

  return {
    branchId: resolvedBranchId,
    branchKeyword,
  }
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR")
}

function matchesBranchCashVisibility(item: BranchCashItem, branchKeyword: string): boolean {
  if (item.paymentType === "pesin") {
    return normalize(item.senderBranch).includes(branchKeyword)
  }

  return normalize(item.receiverBranch).includes(branchKeyword)
}

export async function fetchBranchCashItems(branchId?: string): Promise<BranchCashItem[]> {
  const { branchId: resolvedBranchId, branchKeyword } = resolveBranchContext(branchId)
  const branchDisplayName = branchDisplayNameById[resolvedBranchId] ?? "Konya Şube"
  const amountMultiplier = branchAmountMultiplierById[resolvedBranchId] ?? 1

  return mockBranchCashItems
    .slice(0, 10)
    .map((item) => {
      const normalizedSender = normalize(item.senderBranch)
      const normalizedReceiver = normalize(item.receiverBranch)

      const branchScopedItem: BranchCashItem = {
        ...item,
        branchId: resolvedBranchId,
        amount: Number((item.amount * amountMultiplier).toFixed(2)),
        senderBranch: item.paymentType === "pesin" ? branchDisplayName : item.senderBranch,
        receiverBranch: item.paymentType === "alici_odemeli" ? branchDisplayName : item.receiverBranch,
      }

      const keepByRule =
        (branchScopedItem.paymentType === "pesin" && normalizedSender.includes(branchKeyword)) ||
        (branchScopedItem.paymentType === "alici_odemeli" && normalizedReceiver.includes(branchKeyword)) ||
        matchesBranchCashVisibility(branchScopedItem, branchKeyword)

      return {
        keepByRule,
        item: branchScopedItem,
      }
    })
    .filter((entry) => entry.keepByRule)
    .map((entry) => entry.item)
}

export async function fetchBranchCashSummary(branchId?: string): Promise<BranchCashSummary> {
  const [rows, transferRecords] = await Promise.all([
    fetchBranchCashItems(branchId),
    fetchTransferRecords(branchId),
  ])

  const pendingTransfers = transferRecords.filter((record) => record.status === "pending_approval")
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

  return {
    toplamSubeBorcu: rows.reduce((sum, item) => sum + item.amount, 0),
    onayBekleyenTransfer: pendingTransfers.length,
    onayBekleyenTransferToplami: pendingTransfers.reduce((sum, record) => sum + record.totalAmount, 0),
    son30GunOnaylanan: transferRecords
      .filter((record) => record.status === "approved")
      .filter((record) => new Date(record.transferDate).getTime() >= thirtyDaysAgo)
      .reduce((sum, record) => sum + record.totalAmount, 0),
  }
}

export async function fetchTransferRecords(branchId?: string): Promise<TransferRecord[]> {
  const { branchId: resolvedBranchId } = resolveBranchContext(branchId)
  const gmBranchId = gmBranchIdByBranchId[resolvedBranchId]

  if (gmBranchId) {
    return gmBranchCashesTransferHistoryMockRows
      .filter((transfer) => transfer.branchId === gmBranchId)
      .map((transfer) => ({
        id: transfer.id,
        branchId: resolvedBranchId,
        transferDate: transfer.onayTarihi ?? transfer.talepTarihi,
        totalAmount: transfer.transferTutari,
        itemCount: 0,
        status:
          transfer.durum === "beklemede"
            ? "pending_approval"
            : transfer.durum === "onaylandi"
              ? "approved"
              : "rejected",
        queryNumber: transfer.sorguNo,
        targetIban: transfer.iban,
      }))
  }

  return mockTransferRecords.filter((record) => record.branchId === resolvedBranchId)
}

export async function isQueryNumberUsed(queryNumber: string): Promise<boolean> {
  const records = await fetchTransferRecords(DEFAULT_ACTIVE_BRANCH_ID)

  return records
    .filter((record) => record.status === "approved")
    .some((record) => record.queryNumber === queryNumber)
}
