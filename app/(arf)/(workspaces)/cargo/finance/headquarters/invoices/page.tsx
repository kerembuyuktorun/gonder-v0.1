import { fetchInvoices, fetchInvoiceSummary } from "./_api/invoices-api"
import { InvoicesPageContent } from "./_components/invoices-page-content"

export default async function InvoicesPage() {
  const [invoices, summary] = await Promise.all([fetchInvoices(), fetchInvoiceSummary()])

  return <InvoicesPageContent invoices={invoices} summary={summary} />
}
