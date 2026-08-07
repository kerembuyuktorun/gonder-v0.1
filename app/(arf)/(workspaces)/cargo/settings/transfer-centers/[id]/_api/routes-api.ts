import { getTransferCenterById } from "../../_data/transfer-centers"
import type { TransferCenterRoute } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterRoutes(centerId: string): Promise<TransferCenterRoute[]> {
  return getTransferCenterById(centerId)?.routes ?? []
}
