import { fetchIncomingEInvoices, fetchIncomingEInvoicesSummary } from "./_api/incoming-e-invoices-api"
import { IncomingEInvoicesPageContent } from "./_components/incoming-e-invoices-page-content"

export default async function IncomingEInvoicesPage() {
  const [rows, summary] = await Promise.all([
    fetchIncomingEInvoices(),
    fetchIncomingEInvoicesSummary(),
  ])

  return <IncomingEInvoicesPageContent rows={rows} summary={summary} />
}
