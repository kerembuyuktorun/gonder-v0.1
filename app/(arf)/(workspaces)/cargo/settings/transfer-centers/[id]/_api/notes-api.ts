import { getTransferCenterById } from "../../_data/transfer-centers"
import type { TransferCenterNote } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterNotes(centerId: string): Promise<TransferCenterNote[]> {
  return getTransferCenterById(centerId)?.notes ?? []
}
