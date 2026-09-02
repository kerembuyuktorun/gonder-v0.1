'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SALES_CHANNELS_CATALOG } from '../_data/sales-channels-catalog'
import { emptyConnection, normalizeConnection } from '../_lib/sales-channel-connection'
import type {
  SalesChannelConnection,
  SalesChannelId,
  SalesChannelStatus,
} from '../_types/sales-channels'

type ConnectionsMap = Record<SalesChannelId, SalesChannelConnection>

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

function buildDefaultConnections(): ConnectionsMap {
  const next = {} as ConnectionsMap
  for (const channel of SALES_CHANNELS_CATALOG) {
    next[channel.id] = emptyConnection()
  }

  next.amazon = {
    status: 'connected',
    credentials: {
      sellerId: 'A1ARFDEMOXYZ',
      marketplaceId: 'A33AVAJ2PDY3EV',
      accessKey: 'AKIADEMOARFKEY',
      secretKey: 'amazon-demo-secret',
      roleArn: '',
    },
    connectedAt: hoursAgoIso(21 * 24),
    lastSyncAt: hoursAgoIso(2),
    lastTestAt: hoursAgoIso(2),
    lastError: null,
  }

  next.woocommerce = {
    status: 'error',
    credentials: {
      siteUrl: 'https://arfshop.com',
      consumerKey: 'ck_demo_arf',
      consumerSecret: 'cs_fail_demo',
    },
    connectedAt: null,
    lastSyncAt: null,
    lastTestAt: hoursAgoIso(26),
    lastError: 'WooCommerce kimlik bilgileri doğrulanamadı.',
  }

  return next
}

function mergeConnections(persisted?: Partial<ConnectionsMap>): ConnectionsMap {
  const next = buildDefaultConnections()
  if (!persisted) return next
  for (const channel of SALES_CHANNELS_CATALOG) {
    const saved = persisted[channel.id]
    if (saved) next[channel.id] = normalizeConnection(saved)
  }
  return next
}

type SalesChannelIntegrationsStore = {
  connections: ConnectionsMap
  getConnection: (channelId: SalesChannelId) => SalesChannelConnection
  saveCredentials: (channelId: SalesChannelId, credentials: Record<string, string>) => void
  setStatus: (
    channelId: SalesChannelId,
    status: SalesChannelStatus,
    patch?: Partial<SalesChannelConnection>
  ) => void
  connect: (channelId: SalesChannelId, credentials: Record<string, string>) => void
  markError: (
    channelId: SalesChannelId,
    credentials: Record<string, string>,
    message: string
  ) => void
  markTested: (channelId: SalesChannelId, credentials: Record<string, string>) => void
  disconnect: (channelId: SalesChannelId) => void
}

export const useSalesChannelIntegrationsStore = create<SalesChannelIntegrationsStore>()(
  persist(
    (set, get) => ({
      connections: buildDefaultConnections(),
      getConnection: (channelId) => get().connections[channelId] ?? emptyConnection(),
      saveCredentials: (channelId, credentials) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [channelId]: {
              ...normalizeConnection(state.connections[channelId]),
              credentials: { ...credentials },
            },
          },
        })),
      setStatus: (channelId, status, patch) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [channelId]: {
              ...normalizeConnection(state.connections[channelId]),
              ...patch,
              status,
            },
          },
        })),
      connect: (channelId, credentials) => {
        const now = new Date().toISOString()
        set((state) => ({
          connections: {
            ...state.connections,
            [channelId]: {
              status: 'connected',
              credentials: { ...credentials },
              connectedAt: now,
              lastSyncAt: now,
              lastTestAt: now,
              lastError: null,
            },
          },
        }))
      },
      markError: (channelId, credentials, message) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [channelId]: {
              ...normalizeConnection(state.connections[channelId]),
              status: 'error',
              credentials: { ...credentials },
              lastTestAt: new Date().toISOString(),
              lastError: message,
            },
          },
        })),
      markTested: (channelId, credentials) =>
        set((state) => {
          const current = normalizeConnection(state.connections[channelId])
          return {
            connections: {
              ...state.connections,
              [channelId]: {
                ...current,
                credentials: { ...credentials },
                lastTestAt: new Date().toISOString(),
                lastError: null,
                status: current.status === 'error' ? 'disconnected' : current.status,
              },
            },
          }
        }),
      disconnect: (channelId) =>
        set((state) => {
          const current = normalizeConnection(state.connections[channelId])
          return {
            connections: {
              ...state.connections,
              [channelId]: {
                ...current,
                status: 'disconnected',
                connectedAt: null,
                lastSyncAt: null,
                lastError: null,
              },
            },
          }
        }),
    }),
    {
      name: 'gonder-sales-channel-integrations-v1',
      partialize: (state) => ({ connections: state.connections }),
      merge: (persisted, current) => {
        const persistedState = persisted as { connections?: Partial<ConnectionsMap> } | undefined
        return {
          ...current,
          connections: mergeConnections(persistedState?.connections),
        }
      },
    }
  )
)
