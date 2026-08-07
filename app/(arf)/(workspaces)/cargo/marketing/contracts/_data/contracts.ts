import {
  customerDetails,
  type ContractStatus,
  type CustomerContractRecord,
  type CustomerStatus,
  type CustomerType,
} from "../../customers/_data/customers"

export const CUSTOMER_CONTRACTS_STORAGE_PREFIX = "arf:customers:contracts:v1:"

export const getCustomerContractsStorageKey = (customerId: string) =>
  `${CUSTOMER_CONTRACTS_STORAGE_PREFIX}${customerId}`

type StoredContractRecord = CustomerContractRecord & {
  isActive?: boolean
}

export type ContractListRow = {
  id: string
  customerId: string
  musteri: string
  musteri_tip: CustomerType
  musteri_durum: CustomerStatus
  sozlesme_durum: ContractStatus
  sozlesme_no: string
  belge_no: string
  baslangic_tarihi: string
  bitis_tarihi: string
  aciklama: string
}

const isContractStatus = (value: unknown): value is ContractStatus =>
  value === "active" || value === "expired" || value === "draft"

const resolveContractStatus = (contract: StoredContractRecord): ContractStatus => {
  if (isContractStatus(contract.status)) {
    return contract.status
  }

  return contract.isActive ? "active" : "draft"
}

const resolveCustomerDisplayName = (customerType: CustomerType, tradeName: string, firstName: string, lastName: string) =>
  customerType === "corporate" ? tradeName : `${firstName} ${lastName}`.trim()

const toDateOnly = (value?: string) => {
  if (!value) {
    return "-"
  }

  if (value.includes(" ")) {
    return value.split(" ")[0] || value
  }

  if (value.includes("T")) {
    return value.split("T")[0] || value
  }

  return value
}

export function loadContractsSourceMapFromStorage(): Record<string, StoredContractRecord[]> {
  if (typeof window === "undefined") {
    return {}
  }

  const contractsMap: Record<string, StoredContractRecord[]> = {}

  for (const customer of customerDetails) {
    try {
      const raw = localStorage.getItem(getCustomerContractsStorageKey(customer.id))
      if (!raw) {
        continue
      }

      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        contractsMap[customer.id] = parsed as StoredContractRecord[]
      }
    } catch {
      // ignore storage parse errors in demo flow
    }
  }

  return contractsMap
}

export function buildContractListRows(
  contractsByCustomer: Record<string, StoredContractRecord[]> = {},
): ContractListRow[] {
  return customerDetails.flatMap((customer) => {
    const sourceContracts = contractsByCustomer[customer.id] ?? customer.contracts

    if (!Array.isArray(sourceContracts) || sourceContracts.length === 0) {
      return []
    }

    const musteri = resolveCustomerDisplayName(
      customer.customerType,
      customer.tradeName,
      customer.firstName,
      customer.lastName,
    )

    return sourceContracts.map((contract, index) => ({
      id: `${customer.id}-${contract.id || index}`,
      customerId: customer.id,
      musteri,
      musteri_tip: customer.customerType,
      musteri_durum: customer.status,
      sozlesme_durum: resolveContractStatus(contract),
      sozlesme_no: contract.contractNo || "-",
      belge_no: contract.documentNo || "-",
      baslangic_tarihi: toDateOnly(contract.startDate),
      bitis_tarihi: toDateOnly(contract.endDate),
      aciklama: contract.note || "-",
    }))
  })
}
