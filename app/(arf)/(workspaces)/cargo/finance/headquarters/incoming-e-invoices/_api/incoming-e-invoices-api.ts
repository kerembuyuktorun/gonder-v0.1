import {
  addIncomingEInvoiceNote,
  getIncomingEInvoiceById,
  getIncomingEInvoices,
  getIncomingEInvoicesSummary,
  getIncomingEInvoiceSupplierOptions,
  updateIncomingEInvoiceStatus,
} from "../_mock/incoming-e-invoices-mock-data"
import type {
  IncomingEInvoiceDetail,
  IncomingEInvoiceRecord,
  IncomingEInvoiceStatus,
  IncomingEInvoiceSummary,
} from "../_types/incoming-e-invoice"

// TODO: Remove when API is ready
export async function fetchIncomingEInvoices(): Promise<IncomingEInvoiceRecord[]> {
  return getIncomingEInvoices()
}

// TODO: Remove when API is ready
export async function fetchIncomingEInvoicesSummary(): Promise<IncomingEInvoiceSummary> {
  return getIncomingEInvoicesSummary()
}

// TODO: Remove mock when API is ready
export async function fetchIncomingEInvoiceById(id: string): Promise<IncomingEInvoiceDetail | undefined> {
  return getIncomingEInvoiceById(id)
}

// TODO: Remove mock when API is ready
export async function patchIncomingEInvoiceStatus(
  id: string,
  status: IncomingEInvoiceStatus,
): Promise<IncomingEInvoiceDetail | undefined> {
  return updateIncomingEInvoiceStatus(id, status)
}

// TODO: Remove mock when API is ready
export async function postIncomingEInvoiceNote(id: string, note: string): Promise<IncomingEInvoiceDetail | undefined> {
  return addIncomingEInvoiceNote(id, note)
}

// TODO: Remove mock when API is ready
export async function fetchIncomingEInvoiceSupplierOptions(): Promise<string[]> {
  return getIncomingEInvoiceSupplierOptions()
}
