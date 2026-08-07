import { notFound } from "next/navigation"
import {
  fetchIncomingEInvoiceById,
  fetchIncomingEInvoiceSupplierOptions,
} from "../_api/incoming-e-invoices-api"
import { IncomingEInvoiceDetailContent } from "./_components/incoming-e-invoice-detail-content"

interface Props {
  params: Promise<{ invoiceId: string }>
}

export default async function IncomingEInvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params
  const [invoice, supplierOptions] = await Promise.all([
    fetchIncomingEInvoiceById(invoiceId),
    fetchIncomingEInvoiceSupplierOptions(),
  ])

  if (!invoice) {
    notFound()
  }

  return <IncomingEInvoiceDetailContent initialInvoice={invoice} supplierOptions={supplierOptions} />
}
