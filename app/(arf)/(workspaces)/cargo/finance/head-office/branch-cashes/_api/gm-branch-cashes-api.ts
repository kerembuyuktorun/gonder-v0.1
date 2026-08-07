import type {
  BranchRiskLevel,
  GmBranchCashDetail,
  GmBranchCashNote,
  GmBranchCashRow,
  GmBranchCashSummary,
  GmBranchCashTransferHistoryRow,
} from "../_types"
import type { BranchCashItem } from "../../../branch-transfer-center/branch-cash/_types"
import { mockBranchCashItems } from "../../../branch-transfer-center/branch-cash/_mock/branch-cash-mock-data"
import {
  gmBranchCashDetailsMockMap,
  gmBranchCashNotesMockRows,
  gmBranchCashesMockRows,
  gmBranchCashesMockSummary,
  gmBranchCashesTransferHistoryMockRows,
} from "../_mock/gm-branch-cashes-mock-data"

function calculateRiskLevelFromLastTransfer(lastTransferDate?: string): BranchRiskLevel {
  if (!lastTransferDate) {
    return "kritik"
  }

  const lastTransfer = new Date(lastTransferDate)
  const diffMs = Date.now() - lastTransfer.getTime()
  const daysSinceLastTransfer = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (daysSinceLastTransfer >= 14) {
    return "kritik"
  }

  if (daysSinceLastTransfer >= 7) {
    return "uyari"
  }

  return "normal"
}

function getBranchTransfers(branchId: string): GmBranchCashTransferHistoryRow[] {
  return gmBranchCashesTransferHistoryMockRows.filter((transfer) => transfer.branchId === branchId)
}

function getLatestTransferDate(transfers: GmBranchCashTransferHistoryRow[]): string | undefined {
  if (transfers.length === 0) {
    return undefined
  }

  return transfers.reduce((latest, transfer) => {
    if (!latest) {
      return transfer.talepTarihi
    }

    return new Date(transfer.talepTarihi).getTime() > new Date(latest).getTime() ? transfer.talepTarihi : latest
  }, transfers[0]?.talepTarihi)
}

export async function fetchGmBranchCashes(): Promise<GmBranchCashRow[]> {
  const rows = await Promise.all(
    gmBranchCashesMockRows.map(async (row) => {
      const cashItems = await fetchGmBranchCashItemsByBranch(row.branchId)
      const toplamAlacak = cashItems.reduce((sum, item) => sum + item.amount, 0)
      const branchTransfers = getBranchTransfers(row.branchId)
      const pendingTransfers = branchTransfers.filter((transfer) => transfer.durum === "beklemede")
      const bekleyenTransferAdet = pendingTransfers.length
      const bekleyenTransferToplami = pendingTransfers.reduce((sum, transfer) => sum + transfer.transferTutari, 0)
      const sonTransferTarihi = getLatestTransferDate(branchTransfers)

      return {
        ...row,
        toplamAlacak,
        bekleyenTransferAdet,
        bekleyenTransferToplami,
        sonTransferTarihi,
        riskSeviyesi: calculateRiskLevelFromLastTransfer(sonTransferTarihi),
      }
    }),
  )

  return rows
}

export async function fetchGmBranchCashesSummary(): Promise<GmBranchCashSummary> {
  const rows = await fetchGmBranchCashes()
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const son30GunOnaylananToplam = gmBranchCashesTransferHistoryMockRows
    .filter((transfer) => transfer.durum === "onaylandi")
    .filter((transfer) => {
      const approvedAt = transfer.onayTarihi ?? transfer.talepTarihi
      return new Date(approvedAt).getTime() >= thirtyDaysAgo
    })
    .reduce((sum, transfer) => sum + transfer.transferTutari, 0)

  return {
    ...gmBranchCashesMockSummary,
    toplamSubeAlacagi: rows.reduce((sum, row) => sum + row.toplamAlacak, 0),
    onayBekleyenTransferToplami: rows.reduce((sum, row) => sum + row.bekleyenTransferToplami, 0),
    onayBekleyenTransferAdet: rows.reduce((sum, row) => sum + row.bekleyenTransferAdet, 0),
    son30GunOnaylananToplam,
  }
}

export async function fetchGmBranchCashDetail(branchId: string): Promise<GmBranchCashDetail | null> {
  const detail = gmBranchCashDetailsMockMap[branchId]

  if (!detail) {
    return null
  }

  const branchTransfers = getBranchTransfers(branchId)
  const sonTransferTarihi = getLatestTransferDate(branchTransfers)

  return {
    ...detail,
    sonTransferTarihi,
    riskSeviyesi: calculateRiskLevelFromLastTransfer(sonTransferTarihi),
  }
}

function getFixedBranchName(detail: GmBranchCashDetail): string {
  return `${detail.city} Şube`
}

function applyFixedBranchFilter(item: BranchCashItem, fixedBranchName: string): BranchCashItem {
  if (item.paymentType === "pesin") {
    return {
      ...item,
      senderBranch: fixedBranchName,
    }
  }

  return {
    ...item,
    receiverBranch: fixedBranchName,
  }
}

function getBranchAmountMultiplier(branchId: string): number {
  const multiplierByBranchId: Record<string, number> = {
    "istanbul-avrupa-merkez": 1,
    "izmir-merkez": 0.72,
    "v-lojistik": 0.49,
    "konya-merkez": 0.38,
  }

  return multiplierByBranchId[branchId] ?? 1
}

export async function fetchGmBranchCashItemsByBranch(branchId: string): Promise<BranchCashItem[]> {
  const detail = await fetchGmBranchCashDetail(branchId)

  if (!detail) {
    return []
  }

  const fixedBranchName = getFixedBranchName(detail)
  const branchAmountMultiplier = getBranchAmountMultiplier(branchId)

  return mockBranchCashItems.slice(0, 10).map((item, index) => ({
    ...applyFixedBranchFilter(item, fixedBranchName),
    id: `${branchId}-${item.id}`,
    branchId,
    shipmentId: `${index + 1}`,
    amount: Number((item.amount * branchAmountMultiplier).toFixed(2)),
  }))
}

export async function fetchGmBranchCashTransferHistory(branchId: string): Promise<GmBranchCashTransferHistoryRow[]> {
  return gmBranchCashesTransferHistoryMockRows
    .filter((row) => row.branchId === branchId)
    .sort((left, right) => right.talepTarihi.localeCompare(left.talepTarihi))
}

export async function fetchGmBranchCashNotes(branchId: string): Promise<GmBranchCashNote[]> {
  return gmBranchCashNotesMockRows
    .filter((note) => note.branchId === branchId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}
