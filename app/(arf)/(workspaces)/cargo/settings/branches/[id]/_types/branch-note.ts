export type NoteCategory = "genel" | "operasyon" | "finans" | "teknik" | "diger"
export type NoteVisibility = "internal" | "public"

export interface BranchNote {
  id: string
  content: string
  category: NoteCategory
  visibility: NoteVisibility
  createdBy: string
  createdByName: string
  createdByRole: string
  createdAt: string
  sourceType: "sube" | "genel_merkez"
  sourceName: string
  branchId: string
  branchName: string
}
