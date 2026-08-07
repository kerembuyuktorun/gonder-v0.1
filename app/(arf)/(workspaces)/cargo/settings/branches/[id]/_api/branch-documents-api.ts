import { getBranchDetailById } from "../_mock/branch-detail-mock-data"
import type { BranchDocument, BranchDocumentType } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchDocuments(branchId: string): Promise<BranchDocument[]> {
  return getBranchDetailById(branchId)?.documents ?? []
}

// TODO: Remove mock when API is ready
export async function uploadBranchDocument(
  branchId: string,
  payload: { fileName: string; fileSize: number; type?: BranchDocumentType },
): Promise<BranchDocument> {
  return {
    id: `${branchId}-doc-${Date.now()}`,
    type: payload.type ?? "diger",
    fileName: payload.fileName,
    fileSize: payload.fileSize,
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Mevcut Kullanıcı",
    url: "/mock/uploaded-document.pdf",
  }
}

// TODO: Remove mock when API is ready
export async function deleteBranchDocument(_branchId: string, _documentId: string): Promise<void> {
  return
}
