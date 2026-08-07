// TODO: Remove mock imports when API is ready

import type { FinancialExstreRecord, FinancialKpi, OpenCargoRecord } from "../_types/financial"
import { fetchInvoicePayments, fetchInvoices as fetchSharedInvoices } from "../../../../finance/headquarters/invoices/_api/invoices-api"
import {
  getStoredInvoices,
  getStoredOpenCargos,
  mockFinancialKpi,
  mockInvoices,
  mockOpenCargos,
} from "../_mock/financial-mock-data"

export async function fetchFinancialKpi(customerId: string): Promise<FinancialKpi> {
  return (
    mockFinancialKpi[customerId] ?? {
      openCargoAmount: 0,
      pendingInvoiceDebt: 0,
      overdueDebt: 0,
      lastCollectionDate: "-",
      lastCollectionAmount: 0,
      totalTransportCount: 0,
    }
  )
}

export async function fetchOpenCargos(customerId: string): Promise<OpenCargoRecord[]> {
  if (typeof window !== "undefined") {
    return getStoredOpenCargos(customerId)
  }

  return mockOpenCargos[customerId] ?? []
}

export async function fetchInvoices(customerId: string): Promise<FinancialExstreRecord[]> {
  const sharedInvoices = (await fetchSharedInvoices()).filter((invoice) => invoice.customerId === customerId)

  if (sharedInvoices.length > 0) {
    const paymentRows = await Promise.all(
      sharedInvoices.map(async (invoice) => {
        const payments = await fetchInvoicePayments(invoice.id)
        return payments.map<FinancialExstreRecord>((payment) => ({
          id: payment.id,
          type: "gelen_odeme",
          invoiceId: invoice.id,
          invoiceNo: payment.referenceNo || invoice.invoiceNo,
          description: `${invoice.invoiceNo} tahsilatı`,
          amount: payment.amount,
          remainingBalance: invoice.remainingBalance,
          status: invoice.status,
          createdAt: payment.paymentDate,
          // Banka hareket bilgileri (varsa payment'tan alınır)
          senderName: invoice.customerName,
          recipientName: "ARF LOJİSTİK A.Ş.",
          direction: "credit",
          matchStatus: "auto_matched",
          matchSource: "customer_invoice",
          matchedEntityLabel: invoice.invoiceNo,
        }))
      }),
    )

    const invoiceRows: FinancialExstreRecord[] = sharedInvoices.map((invoice) => ({
      id: invoice.id,
      type: "fatura",
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      description: invoice.note || `${invoice.relatedCargoCount} kargo faturası`,
      amount: invoice.grandTotal,
      remainingBalance: invoice.remainingBalance,
      status: invoice.status,
      createdAt: invoice.issueDate,
      // Fatura özel alanlar
      invoiceName: invoice.invoiceName || "",
      customerName: invoice.customerName,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subTotal: invoice.subTotal,
      vatTotal: invoice.vatTotal,
      grandTotal: invoice.grandTotal,
      paidTotal: invoice.paidTotal,
      categoryLabel: invoice.categoryLabel || "",
      tagLabels: invoice.tagLabels || [],
      relatedCargoCount: invoice.relatedCargoCount,
    }))

    return [...invoiceRows, ...paymentRows.flat()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  if (typeof window !== "undefined") {
    return getStoredInvoices(customerId)
  }

  return mockInvoices[customerId] ?? []
}
