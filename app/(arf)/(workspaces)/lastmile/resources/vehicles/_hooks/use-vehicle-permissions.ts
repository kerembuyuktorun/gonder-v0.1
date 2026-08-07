'use client'

import { useEffect, useState } from 'react'
import { getSession } from '../../../../../(auth)/_api/auth-client'
import type { AuthApiResult, SessionData } from '../../../../../(auth)/_api/auth-types'

export const VEHICLE_PERMISSION_CODES = {
  list: 'VehicleList',
  create: 'VehicleCreate',
  update: 'VehicleUpdate',
  delete: 'VehicleDelete',
  activate: 'VehicleActivate',
  passive: 'VehiclePassive',
  driverList: 'DriverList',
} as const

export type VehiclePermissions = {
  canList: boolean
  canCreate: boolean
  canUpdate: boolean
  canActivate: boolean
  canPassive: boolean
  canChangeDriver: boolean
}

const ALL_GRANTED: VehiclePermissions = {
  canList: true,
  canCreate: true,
  canUpdate: true,
  canActivate: true,
  canPassive: true,
  canChangeDriver: true,
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function parsePermissionCodes(raw: unknown): Set<string> {
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))
}

function resolvePermissions(codes: Set<string>): VehiclePermissions {
  if (codes.size === 0) return ALL_GRANTED

  const canUpdate = codes.has(VEHICLE_PERMISSION_CODES.update)

  return {
    canList: codes.has(VEHICLE_PERMISSION_CODES.list),
    canCreate: codes.has(VEHICLE_PERMISSION_CODES.create),
    canUpdate,
    canActivate: canUpdate || codes.has(VEHICLE_PERMISSION_CODES.activate),
    canPassive: canUpdate || codes.has(VEHICLE_PERMISSION_CODES.passive),
    canChangeDriver: canUpdate,
  }
}

export function useVehiclePermissions(): VehiclePermissions {
  const [permissions, setPermissions] = useState<VehiclePermissions>(ALL_GRANTED)

  useEffect(() => {
    let cancelled = false

    getSession().then((session: AuthApiResult<SessionData>) => {
      if (cancelled || !session.success) return

      const data = asRecord(session.data)
      const user = asRecord(data.user)
      const codes = parsePermissionCodes(data.permissions ?? user.permissions)

      setPermissions(resolvePermissions(codes))
    })

    return () => {
      cancelled = true
    }
  }, [])

  return permissions
}
