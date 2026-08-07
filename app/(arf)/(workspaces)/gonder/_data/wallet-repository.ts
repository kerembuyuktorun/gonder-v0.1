import { moneyTry } from '../_types/finance'
import {
  EMPTY_WALLET_TOP_UP_DRAFT,
  type WalletAccount,
  type WalletLedgerEntry,
  type WalletTopUpDraft,
} from '../_types/wallet'

export type WalletLedgerQuery = {
  search?: string
  type?: WalletLedgerEntry['type'] | null
}

export type WalletLedgerResult = {
  items: WalletLedgerEntry[]
  total: number
}

export type WalletTopUpResult = {
  account: WalletAccount
  entry: WalletLedgerEntry
}

export interface WalletRepository {
  getAccount(): Promise<WalletAccount>
  getBalanceTry(): Promise<number>
  listLedger(query?: WalletLedgerQuery): Promise<WalletLedgerResult>
  getLedgerEntryById(id: string): Promise<WalletLedgerEntry | null>
  /** Mock top-up — gerçek PSP yok; Dilim 1’de seed mutasyonu için hazır */
  topUp(draft: WalletTopUpDraft): Promise<WalletTopUpResult>
}

const seedAccount: WalletAccount = {
  id: 'wal-001',
  displayName: 'Gönder işletme cüzdanı',
  status: 'active',
  balance: moneyTry(1250.5),
  currency: 'TRY',
  updatedAt: '2026-08-07T08:00:00.000Z',
}

const seedLedger: WalletLedgerEntry[] = [
  {
    id: 'wle-3001',
    occurredAt: '2026-08-06T14:20:00.000Z',
    type: 'payment',
    description: 'Gönderi ödemesi · GND-4401',
    amount: moneyTry(189),
    signedAmount: -189,
    balanceAfter: moneyTry(1250.5),
    method: 'wallet',
    relatedPaymentId: 'ftx-1001',
  },
  {
    id: 'wle-3002',
    occurredAt: '2026-08-05T18:00:00.000Z',
    type: 'top_up',
    description: 'Kart ile yükleme',
    amount: moneyTry(500),
    signedAmount: 500,
    balanceAfter: moneyTry(1439.5),
    method: 'card',
    relatedPaymentId: null,
  },
  {
    id: 'wle-3003',
    occurredAt: '2026-08-04T16:45:00.000Z',
    type: 'refund',
    description: 'İade · GND-4388',
    amount: moneyTry(75),
    signedAmount: 75,
    balanceAfter: moneyTry(939.5),
    method: 'wallet',
    relatedPaymentId: 'ftx-1003',
  },
  {
    id: 'wle-3004',
    occurredAt: '2026-08-01T10:15:00.000Z',
    type: 'top_up',
    description: 'Havale ile yükleme',
    amount: moneyTry(1000),
    signedAmount: 1000,
    balanceAfter: moneyTry(864.5),
    method: 'transfer',
    relatedPaymentId: null,
  },
]

function matchesSearch(haystack: string, search?: string): boolean {
  if (!search?.trim()) return true
  const needle = search.trim().toLocaleLowerCase('tr-TR')
  return haystack.toLocaleLowerCase('tr-TR').includes(needle)
}

export class MockWalletRepository implements WalletRepository {
  private account: WalletAccount = { ...seedAccount, balance: { ...seedAccount.balance } }
  private ledger: WalletLedgerEntry[] = seedLedger.map((item) => ({
    ...item,
    amount: { ...item.amount },
    balanceAfter: { ...item.balanceAfter },
  }))

  async getAccount(): Promise<WalletAccount> {
    await delay(50)
    return {
      ...this.account,
      balance: { ...this.account.balance },
    }
  }

  async getBalanceTry(): Promise<number> {
    await delay(30)
    return this.account.balance.amount
  }

  async listLedger(query: WalletLedgerQuery = {}): Promise<WalletLedgerResult> {
    await delay(60)
    const items = this.ledger.filter((item) => {
      if (query.type && item.type !== query.type) return false
      return matchesSearch(`${item.description} ${item.id}`, query.search)
    })
    return { items, total: items.length }
  }

  async getLedgerEntryById(id: string): Promise<WalletLedgerEntry | null> {
    await delay(40)
    const item = this.ledger.find((entry) => entry.id === id)
    return item ? { ...item, amount: { ...item.amount }, balanceAfter: { ...item.balanceAfter } } : null
  }

  async topUp(draft: WalletTopUpDraft): Promise<WalletTopUpResult> {
    await delay(80)
    const amountTry = draft.amountTry
    if (amountTry == null || amountTry <= 0) {
      throw new Error('Geçerli bir tutar girin')
    }
    if (!draft.method) {
      throw new Error('Yükleme yöntemi seçin')
    }

    const nextBalance = this.account.balance.amount + amountTry
    const now = new Date().toISOString()
    const entry: WalletLedgerEntry = {
      id: `wle-${Date.now()}`,
      occurredAt: now,
      type: 'top_up',
      description:
        draft.note.trim() ||
        (draft.method === 'card' ? 'Kart ile yükleme' : 'Havale ile yükleme'),
      amount: moneyTry(amountTry),
      signedAmount: amountTry,
      balanceAfter: moneyTry(nextBalance),
      method: draft.method,
      relatedPaymentId: null,
    }

    this.account = {
      ...this.account,
      balance: moneyTry(nextBalance),
      updatedAt: now,
    }
    this.ledger = [entry, ...this.ledger]

    return {
      account: {
        ...this.account,
        balance: { ...this.account.balance },
      },
      entry: {
        ...entry,
        amount: { ...entry.amount },
        balanceAfter: { ...entry.balanceAfter },
      },
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const walletRepository: WalletRepository = new MockWalletRepository()

export { EMPTY_WALLET_TOP_UP_DRAFT }
