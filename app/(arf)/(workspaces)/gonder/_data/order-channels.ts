import type { OrderChannelConnection, OrderChannelType } from '../_types/orders'

export const ORDER_CHANNEL_CONNECTIONS: OrderChannelConnection[] = [
  {
    id: 'ch-shopify-main',
    type: 'shopify',
    name: 'Shopify',
    storeName: 'ARF Mağaza',
    isActive: true,
  },
  {
    id: 'ch-trendyol-1',
    type: 'trendyol',
    name: 'Trendyol',
    storeName: 'ARF Official',
    isActive: true,
  },
  {
    id: 'ch-hepsiburada-1',
    type: 'hepsiburada',
    name: 'Hepsiburada',
    storeName: 'ARF HB',
    isActive: true,
  },
  {
    id: 'ch-woocommerce-1',
    type: 'woocommerce',
    name: 'WooCommerce',
    storeName: 'arfshop.com',
    isActive: false,
  },
  {
    id: 'ch-amazon-1',
    type: 'amazon',
    name: 'Amazon',
    storeName: 'ARF Amazon TR',
    isActive: true,
  },
  {
    id: 'ch-excel',
    type: 'excel',
    name: 'Excel İçe Aktarım',
    isActive: true,
  },
  {
    id: 'ch-api',
    type: 'api',
    name: 'Özel API',
    storeName: 'ERP Sync',
    isActive: true,
  },
  {
    id: 'ch-manual',
    type: 'manual',
    name: 'Manuel',
    isActive: true,
  },
]

export function listOrderChannels(options?: { activeOnly?: boolean }): OrderChannelConnection[] {
  const items = ORDER_CHANNEL_CONNECTIONS
  if (options?.activeOnly) return items.filter((item) => item.isActive)
  return items
}

export function getOrderChannelById(id: string): OrderChannelConnection | null {
  return ORDER_CHANNEL_CONNECTIONS.find((item) => item.id === id) ?? null
}

export function getChannelsByType(type: OrderChannelType): OrderChannelConnection[] {
  return ORDER_CHANNEL_CONNECTIONS.filter((item) => item.type === type)
}

export function defaultChannelIdForType(type: OrderChannelType): string {
  return (
    ORDER_CHANNEL_CONNECTIONS.find((item) => item.type === type && item.isActive)?.id ??
    ORDER_CHANNEL_CONNECTIONS.find((item) => item.type === type)?.id ??
    'ch-manual'
  )
}
