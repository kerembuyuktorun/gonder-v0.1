import { notFound } from "next/navigation"
import { fetchInvoiceById, fetchInvoicePayments } from "../_api/invoices-api"
import { InvoiceDetailContent } from "./_components/invoice-detail-content"

interface Props {
  params: Promise<{ invoiceId: string }>
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params

  const [invoice, payments] = await Promise.all([
    fetchInvoiceById(invoiceId),
    fetchInvoicePayments(invoiceId),
  ])

  if (!invoice) {
    notFound()
  }

  return <InvoiceDetailContent initialInvoice={invoice} initialPayments={payments} />
}