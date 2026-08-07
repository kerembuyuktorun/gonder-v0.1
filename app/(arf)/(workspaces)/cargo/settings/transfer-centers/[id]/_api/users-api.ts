import { getTransferCenterById } from "../../_data/transfer-centers"
import type { TransferCenterUser } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterUsers(centerId: string): Promise<TransferCenterUser[]> {
  return getTransferCenterById(centerId)?.users ?? []
}
