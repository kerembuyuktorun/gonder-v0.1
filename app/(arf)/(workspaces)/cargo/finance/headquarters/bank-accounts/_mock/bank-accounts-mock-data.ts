import { mockBranches } from "../../../../settings/branches/_mock/branches-mock-data"
import type { BankAccountAuditLog, BankAccountDetail, BankAccountRecord, BankAccountTransaction } from "../_types"
import type { AccountType, BankAccountStatus, Currency, IntegrationStatus } from "../_types"
import { resolveBankNameByCode } from "./turkey-banks-data"

function getBranchNames(ids: string[]): string[] {
  return ids
    .map((id) => mockBranches.find((branch) => branch.id === id)?.ad)
    .filter((value): value is string => Boolean(value))
}

function cloneAudit(entry: BankAccountAuditLog): BankAccountAuditLog {
  return { ...entry }
}

function cloneTransaction(entry: BankAccountTransaction): BankAccountTransaction {
  return { ...entry }
}

function cloneDetail(detail: BankAccountDetail): BankAccountDetail {
  return {
    ...detail,
    allowedBranchIds: [...detail.allowedBranchIds],
    allowedBranchNames: [...detail.allowedBranchNames],
    auditLogs: detail.auditLogs.map(cloneAudit),
    transactions: detail.transactions.map(cloneTransaction),
  }
}

function toRecord(detail: BankAccountDetail): BankAccountRecord {
  return {
    id: detail.id,
    iban: detail.iban,
    bankCode: detail.bankCode,
    bankName: detail.bankName,
    branchName: detail.branchName,
    currency: detail.currency,
    balance: detail.balance,
    accountHolder: detail.accountHolder,
    label: detail.label,
    accountType: detail.accountType,
    isOpenToAllBranches: detail.isOpenToAllBranches,
    allowedBranchIds: [...detail.allowedBranchIds],
    allowedBranchNames: [...detail.allowedBranchNames],
    integrationStatus: detail.integrationStatus,
    status: detail.status,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    lastDataSyncAt: detail.lastDataSyncAt,
    createdBy: detail.createdBy,
    createdByName: detail.createdByName,
  }
}

function makeTransaction(
  id: string,
  date: string,
  description: string,
  amount: number,
  balanceAfter: number,
  direction: "credit" | "debit",
  currency: Currency,
  matchStatus: BankAccountTransaction["matchStatus"] = "unmatched",
  matchSource?: BankAccountTransaction["matchSource"],
  matchedEntityId?: string,
  matchedEntityLabel?: string,
  matchedAt?: string,
  matchedBy?: string,
  senderName?: string,
  senderIban?: string,
  referenceNumber?: string,
  recipientName?: string,
  recipientIban?: string,
): BankAccountTransaction {
  return {
    id,
    date,
    description,
    senderName,
    senderIban,
    recipientName,
    recipientIban,
    referenceNumber,
    amount,
    balanceAfter,
    direction,
    currency,
    matchStatus,
    matchSource,
    matchedEntityId,
    matchedEntityLabel,
    matchedAt,
    matchedBy,
  }
}

function makeAudit(
  id: string,
  bankAccountId: string,
  action: BankAccountAuditLog["action"],
  actorName: string,
  previousValue: string | undefined,
  newValue: string,
  timestamp: string,
): BankAccountAuditLog {
  return {
    id,
    bankAccountId,
    action,
    actor: actorName.toLowerCase().replace(/\s+/g, "-"),
    actorName,
    previousValue,
    newValue,
    timestamp,
  }
}

function makeDetail(input: {
  id: string
  iban: string
  branchName: string
  currency: Currency
  balance: number
  accountHolder: string
  label: string
  accountType: AccountType
  isOpenToAllBranches: boolean
  allowedBranchIds: string[]
  integrationStatus: IntegrationStatus
  status: BankAccountStatus
  createdAt: string
  updatedAt: string
  lastDataSyncAt?: string
  createdByName: string
  transactions: BankAccountTransaction[]
  auditLogs: BankAccountAuditLog[]
}): BankAccountDetail {
  const bankCode = input.iban.slice(4, 9)
  return {
    id: input.id,
    iban: input.iban,
    bankCode,
    bankName: resolveBankNameByCode(bankCode),
    branchName: input.branchName,
    currency: input.currency,
    balance: input.balance,
    accountHolder: input.accountHolder,
    label: input.label,
    accountType: input.accountType,
    isOpenToAllBranches: input.isOpenToAllBranches,
    allowedBranchIds: [...input.allowedBranchIds],
    allowedBranchNames: getBranchNames(input.allowedBranchIds),
    integrationStatus: input.integrationStatus,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    lastDataSyncAt: input.lastDataSyncAt,
    createdBy: input.createdByName.toLowerCase().replace(/\s+/g, "-"),
    createdByName: input.createdByName,
    transactions: input.transactions.map(cloneTransaction),
    auditLogs: input.auditLogs.map(cloneAudit),
  }
}

const bankAccountDetailsStore: BankAccountDetail[] = [
  makeDetail({
    id: "ba-1",
    iban: "TR090001061234567890123456",
    branchName: "Kadıköy Şubesi",
    currency: "TRY",
    balance: 1284500.25,
    accountHolder: "ARF Lojistik A.Ş.",
    label: "Ana Kasa Tahsilat",
    accountType: "collection",
    isOpenToAllBranches: true,
    allowedBranchIds: mockBranches.map((branch) => branch.id),
    integrationStatus: "active",
    status: "active",
    createdAt: "2026-03-18T09:00:00",
    updatedAt: "2026-03-22T10:20:00",
    lastDataSyncAt: "2026-03-22T11:00:00",
    createdByName: "Derya Aydın",
    transactions: [
      makeTransaction(
        "txn-1",
        "2026-03-22T09:10:00",
        "İstanbul Merkez günlük tahsilat",
        245000,
        1284500.25,
        "credit",
        "TRY",
        "auto_matched",
        "branch_transfer",
        "BTM-1001",
        "BTM-1001",
        "2026-03-22T09:14:00",
        "Sistem",
        "Marmara Perakende A.Ş.",
        "TR090001061234567890123456",
        "TRF-2026-1001",
      ),
      makeTransaction(
        "txn-2",
        "2026-03-21T16:30:00",
        "Müşteri ödemesi (Sözleşmeli Fatura)",
        187250,
        1039500.25,
        "credit",
        "TRY",
        "auto_matched",
        "customer_invoice",
        "CINV-4481",
        "CINV-4481",
        "2026-03-21T16:35:00",
        "Sistem",
        "ABC Şirket Ltd.",
        "TR250004649876543210987654",
        "INV-2026-4481",
      ),
      makeTransaction(
        "txn-10",
        "2026-04-09T08:42:00",
        "Şube transfer alacağı - manuel onay adayı",
        64800,
        1104300.25,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Luna E-Ticaret A.Ş.",
        "TR910006100519786457841355",
        "REF-984212",
      ),
      makeTransaction(
        "txn-12",
        "2026-04-08T10:22:00",
        "Şube transfer alacağı - onay kuyruğu eşleşmesi",
        85000,
        1189300.25,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Pera Market A.Ş.",
        "TR120006100519786457841389",
        "REF-984211",
      ),
      makeTransaction(
        "txn-13",
        "2026-04-10T11:05:00",
        "Manuel onay test eşleşmesi",
        51250,
        1240550.25,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Atlas Perakende Ltd.",
        "TR440006100519786457841366",
        "REF-MANUAL-001",
      ),
      makeTransaction(
        "txn-14",
        "2026-04-10T14:35:00",
        "Müşteri fatura tahsilatı - otomatik eşleşme testi",
        20000,
        1260550.25,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "TPRK SU PLASTİK",
        "TR250004649876543210987654",
        "CINV-AUTO-001",
      ),
      makeTransaction(
        "txn-15",
        "2026-04-10T15:10:00",
        "Müşteri ikinci fatura tahsilatı - bilgi satırı testi",
        7350,
        1267900.25,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "TPRK SU PLASTİK",
        "TR250004649876543210987654",
        "CINV-AUTO-002",
      ),
      makeTransaction(
        "txn-3",
        "2026-03-21T13:00:00",
        "Tedarikçi ödeme transferi",
        92500,
        852250.25,
        "debit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "PUR-2026-889",
        "XYZ Kargo Ltd.",
        "TR530006281122334455667788",
      ),
    ],
    auditLogs: [
      makeAudit("audit-1", "ba-1", "integration_toggle", "Mevcut Kullanıcı", "Pasif", "Aktif", "2026-03-22T10:20:00"),
      makeAudit("audit-2", "ba-1", "create", "Derya Aydın", undefined, "Banka hesabı oluşturuldu", "2026-03-18T09:00:00"),
    ],
  }),
  makeDetail({
    id: "ba-2",
    iban: "TR250004649876543210987654",
    branchName: "FSM Şubesi",
    currency: "TRY",
    balance: 482300.9,
    accountHolder: "ARF Lojistik A.Ş.",
    label: "Marmara Bölgesi Tahsilatları",
    accountType: "collection",
    isOpenToAllBranches: false,
    allowedBranchIds: ["1", "4"],
    integrationStatus: "active",
    status: "active",
    createdAt: "2026-03-15T08:40:00",
    updatedAt: "2026-03-21T18:15:00",
    lastDataSyncAt: "2026-03-21T19:30:00",
    createdByName: "Serkan Demir",
    transactions: [
      makeTransaction(
        "txn-4",
        "2026-03-21T17:45:00",
        "İstanbul Anadolu toplu tahsilat",
        126500,
        482300.9,
        "credit",
        "TRY",
        "manual_matched",
        "branch_transfer",
        "BTM-1002",
        "Şube Transfer Kaydı - BTM-1002",
        "2026-03-21T18:20:00",
        "Mevcut Kullanıcı",
        "Anadolu Toptan Gıda Ltd.",
        "TR250004649876543210987654",
        "TRF-2026-1002",
      ),
      makeTransaction(
        "txn-5",
        "2026-03-20T11:15:00",
        "Bursa operasyon gideri",
        38500,
        355800.9,
        "debit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "EXP-2026-445",
        "İş Teknoloji Ltd.",
        "TR860006414433221100998877",
      ),
      makeTransaction(
        "txn-11",
        "2026-04-09T09:55:00",
        "Konya transfer tahsilatı - manuel onay adayı",
        98000,
        453800.9,
        "credit",
        "TRY",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Konya Tarım Ürünleri A.Ş.",
        "TR740006100519786457841377",
        "REF-984611",
      ),
    ],
    auditLogs: [
      makeAudit("audit-3", "ba-2", "branch_scope_update", "Mevcut Kullanıcı", "Tüm şubeler", "İstanbul Merkez, İstanbul Anadolu", "2026-03-21T18:15:00"),
      makeAudit("audit-4", "ba-2", "create", "Serkan Demir", undefined, "Banka hesabı oluşturuldu", "2026-03-15T08:40:00"),
    ],
  }),
  makeDetail({
    id: "ba-3",
    iban: "TR530006281122334455667788",
    branchName: "Konak Şubesi",
    currency: "USD",
    balance: 22480.72,
    accountHolder: "ARF Lojistik A.Ş.",
    label: "İhracat USD Havuzu",
    accountType: "collection",
    isOpenToAllBranches: false,
    allowedBranchIds: ["3"],
    integrationStatus: "passive",
    status: "active",
    createdAt: "2026-03-12T14:20:00",
    updatedAt: "2026-03-20T09:05:00",
    lastDataSyncAt: "2026-03-20T10:00:00",
    createdByName: "Nazlı Yaman",
    transactions: [
      makeTransaction(
        "txn-6",
        "2026-03-20T08:20:00",
        "İzmir Merkez ihracat tahsilatı",
        6800,
        22480.72,
        "credit",
        "USD",
        "auto_matched",
        "branch_transfer",
        "BTM-1107",
        "Şube Transfer Kaydı - BTM-1107",
        "2026-03-20T08:22:00",
        "Sistem",
        "Ege Dış Ticaret A.Ş.",
        "TR530006281122334455667788",
        "TRF-2026-1107",
      ),
      makeTransaction(
        "txn-7",
        "2026-03-18T15:10:00",
        "Kur farkı düzeltme kaydı",
        120.4,
        15680.72,
        "credit",
        "USD",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Delta Yazılım A.Ş.",
        "TR330006281122334455667799",
        "ADJ-2026-112",
      ),
    ],
    auditLogs: [
      makeAudit("audit-5", "ba-3", "integration_toggle", "Mevcut Kullanıcı", "Aktif", "Pasif", "2026-03-20T09:05:00"),
      makeAudit("audit-6", "ba-3", "create", "Nazlı Yaman", undefined, "Banka hesabı oluşturuldu", "2026-03-12T14:20:00"),
    ],
  }),
  makeDetail({
    id: "ba-4",
    iban: "TR860006414433221100998877",
    branchName: "Operasyon Merkezi",
    currency: "EUR",
    balance: 5400.15,
    accountHolder: "ARF Lojistik A.Ş.",
    label: "Genel Merkez Gider Hesabı",
    accountType: "expense",
    isOpenToAllBranches: false,
    allowedBranchIds: [],
    integrationStatus: "passive",
    status: "closed",
    createdAt: "2026-03-05T10:10:00",
    updatedAt: "2026-03-19T16:50:00",
    lastDataSyncAt: "2026-03-19T17:45:00",
    createdByName: "Ömer Koç",
    transactions: [
      makeTransaction(
        "txn-8",
        "2026-03-18T09:00:00",
        "Yurt dışı lisans ödemesi",
        820,
        5400.15,
        "debit",
        "EUR",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "LIC-2026-001",
        "Global Software Inc.",
        "DE89370400440532013000",
      ),
      makeTransaction(
        "txn-9",
        "2026-03-10T12:30:00",
        "Hizmet iadesi",
        1500,
        6220.15,
        "credit",
        "EUR",
        "unmatched",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Danışmanlık Kurumu Ltd.",
        "TR860006414433221100998877",
        "REF-2026-002",
      ),
    ],
    auditLogs: [
      makeAudit("audit-7", "ba-4", "status_change", "Mevcut Kullanıcı", "Aktif", "Kapalı", "2026-03-19T16:50:00"),
      makeAudit("audit-8", "ba-4", "create", "Ömer Koç", undefined, "Banka hesabı oluşturuldu", "2026-03-05T10:10:00"),
    ],
  }),
]

function sortByUpdatedAt(records: BankAccountRecord[]): BankAccountRecord[] {
  return records.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

function normalizeReference(value?: string): string {
  return (value ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/[^0-9A-Z]/g, "")
}

function normalizeIban(value?: string): string {
  return (value ?? "").replace(/\s+/g, "").toLocaleUpperCase("tr-TR")
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

const CUSTOMER_SENDER_MATCHES_STORAGE_KEY = "arf-bank-customer-sender-matches"

interface CustomerSenderMatch {
  senderIban: string
  senderName: string
  customerId: string
  customerName: string
  linkedAt: string
  linkedBy: string
}

const MATCH_SOURCE_LABELS: Record<NonNullable<BankAccountTransaction["matchSource"]>, string> = {
  branch_transfer: "Şube Transferi",
  customer_invoice: "Sözleşmeli Fatura",
  supplier_payment: "Tedarikçi Ödemesi",
}

function cloneCustomerSenderMatch(entry: CustomerSenderMatch): CustomerSenderMatch {
  return { ...entry }
}

let customerSenderMatchesStore: CustomerSenderMatch[] = []

function readCustomerSenderMatchesStore(): CustomerSenderMatch[] {
  if (!canUseStorage()) {
    return customerSenderMatchesStore.map(cloneCustomerSenderMatch)
  }

  const raw = window.localStorage.getItem(CUSTOMER_SENDER_MATCHES_STORAGE_KEY)
  if (!raw) {
    return customerSenderMatchesStore.map(cloneCustomerSenderMatch)
  }

  try {
    return (JSON.parse(raw) as CustomerSenderMatch[]).map(cloneCustomerSenderMatch)
  } catch {
    return customerSenderMatchesStore.map(cloneCustomerSenderMatch)
  }
}

function writeCustomerSenderMatchesStore(next: CustomerSenderMatch[]): void {
  customerSenderMatchesStore = next.map(cloneCustomerSenderMatch)
  if (canUseStorage()) {
    window.localStorage.setItem(CUSTOMER_SENDER_MATCHES_STORAGE_KEY, JSON.stringify(customerSenderMatchesStore))
  }
}

function upsertCustomerSenderMatch(input: {
  senderIban?: string
  senderName?: string
  customerId?: string
  customerName?: string
}): void {
  const normalizedIban = normalizeIban(input.senderIban)
  const senderName = input.senderName?.trim()
  const customerId = input.customerId?.trim()
  const customerName = input.customerName?.trim()

  if (!normalizedIban || !senderName || !customerId || !customerName) {
    return
  }

  const current = readCustomerSenderMatchesStore()
  const nextMatch: CustomerSenderMatch = {
    senderIban: normalizedIban,
    senderName,
    customerId,
    customerName,
    linkedAt: new Date().toISOString(),
    linkedBy: "Mevcut Kullanıcı",
  }

  const existingIndex = current.findIndex((item) => item.senderIban === normalizedIban)
  if (existingIndex >= 0) {
    writeCustomerSenderMatchesStore(current.map((item, index) => (index === existingIndex ? nextMatch : item)))
    return
  }

  writeCustomerSenderMatchesStore([nextMatch, ...current])
}

export interface IncomingBankTransactionMatchCandidate {
  transactionId: string
  bankAccountId: string
  bankAccountLabel: string
  bankAccountIban: string
  bankName: string
  branchName: string
  senderName?: string
  senderIban?: string
  transactionDate: string
  referenceNumber?: string
  amount: number
  currency: Currency
  matchStatus: BankAccountTransaction["matchStatus"]
}

function toIncomingCandidate(
  detail: BankAccountDetail,
  transaction: BankAccountTransaction,
): IncomingBankTransactionMatchCandidate {
  return {
    transactionId: transaction.id,
    bankAccountId: detail.id,
    bankAccountLabel: detail.label,
    bankAccountIban: detail.iban,
    bankName: detail.bankName,
    branchName: detail.branchName,
    senderName: transaction.senderName,
    senderIban: transaction.senderIban,
    transactionDate: transaction.date,
    referenceNumber: transaction.referenceNumber,
    amount: transaction.amount,
    currency: transaction.currency,
    matchStatus: transaction.matchStatus,
  }
}

export function findIncomingTransactionsByReferenceNumber(
  referenceNumber: string,
): IncomingBankTransactionMatchCandidate[] {
  const normalizedRef = normalizeReference(referenceNumber)

  if (!normalizedRef) {
    return []
  }

  return bankAccountDetailsStore.flatMap((detail) =>
    detail.transactions
      .filter((transaction) => transaction.direction === "credit")
      .filter((transaction) => normalizeReference(transaction.referenceNumber) === normalizedRef)
      .map((transaction) => toIncomingCandidate(detail, transaction)),
  )
}

export function getUnmatchedIncomingTransactions(): IncomingBankTransactionMatchCandidate[] {
  return bankAccountDetailsStore.flatMap((detail) =>
    detail.transactions
      .filter((transaction) => transaction.direction === "credit")
      .filter((transaction) => transaction.matchStatus === "unmatched")
      .map((transaction) => toIncomingCandidate(detail, transaction)),
  )
}

export function resolveMappedCustomerIdForSenderIban(senderIban?: string): string | null {
  const normalizedIban = normalizeIban(senderIban)
  if (!normalizedIban) {
    return null
  }

  const matches = readCustomerSenderMatchesStore()
  const match = matches.find((item) => item.senderIban === normalizedIban)
  return match?.customerId ?? null
}

export interface MappedCustomerForSender {
  customerId: string
  customerName: string
  senderIban: string
  senderName: string
}

export function resolveMappedCustomerForSenderIban(
  senderIban?: string,
): MappedCustomerForSender | null {
  const normalizedIban = normalizeIban(senderIban)
  if (!normalizedIban) {
    return null
  }

  const matches = readCustomerSenderMatchesStore()
  const match = matches.find((item) => item.senderIban === normalizedIban)
  if (!match) {
    return null
  }

  return {
    customerId: match.customerId,
    customerName: match.customerName,
    senderIban: match.senderIban,
    senderName: match.senderName,
  }
}

export interface ManualTransactionMatchPayload {
  transactionId: string
  matchSource: NonNullable<BankAccountTransaction["matchSource"]>
  matchedEntityId: string
  matchedBy?: string
  customerId?: string
  customerName?: string
  senderIban?: string
  senderName?: string
}

export function applyStoredManualTransactionMatch(
  payload: ManualTransactionMatchPayload,
): BankAccountTransaction | undefined {
  for (const detail of bankAccountDetailsStore) {
    const transaction = detail.transactions.find((item) => item.id === payload.transactionId)
    if (!transaction) {
      continue
    }

    const matchedAt = new Date().toISOString()
    transaction.matchStatus = "manual_matched"
    transaction.matchSource = payload.matchSource
    transaction.matchedEntityId = payload.matchedEntityId
    transaction.matchedEntityLabel = `${MATCH_SOURCE_LABELS[payload.matchSource]} - ${payload.matchedEntityId}`
    transaction.matchedAt = matchedAt
    transaction.matchedBy = payload.matchedBy ?? "Mevcut Kullanıcı"
    detail.updatedAt = matchedAt

    if (payload.matchSource === "customer_invoice") {
      upsertCustomerSenderMatch({
        senderIban: payload.senderIban ?? transaction.senderIban,
        senderName: payload.senderName ?? transaction.senderName,
        customerId: payload.customerId,
        customerName: payload.customerName,
      })
    }

    return { ...transaction }
  }

  return undefined
}

export function setIncomingTransactionMatchedAsCustomerInvoice(
  transactionId: string,
  matchedEntityId: string,
  matchedEntityLabel: string,
): boolean {
  for (const detail of bankAccountDetailsStore) {
    const transaction = detail.transactions.find((item) => item.id === transactionId)
    if (!transaction) {
      continue
    }

    transaction.matchStatus = "auto_matched"
    transaction.matchSource = "customer_invoice"
    transaction.matchedEntityId = matchedEntityId
    transaction.matchedEntityLabel = matchedEntityLabel
    transaction.matchedAt = new Date().toISOString()
    transaction.matchedBy = "Sistem"
    detail.updatedAt = transaction.matchedAt

    return true
  }

  return false
}

export function getBankAccountsList(): BankAccountRecord[] {
  return sortByUpdatedAt(bankAccountDetailsStore.map(toRecord))
}

export function getBankAccountDetailById(id: string): BankAccountDetail | undefined {
  const detail = bankAccountDetailsStore.find((item) => item.id === id)
  return detail ? cloneDetail(detail) : undefined
}

export function findBankAccountByIban(iban: string): BankAccountRecord | undefined {
  const cleaned = iban.replace(/\s/g, "").toUpperCase()
  const detail = bankAccountDetailsStore.find((item) => item.iban === cleaned)
  return detail ? toRecord(detail) : undefined
}

interface UpsertBankAccountInput {
  iban: string
  bankName: string
  branchName: string
  currency: Currency
  accountHolder: string
  label: string
  accountType: AccountType
  isOpenToAllBranches: boolean
  allowedBranchIds: string[]
  integrationStatus: IntegrationStatus
  status?: BankAccountStatus
}

export function insertBankAccount(input: UpsertBankAccountInput): BankAccountDetail {
  const now = new Date().toISOString()
  const nextId = `ba-${Date.now()}`
  const detail = makeDetail({
    id: nextId,
    iban: input.iban.replace(/\s/g, "").toUpperCase(),
    branchName: input.branchName,
    currency: input.currency,
    balance: 0,
    accountHolder: input.accountHolder,
    label: input.label,
    accountType: input.accountType,
    isOpenToAllBranches: input.isOpenToAllBranches,
    allowedBranchIds: input.allowedBranchIds,
    integrationStatus: input.integrationStatus,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdByName: "Mevcut Kullanıcı",
    transactions: [],
    auditLogs: [
      makeAudit(`audit-${Date.now()}`, nextId, "create", "Mevcut Kullanıcı", undefined, "Banka hesabı oluşturuldu", now),
    ],
  })

  bankAccountDetailsStore.unshift(detail)
  return cloneDetail(detail)
}

export function updateStoredBankAccount(id: string, input: UpsertBankAccountInput): BankAccountDetail | undefined {
  const detail = bankAccountDetailsStore.find((item) => item.id === id)
  if (!detail) {
    return undefined
  }

  const previousIntegration = detail.integrationStatus
  const previousScope = detail.isOpenToAllBranches ? "Tüm şubeler" : detail.allowedBranchNames.join(", ")
  const nextScope = input.isOpenToAllBranches ? "Tüm şubeler" : getBranchNames(input.allowedBranchIds).join(", ")
  detail.iban = input.iban.replace(/\s/g, "").toUpperCase()
  detail.bankCode = detail.iban.slice(4, 9)
  detail.bankName = input.bankName
  detail.branchName = input.branchName
  detail.currency = input.currency
  detail.accountHolder = input.accountHolder
  detail.label = input.label
  detail.accountType = input.accountType
  detail.isOpenToAllBranches = input.isOpenToAllBranches
  detail.allowedBranchIds = [...input.allowedBranchIds]
  detail.allowedBranchNames = getBranchNames(input.allowedBranchIds)
  detail.integrationStatus = input.integrationStatus
  detail.updatedAt = new Date().toISOString()

  if (input.status && input.status !== detail.status) {
    const previousStatus = detail.status
    detail.status = input.status
    detail.auditLogs.unshift(
      makeAudit(
        `audit-${Date.now() + 3}`,
        detail.id,
        "status_change",
        "Mevcut Kullanıcı",
        previousStatus === "active" ? "Kullanımda" : "Kapalı",
        input.status === "active" ? "Kullanımda" : "Kapalı",
        detail.updatedAt,
      ),
    )
  }

  detail.auditLogs.unshift(
    makeAudit(`audit-${Date.now()}`, detail.id, "edit", "Mevcut Kullanıcı", "Banka hesabı alanları", "Banka hesabı bilgileri güncellendi", detail.updatedAt),
  )

  if (previousIntegration !== input.integrationStatus) {
    detail.auditLogs.unshift(
      makeAudit(
        `audit-${Date.now() + 1}`,
        detail.id,
        "integration_toggle",
        "Mevcut Kullanıcı",
        previousIntegration === "active" ? "Aktif" : "Pasif",
        input.integrationStatus === "active" ? "Aktif" : "Pasif",
        detail.updatedAt,
      ),
    )
  }

  if (previousScope !== nextScope) {
    detail.auditLogs.unshift(
      makeAudit(`audit-${Date.now() + 2}`, detail.id, "branch_scope_update", "Mevcut Kullanıcı", previousScope, nextScope || "Genel Merkez", detail.updatedAt),
    )
  }

  return cloneDetail(detail)
}

export function setStoredBankAccountStatus(id: string, status: BankAccountStatus): BankAccountDetail | undefined {
  const detail = bankAccountDetailsStore.find((item) => item.id === id)
  if (!detail) {
    return undefined
  }

  const previousStatus = detail.status
  detail.status = status
  detail.updatedAt = new Date().toISOString()
  detail.auditLogs.unshift(
    makeAudit(
      `audit-${Date.now()}`,
      detail.id,
      "status_change",
      "Mevcut Kullanıcı",
      previousStatus === "active" ? "Kullanımda" : "Kapalı",
      status === "active" ? "Kullanımda" : "Kapalı",
      detail.updatedAt,
    ),
  )

  return cloneDetail(detail)
}
