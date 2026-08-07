import { fetchInvoiceCreateInit } from "./_api/invoice-create-api"
import { FaturaOlusturPageContent } from "./_components/invoice-create-page-content"

export default async function InvoiceCreatePage() {
  const initialData = await fetchInvoiceCreateInit()

  return <FaturaOlusturPageContent initialData={initialData} />
}
