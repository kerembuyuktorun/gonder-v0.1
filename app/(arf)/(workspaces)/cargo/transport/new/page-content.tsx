'use client'

import { useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import {
  CustomerAddressModal,
  type AddressFormState,
  type CustomerCreateStep,
  type CustomerFormState,
  type ModalState,
  type PartySide,
  type ModalEntity,
  resolveAddressBranch,
} from '../../shipments/_components/customer-address-modal'

import type {
  CustomerRecord,
  AddressRecord,
  FiyatlandirmaBilgileri,
  OperasyonBilgileri,
  SevkBilgileri,
  TasimaSecBilgileri,
  TransportStep,
} from './_types/transport'

import {
  mockAddresses,
  mockCustomers,
  mockDrivers,
  mockKdvOptions,
  mockTasimaCarisiOptions,
  mockVehicles,
  mockYukTipiOptions,
} from './_mock/transport-mock-data'

import { TransportStepper } from './_components/transport-stepper'
import { OperasyonBilgileriStep } from './_components/step-operasyon-bilgileri'
import { SevkBilgileriStep } from './_components/step-sevk-bilgileri'
import { TasimaSecStep } from './_components/step-tasima-sec'
import { FiyatlandirmaStep } from './_components/step-fiyatlandirma'

/* ─── Initial state ─── */

const initialOperasyon: OperasyonBilgileri = {
  yuklemeTarihi: new Date().toLocaleDateString('tr-TR'),
  gondericiMusteri: { customerId: null, addressId: null },
  aliciMusteri: { customerId: null, addressId: null },
  cikisAdresi: { customerId: null, addressId: null },
  varisAdresi: { customerId: null, addressId: null },
  faturaKesimYeri: 'sender',
  faturaKesimMusteriId: null,
}

const initialSevk: SevkBilgileri = {
  tasimaciFirmaId: null,
  aracPlakaId: null,
  surucuId: null,
}

const initialTasimaSec: TasimaSecBilgileri = {
  gonderiTipi: 'FTL',
  ftl: {
    yukler: [],
  },
  ltl: [],
}

const initialFiyatlandirma: FiyatlandirmaBilgileri = {
  satisFiyat: 0,
  satisKdvOran: 20,
  satisTevfikat: false,
  satisFiyatDetay: {
    birimFiyat: 0,
    araToplam: 0,
    tevfikatTutari: 0,
    kdvTutari: 0,
    toplamFiyat: 0,
  },
  alisFiyat: 0,
  alisKdvOran: 20,
  alisTevfikat: false,
  alisFiyatDetay: {
    birimFiyat: 0,
    araToplam: 0,
    tevfikatTutari: 0,
    kdvTutari: 0,
    toplamFiyat: 0,
  },
}

const initialCustomerFormState: CustomerFormState = {
  customerType: 'corporate',
  tradeName: '',
  taxNumber: '',
  taxOffice: '',
  tcIdentityNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  contactName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  branch: '',
}

const initialAddressFormState: AddressFormState = {
  label: '',
  city: '',
  district: '',
  neighborhood: '',
  line1: '',
  contactName: '',
  phone: '',
  branch: '',
}

const STANDARD_PRIMARY_BUTTON_CLASS = 'h-11 rounded-2xl px-5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90'

/* ─── Component ─── */

export default function TasimaOlusturPageContent() {
  const sidebarState = useSidebar().state

  const [currentStep, setCurrentStep] = useState<TransportStep>(1)
  const [operasyon, setOperasyon] = useState(initialOperasyon)
  const [sevk, setSevk] = useState(initialSevk)
  const [tasimaSec, setTasimaSec] = useState(initialTasimaSec)
  const [fiyatlandirma, setFiyatlandirma] = useState(initialFiyatlandirma)

  /* ─── Müşteri / Adres state ─── */
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => [...mockCustomers])
  const [addresses, setAddresses] = useState<AddressRecord[]>(() => [...mockAddresses])

  /* ─── Modal state ─── */
  const [modalState, setModalState] = useState<ModalState | null>(null)
  const [customerCreateStep, setCustomerCreateStep] = useState<CustomerCreateStep>('type')
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null)
  const [modalError, setModalError] = useState('')
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(initialCustomerFormState)
  const [addressForm, setAddressForm] = useState<AddressFormState>(initialAddressFormState)

  /* ─── Derived combo options ─── */
  const customerComboOptions = customers.map((c) => ({
    id: c.id,
    label: c.customerName,
    description: `${c.city || ''} · ${c.taxNumber || ''}`.replace(/^ · | · $/g, ''),
    keywords: `${c.tradeName} ${c.taxNumber} ${c.city}`,
  }))

  const getAddressOptions = (customerId: string | null) => {
    if (!customerId) return []
    return addresses
      .filter((a) => a.customerId === customerId)
      .map((a) => ({
        id: a.id,
        label: a.label,
        description: `${a.city} / ${a.district} / ${a.neighborhood}`,
        keywords: `${a.line1} ${a.city} ${a.district}`,
      }))
  }

  /* ─── Derived selected records ─── */
  const senderCustomer = customers.find((c) => c.id === operasyon.gondericiMusteri.customerId)
  const senderAddress = addresses.find((a) => a.id === operasyon.cikisAdresi.addressId)
  const receiverCustomer = customers.find((c) => c.id === operasyon.aliciMusteri.customerId)
  const receiverAddress = addresses.find((a) => a.id === operasyon.varisAdresi.addressId)

  /* ─── Modal helpers ─── */
  const openCreateModal = (side: PartySide, entity: ModalEntity) => {
    const selectedCustomer = side === 'sender' ? senderCustomer : receiverCustomer

    setModalState({ side, entity, mode: 'create' })
    setModalError('')

    if (entity === 'customer') {
      setCustomerCreateStep('type')
      setPendingCustomerId(null)
      setCustomerForm({ ...initialCustomerFormState })
      return
    }

    setCustomerCreateStep('address')
    setPendingCustomerId(null)
    setAddressForm({
      label: '',
      city: selectedCustomer?.city || '',
      district: '',
      neighborhood: '',
      line1: '',
      contactName: '',
      phone: selectedCustomer?.phone || '',
      branch: '',
    })
  }

  const openEditModal = (side: PartySide, entity: ModalEntity) => {
    setModalError('')

    if (entity === 'customer') {
      const selectedCustomer = side === 'sender' ? senderCustomer : receiverCustomer
      if (!selectedCustomer) return

      setModalState({ side, entity, mode: 'edit', targetId: selectedCustomer.id })
      setCustomerCreateStep('customer')
      setPendingCustomerId(null)
      setCustomerForm({
        customerType: selectedCustomer.customerType,
        tradeName: selectedCustomer.tradeName,
        taxNumber: selectedCustomer.taxNumber,
        taxOffice: selectedCustomer.taxOffice,
        tcIdentityNumber: selectedCustomer.customerType === 'individual' ? selectedCustomer.taxNumber : '',
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        email: selectedCustomer.email,
        contactName: selectedCustomer.contactName,
        phone: selectedCustomer.phone,
        city: selectedCustomer.city,
        district: selectedCustomer.district,
        neighborhood: selectedCustomer.neighborhood,
        branch: selectedCustomer.branch,
      })
      return
    }

    const selectedAddress = side === 'sender' ? senderAddress : receiverAddress
    if (!selectedAddress) return

    setModalState({ side, entity, mode: 'edit', targetId: selectedAddress.id })
    setCustomerCreateStep('address')
    setPendingCustomerId(null)
    setAddressForm({
      label: selectedAddress.label,
      city: selectedAddress.city,
      district: selectedAddress.district,
      neighborhood: selectedAddress.neighborhood,
      line1: selectedAddress.line1,
      contactName: selectedAddress.contactName,
      phone: selectedAddress.phone,
      branch: selectedAddress.branch,
    })
  }

  const closeModal = () => {
    setModalState(null)
    setModalError('')
    setCustomerCreateStep('type')
    setPendingCustomerId(null)
  }

  const goBackInModal = () => {
    const isCustomerCreateFlow = modalState?.entity === 'customer' && modalState?.mode === 'create'

    if (!isCustomerCreateFlow) {
      closeModal()
      return
    }

    if (customerCreateStep === 'address') {
      setCustomerCreateStep('customer')
      setModalError('')
      return
    }

    if (customerCreateStep === 'customer') {
      setCustomerCreateStep('type')
      setModalError('')
      return
    }

    closeModal()
  }

  const saveModal = () => {
    if (!modalState) return

    if (modalState.entity === 'customer' && !(modalState.mode === 'create' && customerCreateStep === 'address')) {
      if (modalState.mode === 'create' && customerCreateStep === 'type') {
        setCustomerCreateStep('customer')
        setModalError('')
        return
      }

      const isCorporate = customerForm.customerType === 'corporate'
      const companyName = customerForm.tradeName.trim()
      const taxNumber = customerForm.taxNumber.trim()
      const taxOffice = customerForm.taxOffice.trim()
      const tcIdentityNumber = customerForm.tcIdentityNumber.trim()
      const firstName = customerForm.firstName.trim()
      const lastName = customerForm.lastName.trim()
      const email = customerForm.email.trim()
      const phone = customerForm.phone.trim()
      const contactName = `${firstName} ${lastName}`.trim()

      if (isCorporate && !companyName) { setModalError('Şirket adı zorunludur.'); return }
      if (isCorporate && !taxNumber) { setModalError('Vergi numarası zorunludur.'); return }
      if (isCorporate && !taxOffice) { setModalError('Vergi dairesi zorunludur.'); return }
      if (!isCorporate && !/^\d{11}$/.test(tcIdentityNumber)) { setModalError('11 haneli TC kimlik numarası girin.'); return }
      if (!firstName || !lastName) { setModalError('Ad ve soyad zorunludur.'); return }
      if (!phone) { setModalError('Telefon numarası zorunludur.'); return }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) { setModalError('Geçerli bir email girin.'); return }

      if (modalState.mode === 'edit' && modalState.targetId) {
        setCustomers((cur) =>
          cur.map((item) =>
            item.id === modalState.targetId
              ? { ...item, customerType: customerForm.customerType, tradeName: isCorporate ? companyName : contactName, customerName: isCorporate ? companyName : contactName, taxNumber: isCorporate ? taxNumber : tcIdentityNumber, taxOffice: isCorporate ? taxOffice : '', firstName, lastName, email, contactName, phone }
              : item,
          ),
        )
        closeModal()
        return
      }

      if (modalState.mode === 'create' && pendingCustomerId) {
        setCustomers((cur) =>
          cur.map((item) =>
            item.id === pendingCustomerId
              ? { ...item, customerType: customerForm.customerType, tradeName: isCorporate ? companyName : contactName, customerName: isCorporate ? companyName : contactName, taxNumber: isCorporate ? taxNumber : tcIdentityNumber, taxOffice: isCorporate ? taxOffice : '', firstName, lastName, email, contactName, phone }
              : item,
          ),
        )
        setAddressForm((cur) => ({ ...cur, contactName, phone }))
        setCustomerCreateStep('address')
        setModalError('')
        return
      }

      const newCustomer: CustomerRecord = {
        id: `cust-${Date.now()}`,
        customerType: customerForm.customerType,
        tradeName: isCorporate ? companyName : contactName,
        customerName: isCorporate ? companyName : contactName,
        taxNumber: isCorporate ? taxNumber : tcIdentityNumber,
        taxOffice: isCorporate ? taxOffice : '',
        firstName, lastName, email, contactName, phone,
        city: '', district: '', neighborhood: '', branch: '',
      }

      setCustomers((cur) => [...cur, newCustomer])

      if (modalState.side === 'sender') {
        setOperasyon((prev) => ({
          ...prev,
          gondericiMusteri: { ...prev.gondericiMusteri, customerId: newCustomer.id },
          cikisAdresi: { ...prev.cikisAdresi, addressId: null },
        }))
      } else {
        setOperasyon((prev) => ({
          ...prev,
          aliciMusteri: { ...prev.aliciMusteri, customerId: newCustomer.id },
          varisAdresi: { ...prev.varisAdresi, addressId: null },
        }))
      }

      setPendingCustomerId(newCustomer.id)
      setAddressForm({ label: '', city: '', district: '', neighborhood: '', line1: '', contactName: newCustomer.contactName, phone: newCustomer.phone, branch: '' })
      setCustomerCreateStep('address')
      setModalError('')
      return
    }

    /* ─── Adres kaydetme ─── */
    const selectedCustomerId = pendingCustomerId || (modalState.side === 'sender' ? operasyon.gondericiMusteri.customerId : operasyon.aliciMusteri.customerId)

    if (!selectedCustomerId) { setModalError('Önce bir müşteri seçmeniz gerekiyor.'); return }
    if (!addressForm.label.trim() || !addressForm.line1.trim()) { setModalError('Adres başlığı ve açık adres zorunludur.'); return }

    const addressCity = addressForm.city.trim()
    const addressDistrict = addressForm.district.trim()
    const addressNeighborhood = addressForm.neighborhood.trim()
    const addressPhone = addressForm.phone.trim() || '5XXXXXXXXX'
    const addressContactName = addressForm.contactName.trim() || 'Adres Yetkilisi'
    const resolvedBranch = resolveAddressBranch(addressCity, addressDistrict, addressNeighborhood)

    if (!addressCity || !addressDistrict || !addressNeighborhood) { setModalError('Şehir, ilçe ve mahalle zorunludur.'); return }

    if (modalState.mode === 'edit' && modalState.targetId) {
      setAddresses((cur) =>
        cur.map((item) =>
          item.id === modalState.targetId
            ? { ...item, customerId: selectedCustomerId, label: addressForm.label.trim(), line1: addressForm.line1.trim(), city: addressCity, district: addressDistrict, neighborhood: addressNeighborhood, phone: addressPhone, contactName: addressContactName, branch: resolvedBranch }
            : item,
        ),
      )
      setCustomers((cur) =>
        cur.map((item) =>
          item.id === selectedCustomerId ? { ...item, city: addressCity, district: addressDistrict, neighborhood: addressNeighborhood, branch: resolvedBranch } : item,
        ),
      )
      closeModal()
      return
    }

    const newAddress: AddressRecord = {
      id: `addr-${Date.now()}`,
      customerId: selectedCustomerId,
      label: addressForm.label.trim(),
      line1: addressForm.line1.trim(),
      city: addressCity, district: addressDistrict, neighborhood: addressNeighborhood,
      phone: addressPhone, contactName: addressContactName, branch: resolvedBranch,
    }

    setAddresses((cur) => [...cur, newAddress])
    setCustomers((cur) =>
      cur.map((item) =>
        item.id === selectedCustomerId ? { ...item, city: addressCity, district: addressDistrict, neighborhood: addressNeighborhood, branch: resolvedBranch } : item,
      ),
    )

    if (modalState.side === 'sender') {
      setOperasyon((prev) => ({ ...prev, cikisAdresi: { ...prev.cikisAdresi, addressId: newAddress.id } }))
    } else {
      setOperasyon((prev) => ({ ...prev, varisAdresi: { ...prev.varisAdresi, addressId: newAddress.id } }))
    }

    closeModal()
  }

  const goNext = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as TransportStep)
  }

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as TransportStep)
  }

  const handleSubmit = () => {
    // TODO: Backend'e gönderim
    void operasyon
    void sevk
    void tasimaSec
    void fiyatlandirma
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Taşıma İşlemleri', href: '/arf/cargo/transport/list' },
          { label: 'Taşıma Oluştur' },
        ]}
        searchPlaceholder="Hızlı işlem ara..."
        commandTitle="Taşıma Oluştur"
        commandDescription="Yeni taşıma oluşturma ekranı"
        searchEmptyMessage="Uygun işlem bulunamadı."
        searchCommands={[]}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-slate-50 p-4 pb-24 pt-3 lg:px-6 lg:pb-24 lg:pt-3">
        {/* Stepper */}
        <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <TransportStepper currentStep={currentStep} onStepClick={setCurrentStep} />
          </CardContent>
        </Card>

        {/* Step İçeriği */}
        <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 lg:p-6">
            {currentStep === 1 && (
              <OperasyonBilgileriStep
                data={operasyon}
                customers={customers}
                addresses={addresses}
                customerComboOptions={customerComboOptions}
                getAddressOptions={getAddressOptions}
                onChange={setOperasyon}
                onCreateCustomer={(side) => openCreateModal(side, 'customer')}
                onCreateAddress={(side) => openCreateModal(side, 'address')}
                onEditCustomer={(side) => openEditModal(side, 'customer')}
                onEditAddress={(side) => openEditModal(side, 'address')}
              />
            )}

            {currentStep === 2 && (
              <SevkBilgileriStep
                data={sevk}
                tasimaciFirmaOptions={mockTasimaCarisiOptions}
                vehicles={mockVehicles}
                drivers={mockDrivers}
                onChange={setSevk}
              />
            )}

            {currentStep === 3 && (
              <TasimaSecStep
                data={tasimaSec}
                selectedVehicle={mockVehicles.find((v) => v.id === sevk.aracPlakaId) ?? null}
                yukTipiOptions={mockYukTipiOptions}
                onChange={setTasimaSec}
              />
            )}

            {currentStep === 4 && (
              <FiyatlandirmaStep
                data={fiyatlandirma}
                kdvOptions={mockKdvOptions}
                onChange={setFiyatlandirma}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alt sabit buton barı */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm',
          sidebarState === 'collapsed' ? 'md:left-(--sidebar-width-icon)' : 'md:left-(--sidebar-width)',
        )}
      >
        <div className="flex items-center justify-end gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              className={STANDARD_PRIMARY_BUTTON_CLASS}
              onClick={goBack}
            >
              Geri
            </Button>
          )}
          {currentStep < 4 ? (
            <Button className={STANDARD_PRIMARY_BUTTON_CLASS} onClick={goNext}>
              Devam et
            </Button>
          ) : (
            <Button className={STANDARD_PRIMARY_BUTTON_CLASS} onClick={handleSubmit}>
              Devam et
            </Button>
          )}
        </div>
      </div>

      {/* Müşteri / Adres Modalı */}
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
    </>
  )
}
