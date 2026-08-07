// TODO: Remove when API is ready
import type { ApprovalQueueRecord } from "../_types"
import { gmBranchCashesTransferHistoryMockRows } from "../../branch-cashes/_mock/gm-branch-cashes-mock-data"

export const approvalQueueMockRows: ApprovalQueueRecord[] = [
  ...gmBranchCashesTransferHistoryMockRows.map((transfer) => ({
    id: transfer.id,
    branchId: transfer.branchId,
    transferNo: transfer.transferNo,
    branchName: transfer.branchName,
    iban: transfer.iban,
    sorguNo: transfer.sorguNo,
    transferTutari: transfer.transferTutari,
    durum: transfer.durum,
    l1: transfer.l1,
    l2: transfer.l2,
    l3: transfer.l3,
    talepTarihi: transfer.talepTarihi,
    onayTarihi: transfer.onayTarihi,
    aciklama: transfer.aciklama,
    olusturanKullanici: transfer.olusturanKullanici,
  })),
  {
    id: "trf-manual-001",
    branchId: "istanbul-avrupa-merkez",
    transferNo: "TRF-2026-1999",
    branchName: "İstanbul Avrupa Merkez Şube",
    iban: "TR33 0006 1005 1978 6457 8413 26",
    sorguNo: "REF-MANUAL-001",
    transferTutari: 51250,
    durum: "beklemede",
    l1: "ok",
    l2: "ok",
    l3: "ok",
    talepTarihi: "2026-04-10T11:10:00Z",
    aciklama: "Manuel onay test kaydı",
    olusturanKullanici: "istanbul.ops",
  },
]
