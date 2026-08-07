import type { CustomerCashregisterRecord, CustomerCashregisterSummary } from "../_types"
import { getCustomerCashregisters, getCustomerCashregisterSummary } from "../_mock/customer-cashregisters-mock-data"

// TODO: Remove mock when API is ready
export async function fetchCustomerCashregisters(): Promise<CustomerCashregisterRecord[]> {
  return getCustomerCashregisters()
}

// TODO: Remove mock when API is ready
export async function fetchCustomerCashregisterSummary(): Promise<CustomerCashregisterSummary> {
  return getCustomerCashregisterSummary()
}
