import { notFound } from "next/navigation"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CustomerAddressesSection } from "./_components/customer-addresses-section"
import { CustomerContractsSection } from "./_components/customer-contracts-section"
import { CustomerFinancialSection } from "./_components/customer-financial-section"
import { CustomerHeaderActions } from "./_components/customer-header-actions"
import { CustomerInfoEditorCard } from "./_components/customer-info-editor-card"
import { CustomerShipmentsSection } from "./_components/customer-shipments-section"
import { CustomerTransportsSection } from "./_components/customer-transports-section"
import {
  fetchOpenCargos,
  fetchInvoices,
} from "./_api/financial-api"
import {
  Building2,
  Calculator,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  MapPin,
  Package,
  Truck,
} from "lucide-react"
import {
  getCustomerById,
} from "../_data/customers"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value)

const toDateOnlyLabel = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  if (value.includes(" ")) {
    return value.split(" ")[0]
  }

  if (value.includes("T")) {
    return value.split("T")[0]
  }

  return value
}

export default async function MusteriDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { customerId } = await params
  const { tab } = await searchParams
  const customer = getCustomerById(customerId)

  if (!customer) {
    notFound()
  }

  const displayName =
    customer.customerType === "corporate"
      ? customer.tradeName
      : `${customer.firstName} ${customer.lastName}`.trim()

  const totalShipmentCount = customer.shipments.length
  const totalShipmentAmount = customer.shipments.reduce(
    (acc, shipment) => acc + shipment.amount,
    0,
  )
  const deliveredCount = customer.shipments.filter(
    (shipment) => shipment.status === "teslim_edildi",
  ).length
  const activeContractCount = customer.contracts.filter(
    (contract) => contract.status === "active",
  ).length

  const activeContractEndDate = customer.contracts
    .filter((contract) => contract.status === "active")
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .at(0)?.endDate ?? null

  const currentBalance =
    customer.financialMovements[customer.financialMovements.length - 1]?.balance ?? 0
  const lastCollectionAt =
    [...customer.financialMovements]
      .reverse()
      .find((movement) => movement.type === "tahsilat")
      ?.date ?? "-"

  const hasContract = activeContractCount > 0
  const totalTransportCount = customer.transports.length
  const hasShipments = customer.shipments.length > 0
  const hasTransports = totalTransportCount > 0

  // Faturalar her zaman çekilir: kargo/taşıma olmasa bile dışarıdan fatura kesilebilir
  const invoices = await fetchInvoices(customerId)
  const hasInvoices = invoices.length > 0
  const showFinance = hasContract || hasTransports || hasInvoices

  let openCargos: Awaited<ReturnType<typeof fetchOpenCargos>> = []

  if (showFinance) {
    openCargos = await fetchOpenCargos(customerId)
  }

  const initialTab =
    tab === "addresses" ||
    tab === "contracts" ||
    (tab === "shipments" && hasShipments) ||
    (tab === "transports" && hasTransports) ||
    (tab === "finance" && showFinance)
      ? tab
      : "info"

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Satış & Pazarlama" },
          { label: "Müşteriler", href: "/arf/cargo/marketing/customers" },
          { label: displayName },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{displayName}</h1>
                  <Badge
                    className={cn(
                      "border",
                      customer.customerType === "corporate"
                        ? "border-secondary/30 bg-primary/12 text-secondary"
                        : "border-slate-300 bg-slate-100 text-slate-700",
                    )}
                  >
                    {customer.customerType === "corporate" ? "Kurumsal" : "Bireysel"}
                  </Badge>
                  {activeContractCount > 0 && (
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                      Sözleşmeli
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <InfoPill icon={CalendarClock} label={`Kayıt: ${toDateOnlyLabel(customer.createdAt)}`} />
                  <InfoPill icon={Package} label={`Son Kargo: ${customer.lastShipmentAt || "-"}`} />
                  <InfoPill icon={CalendarClock} label={`Son Tahsilat: ${lastCollectionAt}`} />
                  {activeContractEndDate && (
                    <InfoPill icon={CalendarX2} label={`Sözleşme Bitiş: ${toDateOnlyLabel(activeContractEndDate)}`} />
                  )}
                </div>

              </div>

              <CustomerHeaderActions
                initialStatus={customer.status}
                sharePath={`/arf/cargo/marketing/customers/${customer.id}`}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard label="Toplam Kargo" value={String(totalShipmentCount)} icon={Package} />
              <SummaryCard label="Toplam Taşıma" value={String(totalTransportCount)} icon={Truck} />
              <SummaryCard
                label="Toplam Ciro"
                value={formatCurrency(totalShipmentAmount)}
                icon={Building2}
              />
              <SummaryCard label="Teslim Edilen" value={String(deliveredCount)} icon={CheckCircle2} />
              <SummaryCard
                label="Açık Bakiye"
                value={formatCurrency(currentBalance)}
                icon={CircleDollarSign}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={initialTab} className="space-y-3">
          <TabsList className={cn(
            "grid h-10 w-full rounded-xl border border-slate-200 bg-slate-100 p-0.5",
            {
              "grid-cols-3": !hasShipments && !hasTransports && !showFinance,
              "grid-cols-4": [hasShipments, hasTransports, showFinance].filter(Boolean).length === 1,
              "grid-cols-5": [hasShipments, hasTransports, showFinance].filter(Boolean).length === 2,
              "grid-cols-6": [hasShipments, hasTransports, showFinance].filter(Boolean).length === 3,
            }
          )}>
            <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5" />
              Müşteri Bilgileri
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-1.5 text-xs">
              <MapPin className="size-3.5" />
              Adres Bilgileri
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-1.5 text-xs">
              <FileText className="size-3.5" />
              Sözleşme Bilgileri
            </TabsTrigger>
            {hasShipments && (
              <TabsTrigger value="shipments" className="flex items-center gap-1.5 text-xs">
                <Package className="size-3.5" />
                Kargolar
              </TabsTrigger>
            )}
            {hasTransports && (
              <TabsTrigger value="transports" className="flex items-center gap-1.5 text-xs">
                <Truck className="size-3.5" />
                Taşımalar
              </TabsTrigger>
            )}
            {showFinance && (
              <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs">
                <Calculator className="size-3.5" />
                Finansal Hareketler
              </TabsTrigger>
            )}
          </TabsList>

          {hasShipments && (
            <TabsContent value="shipments">
              <CustomerShipmentsSection shipments={customer.shipments} customerId={customer.id} />
            </TabsContent>
          )}

          {hasTransports && (
            <TabsContent value="transports">
              <CustomerTransportsSection transports={customer.transports} />
            </TabsContent>
          )}

          {showFinance && (
            <TabsContent value="finance">
              <CustomerFinancialSection
                openCargos={openCargos}
                invoices={invoices}
                customerInfo={{
                  customerId: customer.id,
                  customerType: customer.customerType,
                  tradeName: customer.tradeName,
                  taxOffice: customer.taxOffice,
                  taxNumber: customer.taxNumber,
                }}
                showOpenCargos={hasShipments && hasContract}
                showOpenTransports={hasTransports}
                openTransports={customer.transports}
              />
            </TabsContent>
          )}

          <TabsContent value="info">
            <CustomerInfoEditorCard
              customerType={customer.customerType}
              tradeName={customer.tradeName}
              taxOffice={customer.taxOffice || ""}
              taxNumber={customer.taxNumber || ""}
              tcIdentityNumber={customer.tcIdentityNumber || ""}
              firstName={customer.firstName || ""}
              lastName={customer.lastName || ""}
              phone={customer.phone || ""}
              email={customer.email || ""}
            />
          </TabsContent>

          <TabsContent value="addresses">
            <CustomerAddressesSection addresses={customer.addresses} />
          </TabsContent>

          <TabsContent value="contracts">
            <CustomerContractsSection customerId={customer.id} contracts={customer.contracts} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
        <span className="inline-flex size-7 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

function InfoPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
      <Icon className="size-3.5 shrink-0 text-slate-500" />
      <span className="whitespace-nowrap text-slate-700">{label}</span>
    </div>
  )
}
