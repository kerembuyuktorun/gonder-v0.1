import { getTransferCenterById } from "../../_data/transfer-centers"
import type { TransferCenter } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchTransferCenterDetail(id: string): Promise<TransferCenter | undefined> {
  return getTransferCenterById(id)

  // Backend hazır olunca:
  // const res = await fetch(`${process.env.API_BASE_URL}/transfer-centers/${id}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   cache: "no-store",
  // })
  // if (!res.ok) return undefined
  // return res.json() as Promise<TransferCenter>
}
