import type {
  AddPaymentPayload,
  CreateInvoiceRecordPayload,
  InvoicePayment,
  InvoiceRecord,
  InvoiceSummary,
  UpdateInvoiceStatusPayload,
} from "../_types/invoice"
import {
  createInvoice,
  getInvoiceById,
  getInvoicesList,
  getPaymentsByInvoiceId,
  getInvoiceSummary,
  insertPayment,
  updateInvoiceStatus,
} from "../_mock/invoices-mock-data"

// TODO: Remove mock when API is ready
export async function fetchInvoices(): Promise<InvoiceRecord[]> {
  return getInvoicesList()
}

// TODO: Remove mock when API is ready
export async function fetchInvoiceSummary(): Promise<InvoiceSummary> {
  return getInvoiceSummary()
}

// TODO: Remove mock when API is ready
export async function fetchInvoiceById(id: string): Promise<InvoiceRecord | undefined> {
  return getInvoiceById(id)
}

// TODO: Remove mock when API is ready
export async function fetchInvoicePayments(invoiceId: string): Promise<InvoicePayment[]> {
  return getPaymentsByInvoiceId(invoiceId)
}

// TODO: Remove mock when API is ready
export async function createInvoiceRecord(payload: CreateInvoiceRecordPayload): Promise<InvoiceRecord> {
  return createInvoice(payload)
}

// TODO: Remove mock when API is ready
export async function patchInvoiceStatus(
  invoiceId: string,
  payload: UpdateInvoiceStatusPayload,
): Promise<InvoiceRecord | undefined> {
  return updateInvoiceStatus(invoiceId, payload)
}

// TODO: Remove mock when API is ready
export async function addInvoicePayment(
  invoiceId: string,
  payload: AddPaymentPayload,
): Promise<{ payment: InvoicePayment; invoice: InvoiceRecord } | undefined> {
  return insertPayment(invoiceId, payload)
}
