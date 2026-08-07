import { fetchBankAccounts } from "../../../bank-accounts/_api/bank-accounts-api"
import { createInvoiceRecord, fetchInvoices } from "../../_api/invoices-api"
import type { CreateInvoiceRecordPayload, InvoiceRecord } from "../../_types/invoice"
import { customerDetails } from "../../../../../marketing/customers/_data/customers"
import { getStoredOpenCargos } from "../../../../../marketing/customers/[customerId]/_mock/financial-mock-data"
import { getInvoiceCreateBaseInitData } from "../_mock/invoice-create-mock-data"
import type {
  CreateInvoiceDraftPayload,
  CustomerOption,
  FaturaOlusturFormState,
  InvoiceComputedTotals,
  InvoiceCreateInitData,
} from "../_types"

function buildCustomerOptions(invoices: InvoiceRecord[]): CustomerOption[] {
  const uniqueById = new Map<string, CustomerOption>()
  const billingAddressByCustomerId = new Map(
    customerDetails.map((customer) => {
      const defaultAddress = customer.addresses.find((address) => address.isDefault) ?? customer.addresses[0]
      return [customer.id, defaultAddress?.line1 ?? "-"]
    }),
  )

  for (const invoice of invoices) {
    if (!uniqueById.has(invoice.customerId)) {
      uniqueById.set(invoice.customerId, {
        id: invoice.customerId,
        name: invoice.customerName,
        taxOffice: invoice.taxOffice,
        taxNumber: invoice.taxNumber,
        billingAddress: billingAddressByCustomerId.get(invoice.customerId) ?? "-",
        customerType: invoice.customerType,
      })
    }
  }

  return Array.from(uniqueById.values()).sort((left, right) => left.name.localeCompare(right.name, "tr"))
}

function buildInvoiceNo(form: FaturaOlusturFormState): string {
  const seri = form.faturaNoSeri?.trim() ?? ""
  const sira = form.faturaNoSira?.trim() ?? ""

  if (!seri && !sira) {
    return ""
  }

  return sira ? `${seri}-${sira}` : seri
}

function buildCreatePayload(
  form: FaturaOlusturFormState,
  totals: InvoiceComputedTotals,
  customers: CustomerOption[],
): CreateInvoiceRecordPayload {
  const baseData = getInvoiceCreateBaseInitData()
  const selectedCustomer = customers.find((customer) => customer.id === form.musteriId)
  const customerId = selectedCustomer?.id ?? form.musteriId ?? "unknown-customer"
  const customerName = selectedCustomer?.name ?? "Tanımsız Müşteri"
  const issueDate = form.duzenlemeTarihi
  const dueDate = form.tahsilatDurumu === "tahsil_edilecek" ? form.vadeTarihi || issueDate : issueDate
  const invoiceName = form.faturaNotu?.trim() || `${customerName} Faturası`
  const categoryLabel =
    baseData.kategoriler.find((category) => category.id === form.kategoriId)?.label ?? "Kategorisiz"
  const tagLabels = baseData.etiketler
    .filter((tag) => form.etiketIds.includes(tag.id))
    .map((tag) => tag.label)

  const noteSegments = [form.faturaNotu?.trim() ?? ""].filter(Boolean)
  if (form.notaBakiyeEkle) {
    noteSegments.push("Müşteri bakiyesi nota eklendi")
  }

  const relatedCargoIds = form.satirlar
    .filter((line) => line.urunTipi === "cargo" && Boolean(line.urunId))
    .map((line) => line.urunId as string)

  return {
    invoiceName,
    invoiceNo: buildInvoiceNo(form),
    categoryLabel,
    tagLabels,
    customerId,
    customerName,
    customerType: selectedCustomer?.customerType ?? "corporate",
    taxOffice: selectedCustomer?.taxOffice ?? "",
    taxNumber: selectedCustomer?.taxNumber ?? "",
    operatingBranchId: "branch-1",
    operatingBranchName: "İstanbul Merkez",
    issueDate,
    dueDate,
    note: noteSegments.join(" | "),
    subTotal: totals.lineSubTotal,
    vatTotal: totals.lineVatTotal,
    grandTotal: totals.grandTotal,
    source: "manual",
    relatedCargoIds,
    createdBy: "Mevcut Kullanıcı",
  }
}

export async function fetchInvoiceCreateInit(): Promise<InvoiceCreateInitData> {
  const [invoices, bankAccounts] = await Promise.all([fetchInvoices(), fetchBankAccounts()])
  const customers = buildCustomerOptions(invoices)

  const baseData = getInvoiceCreateBaseInitData()

  return {
    ...baseData,
    customers,
    acikKargolar: customers.flatMap((customer) =>
      getStoredOpenCargos(customer.id)
        .filter((cargo) => cargo.invoiceStatus !== "kesildi")
        .map((cargo) => ({
          id: cargo.id,
          customerId: customer.id,
          trackingNo: cargo.trackingNo,
          route: cargo.route,
          amount: cargo.amount,
          baseAmount: cargo.baseAmount,
          pieceCount: cargo.pieceCount,
          pieceList: cargo.pieceList,
        })),
    ),
    tahsilatHesaplari: bankAccounts.map((account) => ({
      id: account.id,
      label: `${account.bankName} - ${account.label}`,
      iban: account.iban,
      currency: account.currency,
    })),
  }
}

export async function createInvoiceDraft(payload: CreateInvoiceDraftPayload): Promise<InvoiceRecord> {
  const invoices = await fetchInvoices()
  const customers = buildCustomerOptions(invoices)
  const invoicePayload = buildCreatePayload(payload.form, payload.totals, customers)
  return createInvoiceRecord(invoicePayload)
}

export async function submitInvoiceCreation(payload: CreateInvoiceDraftPayload): Promise<InvoiceRecord> {
  const invoices = await fetchInvoices()
  const customers = buildCustomerOptions(invoices)
  const invoicePayload = buildCreatePayload(payload.form, payload.totals, customers)
  return createInvoiceRecord(invoicePayload)
}
