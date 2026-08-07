import { getTransferCenterById } from "../../_data/transfer-centers"
import type { CommissionRecord } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterCommissionRecords(centerId: string): Promise<CommissionRecord[]> {
  return getTransferCenterById(centerId)?.commissionRecords ?? []
}
