import type { CustomerAddress, OperationScopeRow } from '../[id]/_types/customer-detail'
import {
  mapBackendAddress,
  toAddressPayload,
  toScopePayload,
} from '../_lib/map-customer'
import { lastmileClientRequest } from './client'

export async function fetchCustomerAddresses(customerId: string) {
  const params = new URLSearchParams({
    customerId,
    page: '1',
    pageSize: '100',
  })

  const result = await lastmileClientRequest<{ items: unknown[] }>(
    `/api/lastmile/customer-addresses?${params.toString()}`,
    { method: 'GET' }
  )
  if (!result.success) return result

  const items = (result.data.items ?? [])
    .map((item) => mapBackendAddress(item))
    .filter((item): item is CustomerAddress => Boolean(item))

  return { success: true as const, data: { items } }
}

export async function createCustomerAddress(customerId: string, address: Omit<CustomerAddress, 'id'>) {
  const result = await lastmileClientRequest<unknown>('/api/lastmile/customer-addresses', {
    method: 'POST',
    body: JSON.stringify(toAddressPayload(address, customerId)),
  })
  if (!result.success) return result

  const mapped = mapBackendAddress(result.data)
  if (!mapped) {
    return { success: false as const, error: 'Adres oluşturuldu ancak yanıt okunamadı.' }
  }
  return { success: true as const, data: mapped }
}

export async function updateCustomerAddress(customerId: string, address: CustomerAddress) {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/customer-addresses/${encodeURIComponent(address.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(toAddressPayload(address, customerId)),
    }
  )
  if (!result.success) return result

  const mapped = mapBackendAddress(result.data)
  if (!mapped) {
    return { success: false as const, error: 'Adres güncellendi ancak yanıt okunamadı.' }
  }
  return { success: true as const, data: mapped }
}

export async function deleteCustomerAddress(addressId: string) {
  return lastmileClientRequest<unknown>(
    `/api/lastmile/customer-addresses/${encodeURIComponent(addressId)}`,
    { method: 'DELETE' }
  )
}

export async function patchCustomerAddressActive(
  customerId: string,
  address: CustomerAddress,
  isActive: boolean
) {
  return updateCustomerAddress(customerId, { ...address, aktif: isActive })
}

export async function updateOperationScopes(
  addressId: string,
  outbound: OperationScopeRow[],
  inbound: OperationScopeRow[]
) {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/customer-addresses/${encodeURIComponent(addressId)}/operation-scopes`,
    {
      method: 'PUT',
      body: JSON.stringify({
        outboundScopes: toScopePayload(outbound),
        inboundScopes: toScopePayload(inbound),
      }),
    }
  )
  if (!result.success) return result

  const mapped = mapBackendAddress(result.data)
  return { success: true as const, data: mapped }
}
