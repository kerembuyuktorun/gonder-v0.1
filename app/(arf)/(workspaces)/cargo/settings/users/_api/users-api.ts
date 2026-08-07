import type { LocationOption, UserAssetDraft, UserDocument, UserRecord, UserRole } from "../_types"
import {
  deleteStoredUser,
  findUserByEmail,
  getUsersByRoleId,
  getUsersList,
  insertUser,
  setStoredUserStatus,
  updateStoredUser,
} from "../_mock/users-mock-data"
import { mockLocations } from "../_mock/user-roles-mock-data"

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole
  locationId: string | null
}

// TODO: Remove mock when API is ready
export async function fetchUsers(): Promise<UserRecord[]> {
  return getUsersList()
}

// TODO: Remove mock when API is ready
export async function fetchUsersByRoleId(roleId: string): Promise<UserRecord[]> {
  return getUsersByRoleId(roleId)
}

// TODO: Remove mock when API is ready
export async function createUser(payload: CreateUserPayload): Promise<UserRecord> {
  const location = payload.locationId
    ? mockLocations.find((loc) => loc.id === payload.locationId)
    : null
  return insertUser({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    locationId: payload.locationId,
    locationName: location?.name ?? null,
    locationType: location?.type ?? null,
  })
}

// TODO: Remove mock when API is ready
export async function suspendUser(id: string): Promise<UserRecord | undefined> {
  return setStoredUserStatus(id, "suspended")
}

// TODO: Remove mock when API is ready
export async function reactivateUser(id: string): Promise<UserRecord | undefined> {
  return setStoredUserStatus(id, "active")
}

// TODO: Remove mock when API is ready
export async function deactivateUser(id: string): Promise<UserRecord | undefined> {
  return setStoredUserStatus(id, "passive")
}

export interface UpdateUserPayload {
  firstName: string
  lastName: string
  identityNumber?: string
  email: string
  phoneNumber: string
  role: UserRole
  locationId: string | null
  profilePhotoUrl?: string
  documents?: UserDocument[]
  asset?: UserAssetDraft
}

// TODO: Remove mock when API is ready
export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserRecord | undefined> {
  const location = payload.locationId
    ? mockLocations.find((loc) => loc.id === payload.locationId)
    : null
  return updateStoredUser(id, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    identityNumber: payload.identityNumber,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    locationId: payload.locationId,
    locationName: location?.name ?? null,
    locationType: location?.type ?? null,
    profilePhotoUrl: payload.profilePhotoUrl,
    documents: payload.documents,
    asset: payload.asset,
  })
}

// TODO: Remove mock when API is ready
export async function deleteUser(id: string): Promise<boolean> {
  return deleteStoredUser(id)
}

// TODO: Remove mock when API is ready
export async function findExistingUserByEmail(email: string): Promise<UserRecord | undefined> {
  return findUserByEmail(email)
}

// TODO: Remove mock when API is ready
export async function fetchLocations(): Promise<LocationOption[]> {
  return mockLocations
}
