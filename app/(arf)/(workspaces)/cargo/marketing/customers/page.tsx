"use client"

import { useState } from "react"
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChevronDown, ChevronUp, Plus, ShieldCheck, UserRound, Users } from "lucide-react"
import { toast } from "sonner"
import { customerListRows } from "./_data/customers"
import { CustomersTableSection } from "./_components/customers-table-section"
import {
  CustomerAddressModal,
  type AddressFormState,
  type CustomerCreateStep,
  type CustomerFormState,
  type ModalState,
} from "../../shipments/_components/customer-address-modal"

const initialCustomerFormState: CustomerFormState = {
  customerType: "corporate",
  tradeName: "",
  taxNumber: "",
  taxOffice: "",
  tcIdentityNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  contactName: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  branch: "",
}

const initialAddressFormState: AddressFormState = {
  label: "",
  city: "",
  district: "",
  neighborhood: "",
  line1: "",
  contactName: "",
  phone: "",
  branch: "",
}

export default function MusterilerPage() {
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [modalState, setModalState] = useState<ModalState | null>(null)
  const [customerCreateStep, setCustomerCreateStep] = useState<CustomerCreateStep>("type")
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(() => ({ ...initialCustomerFormState }))
  const [addressForm, setAddressForm] = useState<AddressFormState>(() => ({ ...initialAddressFormState }))
  const [modalError, setModalError] = useState("")

  const totalCustomerCount = customerListRows.length
  const passiveCustomerCount = customerListRows.filter((row) => row.durum === "passive").length
  const contractedCustomerCount = customerListRows.filter((row) => row.aktif_sozlesme_sayisi > 0).length
  const individualCustomerCount = customerListRows.filter((row) => row.tip === "individual").length
  const corporateCustomerCount = customerListRows.filter((row) => row.tip === "corporate").length

  const summaryCards = [
    { label: "Toplam Müşteri", value: String(totalCustomerCount), icon: Users },
    { label: "Pasif Müşteri", value: String(passiveCustomerCount), icon: CheckCircle2 },
    { label: "Sözleşmeli Müşteri", value: String(contractedCustomerCount), icon: ShieldCheck },
    { label: "Bireysel Müşteri", value: String(individualCustomerCount), icon: UserRound },
    { label: "Kurumsal Müşteri", value: String(corporateCustomerCount), icon: Users },
  ]

  const openCreateCustomerModal = () => {
    setModalState({ side: "sender", entity: "customer", mode: "create" })
    setCustomerCreateStep("type")
    setCustomerForm({ ...initialCustomerFormState })
    setAddressForm({ ...initialAddressFormState })
    setModalError("")
  }

  const closeModal = () => {
    setModalState(null)
    setCustomerCreateStep("type")
    setModalError("")
  }

  const goBackInModal = () => {
    if (customerCreateStep === "address") {
      setCustomerCreateStep("customer")
      setModalError("")
      return
    }

    if (customerCreateStep === "customer") {
      setCustomerCreateStep("type")
      setModalError("")
      return
    }

    closeModal()
  }

  const saveModal = () => {
    if (!modalState) return

    if (customerCreateStep === "type") {
      setCustomerCreateStep("customer")
      setModalError("")
      return
    }

    if (customerCreateStep === "customer") {
      const isCorporate = customerForm.customerType === "corporate"
      const firstName = customerForm.firstName.trim()
      const lastName = customerForm.lastName.trim()
      const email = customerForm.email.trim()
      const phone = customerForm.phone.trim()
      const contactName = `${firstName} ${lastName}`.trim()

      if (isCorporate && !customerForm.tradeName.trim()) {
        setModalError("Kurumsal müşteri için şirket adı zorunludur.")
        return
      }

      if (isCorporate && !customerForm.taxNumber.trim()) {
        setModalError("Kurumsal müşteri için vergi numarası zorunludur.")
        return
      }

      if (isCorporate && !customerForm.taxOffice.trim()) {
        setModalError("Kurumsal müşteri için vergi dairesi zorunludur.")
        return
      }

      if (!isCorporate && !/^\d{11}$/.test(customerForm.tcIdentityNumber.trim())) {
        setModalError("Bireysel müşteri için 11 haneli TC kimlik numarası girin.")
        return
      }

      if (!firstName || !lastName) {
        setModalError(
          isCorporate ? "Şirket yetkili adı ve soyadı zorunludur." : "Ad ve soyad alanları zorunludur.",
        )
        return
      }

      if (!phone) {
        setModalError(
          isCorporate ? "Şirket yetkili telefon numarası zorunludur." : "Telefon numarası zorunludur.",
        )
        return
      }

      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        setModalError("Geçerli bir email adresi girin veya boş bırakın.")
        return
      }

      setAddressForm((current) => ({
        ...current,
        contactName,
        phone,
      }))
      setCustomerCreateStep("address")
      setModalError("")
      return
    }

    if (!addressForm.label.trim() || !addressForm.line1.trim()) {
      setModalError("Adres başlığı ve açık adres zorunludur.")
      return
    }

    if (!addressForm.city.trim() || !addressForm.district.trim() || !addressForm.neighborhood.trim()) {
      setModalError("Adres için şehir, ilçe ve mahalle bilgileri zorunludur.")
      return
    }

    toast.success("Yeni müşteri akışı tamamlandı (demo)")
    closeModal()
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Satış & Pazarlama" },
          { label: "Müşteriler" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Müşteriler</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryVisible((prev) => !prev)}
            >
              {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
              {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
            </Button>
            <Button className="shrink-0" onClick={openCreateCustomerModal}>
              <Plus className="mr-2 size-4" />
              Yeni Müşteri
            </Button>
          </div>
        </div>

        {isSummaryVisible && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium tracking-wide text-slate-500">{card.label}</p>
                    <span className="inline-flex size-7 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary">
                      <card.icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent>
            <CustomersTableSection data={customerListRows} />
          </CardContent>
        </Card>

        <CustomerAddressModal
          modalState={modalState}
          customerCreateStep={customerCreateStep}
          customerForm={customerForm}
          addressForm={addressForm}
          modalError={modalError}
          setCustomerForm={setCustomerForm}
          setAddressForm={setAddressForm}
          onClose={closeModal}
          onBack={goBackInModal}
          onSave={saveModal}
        />
      </div>
    </>
  )
}
