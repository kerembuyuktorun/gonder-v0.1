export type BranchDocumentType =
  | "vergi_levhasi"
  | "sozlesme"
  | "imza_sirkuleri"
  | "diger"

export interface BranchDocument {
  id: string
  type: BranchDocumentType
  fileName: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  url: string
}
