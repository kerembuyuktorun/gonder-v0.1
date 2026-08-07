import { getTransferCenterById } from "../../_data/transfer-centers"
import type { TransferCenterBranch } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterBranches(centerId: string): Promise<TransferCenterBranch[]> {
  return getTransferCenterById(centerId)?.branches ?? []
}
