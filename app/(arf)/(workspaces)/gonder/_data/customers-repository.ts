import type { AddressDraft } from '../_types/price-calculation'
import {
  SAVED_CUSTOMERS,
  type SavedCustomer,
  type SavedCustomerAddress,
} from './saved-customers'

export type { SavedCustomer, SavedCustomerAddress }

export type CustomerType = 'corporate' | 'individual'

export type CustomerDraftInput = {
  customerType: CustomerType
  name: string
  phone?: string
  email?: string
  taxNumber?: string
  contactName?: string
}

export type AddressDraftInput = {
  title: string
  line1: string
  city: string
  district?: string
  neighborhood?: string
  contactName?: string
  phone?: string
}

export interface CustomersRepository {
  list(): Promise<SavedCustomer[]>
  getById(id: string): Promise<SavedCustomer | null>
  createCustomer(input: CustomerDraftInput): Promise<SavedCustomer>
  updateCustomer(id: string, input: CustomerDraftInput): Promise<SavedCustomer>
  createAddress(customerId: string, input: AddressDraftInput): Promise<SavedCustomerAddress>
  updateAddress(
    customerId: string,
    addressId: string,
    input: AddressDraftInput
  ): Promise<SavedCustomerAddress>
}

function cloneSeed(): SavedCustomer[] {
  return SAVED_CUSTOMERS.map((customer) => ({
    ...customer,
    addresses: customer.addresses.map((address) => ({ ...address })),
  }))
}

function buildLabel(input: AddressDraftInput): string {
  const parts = [
    input.line1.trim(),
    input.neighborhood?.trim(),
    input.district?.trim(),
    input.city.trim(),
  ].filter(Boolean)
  return parts.join(', ')
}

function toSavedAddress(id: string, input: AddressDraftInput): SavedCustomerAddress {
  return {
    id,
    title: input.title.trim() || 'Adres',
    label: buildLabel(input),
    line1: input.line1.trim(),
    district: input.district?.trim() || undefined,
    city: input.city.trim(),
  }
}

export class MockCustomersRepository implements CustomersRepository {
  private items = cloneSeed()

  async list(): Promise<SavedCustomer[]> {
    await delay(40)
    return this.items.map((item) => ({
      ...item,
      addresses: item.addresses.map((address) => ({ ...address })),
    }))
  }

  async getById(id: string): Promise<SavedCustomer | null> {
    await delay(30)
    const found = this.items.find((item) => item.id === id)
    return found
      ? { ...found, addresses: found.addresses.map((address) => ({ ...address })) }
      : null
  }

  async createCustomer(input: CustomerDraftInput): Promise<SavedCustomer> {
    await delay(60)
    const name = input.name.trim()
    if (!name) throw new Error('Müşteri adı zorunlu')
    const created: SavedCustomer = {
      id: `cust-${Date.now()}`,
      name,
      phone: input.phone?.trim() || undefined,
      addresses: [],
    }
    this.items = [created, ...this.items]
    return { ...created, addresses: [] }
  }

  async updateCustomer(id: string, input: CustomerDraftInput): Promise<SavedCustomer> {
    await delay(60)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Müşteri bulunamadı')
    const name = input.name.trim()
    if (!name) throw new Error('Müşteri adı zorunlu')
    const next: SavedCustomer = {
      ...this.items[index]!,
      name,
      phone: input.phone?.trim() || undefined,
    }
    this.items[index] = next
    return { ...next, addresses: next.addresses.map((address) => ({ ...address })) }
  }

  async createAddress(
    customerId: string,
    input: AddressDraftInput
  ): Promise<SavedCustomerAddress> {
    await delay(60)
    const index = this.items.findIndex((item) => item.id === customerId)
    if (index < 0) throw new Error('Müşteri bulunamadı')
    if (!input.city.trim() || !input.line1.trim()) {
      throw new Error('Şehir ve açık adres zorunlu')
    }
    const address = toSavedAddress(`addr-${Date.now()}`, input)
    const customer = this.items[index]!
    this.items[index] = {
      ...customer,
      addresses: [...customer.addresses, address],
    }
    return { ...address }
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    input: AddressDraftInput
  ): Promise<SavedCustomerAddress> {
    await delay(60)
    const customerIndex = this.items.findIndex((item) => item.id === customerId)
    if (customerIndex < 0) throw new Error('Müşteri bulunamadı')
    if (!input.city.trim() || !input.line1.trim()) {
      throw new Error('Şehir ve açık adres zorunlu')
    }
    const customer = this.items[customerIndex]!
    const addressIndex = customer.addresses.findIndex((item) => item.id === addressId)
    if (addressIndex < 0) throw new Error('Adres bulunamadı')
    const next = toSavedAddress(addressId, input)
    const addresses = [...customer.addresses]
    addresses[addressIndex] = next
    this.items[customerIndex] = { ...customer, addresses }
    return { ...next }
  }
}

export function toAddressDraft(address: SavedCustomerAddress): AddressDraft {
  return {
    label: address.label,
    line1: address.line1,
    district: address.district,
    city: address.city,
    lat: address.lat,
    lng: address.lng,
    placeId: address.placeId,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const customersRepository: CustomersRepository = new MockCustomersRepository()
