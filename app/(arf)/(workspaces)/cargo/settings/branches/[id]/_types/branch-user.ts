export type BranchUserRole = "yonetici" | "operator" | "kurye" | "muhasebe"

export interface BranchUser {
  id: string
  firstName: string
  lastName: string
  role: BranchUserRole
  phone: string
  email: string
  status: "active" | "passive"
  createdAt: string
  lastActivity?: string
}
