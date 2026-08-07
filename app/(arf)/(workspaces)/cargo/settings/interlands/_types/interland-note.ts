export type InterlandNoteCategory = "genel" | "operasyon" | "finans" | "teknik" | "diger"
export type InterlandNoteVisibility = "internal" | "public"

export interface InterlandNote {
  id: string
  content: string
  category: InterlandNoteCategory
  visibility: InterlandNoteVisibility
  createdAt: string
  createdBy: string
  createdByName: string
  createdByRole?: string
  sourceName?: string
}
