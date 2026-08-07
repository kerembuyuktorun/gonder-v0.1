import type { LastmileOrder, OrderType } from '../../_types/order'
import {
  FALLBACK_ORDER_SKILLS,
  mapRequirementValuesToVroomIds,
  type SkillCatalogItem,
} from '../../../_lib/skill-catalog'
import type {
  CreateOrderType,
  OrderCreateStep,
  OrderPackageItem,
  OrderCreateFormState,
  OrderTypeFieldConfig,
} from '../_types/order-create'
import {
  mockCustomers,
  mockFacilities,
  mockGelAlPoints,
} from '../_mock/order-create-options'
import { isValidTrMobilePhone, toStoredPhoneValue } from './phone'

export type OrderCreateFieldErrors = Partial<Record<keyof OrderCreateFormState, string>>

export function formatStructuredAddress(
  street: string,
  binaNo: string,
  kat: string,
  daireNo: string
) {
  const streetPart = street.trim()
  if (!streetPart) return ''

  const details = [
    binaNo.trim() ? `No:${binaNo.trim()}` : null,
    kat.trim() ? `Kat:${kat.trim()}` : null,
    daireNo.trim() ? `Daire:${daireNo.trim()}` : null,
  ].filter(Boolean)

  return details.length > 0 ? `${streetPart} ${details.join(' ')}` : streetPart
}

export const ORDER_CREATE_STEP_META: {
  id: OrderCreateStep
  label: string
  title: string
  description: string
  sectionId: string
}[] = [
  {
    id: 1,
    label: 'Sipariş Bilgileri',
    title: 'Sipariş Bilgileri',
    description:
      'Müşteri, referans, sipariş tipi, zaman penceresi ve operasyon tercihlerini tanımlayın.',
    sectionId: 'order-basics',
  },
  {
    id: 2,
    label: 'Lokasyon',
    title: 'Lokasyon ve Muhatap',
    description:
      'Seçilen sipariş tipine göre alış ve varış noktalarını, muhatap ve iletişim bilgilerini girin.',
    sectionId: 'order-locations',
  },
  {
    id: 3,
    label: 'Paket Bilgileri',
    title: 'Paket Bilgileri',
    description:
      'Siparişe bir veya birden fazla paket kalemi ekleyin; hacim ve ağırlık toplamları otomatik hesaplanır.',
    sectionId: 'order-package',
  },
  {
    id: 4,
    label: 'Atama ve Güvenlik',
    title: 'Atama ve Güvenlik',
    description:
      'Teslimat kanıtı, bildirim, OTP ve anlık atama tercihlerini belirleyin.',
    sectionId: 'order-assignment',
  },
  {
    id: 5,
    label: 'Meta Veri',
    title: 'Gelişmiş Meta Veri',
    description: 'Raporlama ve entegrasyonlarda kullanılacak opsiyonel anahtar–değer çiftlerini ekleyin.',
    sectionId: 'order-metadata',
  },
]

const FIELD_STEP_MAP: Partial<Record<keyof OrderCreateFormState, OrderCreateStep>> = {
  musteriId: 1,
  referans_no: 1,
  siparis_tipi: 1,
  rota_tipi: 1,
  alim_tarih: 1,
  alim_baslangic: 1,
  alim_bitis: 1,
  teslim_tarih: 1,
  teslim_baslangic: 1,
  teslim_bitis: 1,
  gorev_suresi_dk: 1,
  oncelik_puani: 1,
  gereksinimler: 1,
  etiketler: 1,
  alis_tesis_id: 2,
  alis_adres: 2,
  alis_full_address: 2,
  alis_lat: 2,
  alis_lon: 2,
  alis_place_id: 2,
  alis_bina_no: 2,
  alis_kat: 2,
  alis_daire_no: 2,
  alis_contact_tipi: 2,
  alis_firma_adi: 2,
  alis_vkn: 2,
  alis_vergi_dairesi: 2,
  alis_tckn: 2,
  alis_muhatabi: 2,
  alis_telefon: 2,
  alis_adres_baslik: 2,
  varis_tesis_id: 2,
  varis_gel_al_id: 2,
  varis_adres: 2,
  varis_full_address: 2,
  varis_lat: 2,
  varis_lon: 2,
  varis_place_id: 2,
  varis_bina_no: 2,
  varis_kat: 2,
  varis_daire_no: 2,
  varis_contact_tipi: 2,
  varis_firma_adi: 2,
  varis_vkn: 2,
  varis_vergi_dairesi: 2,
  varis_tckn: 2,
  varis_muhatabi: 2,
  varis_telefon: 2,
  varis_adres_baslik: 2,
  paketler: 3,
  aktif_rota_id: 4,
  aninda_sahaya_ilet: 4,
  yakin_kuryelere_dagit: 4,
}

export function getOrderTypeFieldConfig(type: CreateOrderType | ''): OrderTypeFieldConfig {
  switch (type) {
    case '':
      return {
        alisMode: 'facility',
        varisMode: 'address',
        showGidenPaket: false,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'dagitim':
      return {
        alisMode: 'facility',
        varisMode: 'address',
        showGidenPaket: false,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'toplama':
    case 'iade':
      return {
        alisMode: 'address',
        varisMode: 'facility',
        showGidenPaket: false,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'transfer':
      return {
        alisMode: 'address',
        varisMode: 'address',
        showGidenPaket: false,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'degisim':
      return {
        alisMode: 'facility',
        varisMode: 'address',
        showGidenPaket: true,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'gel_al':
      return {
        alisMode: 'facility',
        varisMode: 'gel_al',
        showGidenPaket: false,
        requireGorevSuresi: false,
        requireGereksinimler: false,
        requirePickupWindow: true,
        requireDeliveryWindow: true,
      }
    case 'kurulumlu_teslimat':
      return {
        alisMode: 'facility',
        varisMode: 'address',
        showGidenPaket: false,
        requireGorevSuresi: true,
        requireGereksinimler: true,
        requirePickupWindow: false,
        requireDeliveryWindow: true,
      }
  }
}

export function resolveCreateOrderType(form: OrderCreateFormState): OrderType {
  if (!form.siparis_tipi) {
    throw new Error('Sipariş tipi seçilmeden sipariş oluşturulamaz.')
  }
  return form.siparis_tipi
}

export function facilitiesForCustomer(customerId: string) {
  if (!customerId) return []
  return mockFacilities.filter((item) => item.customerId === customerId)
}

function formatWindow(date: string, start: string, end: string): string {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return `${date} - ${start} - ${end}`
  return `${day}.${month}.${year} - ${start} - ${end}`
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addLocalDays(date: Date, amount: number): Date {
  const next = startOfLocalDay(date)
  next.setDate(next.getDate() + amount)
  return next
}

function parseLocalDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

/** Alım/Teslim tarihi: bugün ve sonrası. */
export function getPickupMinDate(today = new Date()): Date {
  return startOfLocalDay(today)
}

/** Alım/Teslim tarihi üst sınırı: bugünden itibaren +7 gün. */
export function getServiceDateMaxDate(today = new Date()): Date {
  return addLocalDays(startOfLocalDay(today), 7)
}

/**
 * Teslim üst sınırı: referans günden itibaren +4 gün.
 * Aralıkta Pazar varsa +1 gün eklenir.
 * Örn. Pazartesi → Cuma; Cuma → gelecek Çarşamba.
 */
export function getDeliveryMaxDate(fromDate = new Date()): Date {
  const start = startOfLocalDay(fromDate)
  let max = addLocalDays(start, 4)

  for (let cursor = start; cursor <= max; cursor = addLocalDays(cursor, 1)) {
    if (cursor.getDay() === 0) {
      max = addLocalDays(max, 1)
      break
    }
  }

  return max
}

export function getDeliveryMinDate(today = new Date()): Date {
  return startOfLocalDay(today)
}

export type DeliveryDateBoundsOptions = {
  /** Ekspres: alım günü + en fazla 1 gün. Standart: alım + 4 gün (Pazar kuralı). */
  express?: boolean
}

/** Teslim: alım tarihinden başlar; üst sınır rota tipine göre değişir. */
export function getDeliveryDateBounds(
  pickupDateValue: string,
  today = new Date(),
  options: DeliveryDateBoundsOptions = {}
): { minDate: Date; maxDate: Date } | undefined {
  const pickupDate = parseLocalDate(pickupDateValue)
  if (!pickupDate) return undefined

  const todayMin = getDeliveryMinDate(today)
  const minDate = pickupDate > todayMin ? pickupDate : todayMin
  const maxDate = options.express ? addLocalDays(pickupDate, 1) : getDeliveryMaxDate(pickupDate)

  if (maxDate < minDate) return undefined
  return { minDate, maxDate }
}

export function isPickupDateAllowed(value: string, today = new Date()): boolean {
  const date = parseLocalDate(value)
  if (!date) return false
  return date >= getPickupMinDate(today) && date <= getServiceDateMaxDate(today)
}

export function isDeliveryDateAllowed(
  value: string,
  pickupDateValue: string,
  today = new Date(),
  options: DeliveryDateBoundsOptions = {}
): boolean {
  const date = parseLocalDate(value)
  if (!date) return false
  const bounds = getDeliveryDateBounds(pickupDateValue, today, options)
  if (!bounds) return false
  return date >= bounds.minDate && date <= bounds.maxDate
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function validateAddressContactFields(
  form: OrderCreateFormState,
  side: 'alis' | 'varis'
): OrderCreateFieldErrors {
  const errors: OrderCreateFieldErrors = {}
  const label = side === 'alis' ? 'Alış' : 'Varış'
  const tip = form[`${side}_contact_tipi`]
  const muhatabi = form[`${side}_muhatabi`]
  const telefon = form[`${side}_telefon`]
  const tipKey = `${side}_contact_tipi` as const
  const muhatabiKey = `${side}_muhatabi` as const
  const telefonKey = `${side}_telefon` as const
  const firmaKey = `${side}_firma_adi` as const
  const vknKey = `${side}_vkn` as const
  const vergiKey = `${side}_vergi_dairesi` as const
  const tcknKey = `${side}_tckn` as const
  const baslikKey = `${side}_adres_baslik` as const
  const adresKey = `${side}_adres` as const
  const binaKey = `${side}_bina_no` as const

  if (!tip) {
    errors[tipKey] = `${label} için bireysel veya kurumsal seçimi zorunludur.`
    return errors
  }

  if (tip === 'kurumsal') {
    if (!form[firmaKey].trim()) errors[firmaKey] = 'Firma ismi zorunludur.'
    const vkn = digitsOnly(form[vknKey])
    if (!vkn) errors[vknKey] = 'VKN zorunludur.'
    else if (vkn.length !== 10) errors[vknKey] = 'VKN 10 haneli olmalıdır.'
    if (!form[vergiKey].trim()) errors[vergiKey] = 'Vergi dairesi zorunludur.'
    if (!muhatabi.trim()) errors[muhatabiKey] = `${label} muhatabı zorunludur.`
  } else {
    if (!muhatabi.trim()) errors[muhatabiKey] = 'Ad soyad zorunludur.'
    const tckn = digitsOnly(form[tcknKey])
    if (!tckn) errors[tcknKey] = 'TCKN zorunludur.'
    else if (tckn.length !== 11) errors[tcknKey] = 'TCKN 11 haneli olmalıdır.'
  }

  if (!telefon.trim()) {
    errors[telefonKey] = `${label} iletişim zorunludur.`
  } else if (!isValidTrMobilePhone(telefon)) {
    errors[telefonKey] = `${label} iletişim numarası geçerli değil.`
  }

  if (!form[baslikKey].trim()) errors[baslikKey] = 'Adres başlığı zorunludur.'
  if (!form[adresKey].trim()) errors[adresKey] = `${label} noktası adresi seçimi zorunludur.`
  else if (form[`${side}_lat`] == null || form[`${side}_lon`] == null) {
    errors[adresKey] = `${label} adresi listeden seçilmelidir.`
  }
  if (!form[binaKey].trim()) errors[binaKey] = 'Bina no zorunludur.'

  return errors
}

const MAX_TIME_WINDOW_MINUTES = 4 * 60

function parseTimeToMinutes(value: string): number | undefined {
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined
  }
  return hour * 60 + minute
}

/** Başlangıç–bitiş farkı 1 dk ile 4 saat arasında olmalı. */
export function getTimeWindowDurationError(start: string, end: string): string | undefined {
  const startMinutes = parseTimeToMinutes(start)
  const endMinutes = parseTimeToMinutes(end)
  if (startMinutes === undefined || endMinutes === undefined) {
    return 'Geçerli bir saat aralığı seçin.'
  }
  if (endMinutes <= startMinutes) {
    return 'Bitiş saati başlangıçtan sonra olmalıdır.'
  }
  if (endMinutes - startMinutes > MAX_TIME_WINDOW_MINUTES) {
    return 'Başlangıç ve bitiş arasında en fazla 4 saat olabilir.'
  }
  return undefined
}

export function validateOrderCreate(form: OrderCreateFormState): OrderCreateFieldErrors {
  const errors: OrderCreateFieldErrors = {}
  const config = getOrderTypeFieldConfig(form.siparis_tipi)

  if (!form.musteriId) errors.musteriId = 'Müşteri seçimi zorunludur.'
  if (!form.siparis_tipi) errors.siparis_tipi = 'Sipariş tipi seçimi zorunludur.'
  if (!form.rota_tipi) {
    errors.rota_tipi = 'Rota tipi seçimi zorunludur.'
  } else if (
    form.rota_tipi === 'Toplama Ringi' &&
    form.siparis_tipi !== 'toplama' &&
    form.siparis_tipi !== 'iade'
  ) {
    errors.rota_tipi = 'Toplama Ringi yalnızca Toplama veya İade siparişlerinde seçilebilir.'
  }

  if (!form.alim_tarih) {
    errors.alim_tarih = 'Alım/Teslim tarihi zorunludur.'
  } else if (!isPickupDateAllowed(form.alim_tarih)) {
    errors.alim_tarih = 'Alım/Teslim tarihi bugünden en fazla 7 gün ileriye seçilebilir.'
  }

  const serviceDate = form.alim_tarih

  if (config.requirePickupWindow) {
    if (!errors.alim_tarih && (!form.alim_baslangic || !form.alim_bitis)) {
      errors.alim_tarih = 'Alım başlangıç ve bitiş saatleri zorunludur.'
    } else if (!errors.alim_tarih && form.alim_baslangic && form.alim_bitis) {
      const alimWindowError = getTimeWindowDurationError(
        form.alim_baslangic,
        form.alim_bitis
      )
      if (alimWindowError) errors.alim_tarih = alimWindowError
    }
  }

  if (config.requireDeliveryWindow) {
    if (!serviceDate) {
      // tarih yoksa teslim hatasını ayrıca basma
    } else if (!form.teslim_baslangic || !form.teslim_bitis) {
      errors.teslim_tarih = 'Teslim başlangıç ve bitiş saatleri zorunludur.'
    } else {
      const teslimWindowError = getTimeWindowDurationError(
        form.teslim_baslangic,
        form.teslim_bitis
      )
      if (teslimWindowError) errors.teslim_tarih = teslimWindowError
    }

    // Same-day lock: teslim tarihi alım/teslim gününden sapmamalı (legacy form state)
    if (
      !errors.teslim_tarih &&
      form.teslim_tarih &&
      serviceDate &&
      form.teslim_tarih !== serviceDate
    ) {
      errors.teslim_tarih = 'Alım ve teslim aynı günde olmalıdır.'
    }
  }

  if (
    config.requirePickupWindow &&
    config.requireDeliveryWindow &&
    !errors.alim_tarih &&
    !errors.teslim_tarih &&
    form.alim_bitis &&
    form.teslim_baslangic &&
    form.alim_bitis > form.teslim_baslangic
  ) {
    errors.teslim_tarih =
      'Teslim saati, alım penceresi bitmeden başlayamaz (alım bitiş ≤ teslim başlangıç).'
  }

  if (!form.oncelik_puani.trim()) {
    errors.oncelik_puani = 'Öncelik puanı zorunludur.'
  } else {
    const priority = Number(form.oncelik_puani)
    if (Number.isNaN(priority) || priority < 0 || priority > 100) {
      errors.oncelik_puani = 'Öncelik puanı 0–100 arasında olmalıdır.'
    }
  }

  if (form.paketler.length === 0) {
    errors.paketler = 'En az bir paket eklenmelidir.'
  } else {
    const invalidPackageIndex = form.paketler.findIndex((item) => getPackageItemError(item))
    if (invalidPackageIndex >= 0) {
      errors.paketler = `${invalidPackageIndex + 1}. paket: ${getPackageItemError(form.paketler[invalidPackageIndex])}`
    }
  }

  if (!form.gorev_suresi_dk.trim()) {
    errors.gorev_suresi_dk = 'Görev süresi zorunludur.'
  } else if (Number(form.gorev_suresi_dk) < 1) {
    errors.gorev_suresi_dk = 'Görev süresi en az 1 dakika olmalıdır.'
  }

  if (config.alisMode === 'facility') {
    if (!form.alis_tesis_id) {
      errors.alis_tesis_id = 'Alış noktası (tesis) seçimi zorunludur.'
    }
    if (!form.alis_muhatabi.trim()) errors.alis_muhatabi = 'Alış muhatabı zorunludur.'
    if (!form.alis_telefon.trim()) {
      errors.alis_telefon = 'Alış iletişim zorunludur.'
    } else if (!isValidTrMobilePhone(form.alis_telefon)) {
      errors.alis_telefon = 'Alış iletişim numarası geçerli değil.'
    }
  }
  if (config.alisMode === 'address') {
    Object.assign(errors, validateAddressContactFields(form, 'alis'))
  }

  if (config.varisMode === 'facility') {
    if (!form.varis_tesis_id) {
      errors.varis_tesis_id = 'Varış noktası (tesis) seçimi zorunludur.'
    }
    if (!form.varis_muhatabi.trim()) errors.varis_muhatabi = 'Varış muhatabı zorunludur.'
    if (!form.varis_telefon.trim()) {
      errors.varis_telefon = 'Varış iletişim zorunludur.'
    } else if (!isValidTrMobilePhone(form.varis_telefon)) {
      errors.varis_telefon = 'Varış iletişim numarası geçerli değil.'
    }
  }
  if (config.varisMode === 'gel_al') {
    if (!form.varis_gel_al_id) {
      errors.varis_gel_al_id = 'Varış Gel-Al noktası seçimi zorunludur.'
    }
    if (!form.varis_muhatabi.trim()) errors.varis_muhatabi = 'Varış muhatabı zorunludur.'
    if (!form.varis_telefon.trim()) {
      errors.varis_telefon = 'Varış iletişim zorunludur.'
    } else if (!isValidTrMobilePhone(form.varis_telefon)) {
      errors.varis_telefon = 'Varış iletişim numarası geçerli değil.'
    }
  }
  if (config.varisMode === 'address') {
    Object.assign(errors, validateAddressContactFields(form, 'varis'))
  }

  if (config.requireGereksinimler && form.gereksinimler.length === 0) {
    errors.gereksinimler = 'Kurulumlu teslimatta en az bir gereksinim seçilmelidir.'
  }

  if (form.aninda_sahaya_ilet && !form.aktif_rota_id) {
    errors.aktif_rota_id = 'Anında sahaya ilet için aktif rota seçilmelidir.'
  }

  if (form.yakin_kuryelere_dagit && form.aninda_sahaya_ilet) {
    errors.aninda_sahaya_ilet = 'Yakındaki kuryelere dağıt ile birlikte seçilemez.'
  }

  return errors
}

export function validationErrorMessages(errors: OrderCreateFieldErrors): string[] {
  return Object.values(errors).filter((message): message is string => Boolean(message))
}

export function getStepFieldErrors(
  step: OrderCreateStep,
  form: OrderCreateFormState
): OrderCreateFieldErrors {
  const allErrors = validateOrderCreate(form)
  const stepErrors: OrderCreateFieldErrors = {}

  for (const [key, message] of Object.entries(allErrors) as [
    keyof OrderCreateFormState,
    string,
  ][]) {
    if (FIELD_STEP_MAP[key] === step && message) {
      stepErrors[key] = message
    }
  }

  return stepErrors
}

export function firstInvalidStep(errors: OrderCreateFieldErrors): OrderCreateStep {
  for (const key of Object.keys(errors) as (keyof OrderCreateFormState)[]) {
    const step = FIELD_STEP_MAP[key]
    if (step) return step
  }
  return 1
}

/** Hedef adıma gitmeden önce 1..target-1 adımlarının geçerli olması gerekir. */
export function canNavigateToStep(target: OrderCreateStep, form: OrderCreateFormState): boolean {
  for (let step = 1; step < target; step += 1) {
    if (validationErrorMessages(getStepFieldErrors(step as OrderCreateStep, form)).length > 0) {
      return false
    }
  }
  return true
}

export function getPackageItemError(item: OrderPackageItem): string | undefined {
  if (!item.hacim_sinifi) return 'Paket boyutu seçilmelidir.'

  const quantity = Number(item.adet)
  if (!Number.isInteger(quantity) || quantity < 1) return 'Adet en az 1 olmalıdır.'

  if (!item.hacim.trim()) return 'Birim hacim zorunludur.'
  const hacim = Number(item.hacim.replace(',', '.'))
  if (!Number.isFinite(hacim) || hacim <= 0) return 'Birim hacim 0’dan büyük olmalıdır.'

  if (!item.agirlik_kg.trim()) return 'Birim ağırlık zorunludur.'
  const kg = Number(item.agirlik_kg)
  if (!Number.isFinite(kg) || kg <= 0) return 'Birim ağırlık 0’dan büyük olmalıdır.'

  return undefined
}

export function calculatePackageTotals(items: OrderPackageItem[]) {
  return items.reduce(
    (totals, item) => {
      const quantity = Number(item.adet) || 0
      totals.adet += quantity
      totals.hacim += (Number(item.hacim.replace(',', '.')) || 0) * quantity
      totals.agirlikKg += (Number(item.agirlik_kg) || 0) * quantity
      return totals
    },
    { adet: 0, hacim: 0, agirlikKg: 0 }
  )
}

export function buildOrderFromForm(form: OrderCreateFormState): LastmileOrder {
  const customer = mockCustomers.find((item) => item.id === form.musteriId)
  const config = getOrderTypeFieldConfig(form.siparis_tipi)
  const siparisTipi = resolveCreateOrderType(form)

  const pickupFacility = mockFacilities.find((item) => item.id === form.alis_tesis_id)
  const dropFacility = mockFacilities.find((item) => item.id === form.varis_tesis_id)
  const gelAl = mockGelAlPoints.find((item) => item.id === form.varis_gel_al_id)

  let alisNoktasi: string
  let alisAcikAdres = ''
  let alisMuhatabi = form.alis_muhatabi.trim()
  let alisTelefon = toStoredPhoneValue(form.alis_telefon)

  if (config.alisMode === 'facility' && pickupFacility) {
    alisNoktasi = pickupFacility.label
    alisAcikAdres = pickupFacility.address
    if (!alisMuhatabi) alisMuhatabi = pickupFacility.contactName
    if (!alisTelefon) alisTelefon = toStoredPhoneValue(pickupFacility.contactPhone)
  } else {
    alisNoktasi = formatStructuredAddress(
      form.alis_adres,
      form.alis_bina_no,
      form.alis_kat,
      form.alis_daire_no
    )
    alisAcikAdres = form.alis_full_address.trim() || alisNoktasi
  }

  let varisNoktasi: string
  let varisAcikAdres = ''
  let varisMuhatabi = form.varis_muhatabi.trim()
  let varisTelefon = toStoredPhoneValue(form.varis_telefon)

  if (config.varisMode === 'facility' && dropFacility) {
    varisNoktasi = dropFacility.label
    varisAcikAdres = dropFacility.address
    if (!varisMuhatabi) varisMuhatabi = dropFacility.contactName
    if (!varisTelefon) varisTelefon = toStoredPhoneValue(dropFacility.contactPhone)
  } else if (config.varisMode === 'gel_al' && gelAl) {
    varisNoktasi = gelAl.label
    varisAcikAdres = gelAl.address
    if (!varisMuhatabi) varisMuhatabi = gelAl.contactName
    if (!varisTelefon) varisTelefon = toStoredPhoneValue(gelAl.contactPhone)
  } else {
    varisNoktasi = formatStructuredAddress(
      form.varis_adres,
      form.varis_bina_no,
      form.varis_kat,
      form.varis_daire_no
    )
    varisAcikAdres = form.varis_full_address.trim() || varisNoktasi
  }

  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const createdAt = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const trackingSuffix = String(9900 + Math.floor(Math.random() * 90))
  const packageTotals = calculatePackageTotals(form.paketler)
  const volumeOrder = { S: 0, M: 1, L: 2, XL: 3 } as const
  const largestPackage =
    [...form.paketler].sort(
      (left, right) => volumeOrder[right.hacim_sinifi] - volumeOrder[left.hacim_sinifi]
    )[0]?.hacim_sinifi ?? 'M'
  const giden = config.showGidenPaket ? packageTotals.adet : null

  return {
    id: `lm-${Date.now()}`,
    takip_no: `ARF-${trackingSuffix}`,
    referans_no: form.referans_no.trim(),
    siparis_tipi: siparisTipi,
    durum: 'atama_bekliyor',
    durum_etiketi: null,
    rota_atandi: false,
    rota_kodu: null,
    zaman_penceresi: (() => {
      const alim = formatWindow(form.alim_tarih, form.alim_baslangic, form.alim_bitis)
      const teslim = formatWindow(
        form.teslim_tarih || form.alim_tarih,
        form.teslim_baslangic,
        form.teslim_bitis
      )
      return (
        [alim ? `Alım: ${alim}` : null, teslim ? `Teslim: ${teslim}` : null]
          .filter(Boolean)
          .join(' · ') || '—'
      )
    })(),
    alim_zaman_penceresi:
      formatWindow(form.alim_tarih, form.alim_baslangic, form.alim_bitis) || '—',
    teslim_zaman_penceresi:
      formatWindow(
        form.teslim_tarih || form.alim_tarih,
        form.teslim_baslangic,
        form.teslim_bitis
      ) || '—',
    eta: '—',
    eta_kalan_dk: null,
    eta_alim_yapildi: false,
    gorev_suresi_dk: Number(form.gorev_suresi_dk) || 5,
    oncelik_puani: Number(form.oncelik_puani) || 50,
    gereksinimler: form.gereksinimler,
    musteri: customer?.label ?? '—',
    musteri_id: form.musteriId || null,
    alis_noktasi: alisNoktasi,
    alis_acik_adres: alisAcikAdres,
    alis_muhatabi: alisMuhatabi,
    alis_telefon: alisTelefon,
    varis_noktasi: varisNoktasi,
    varis_acik_adres: varisAcikAdres,
    varis_muhatabi: varisMuhatabi,
    varis_telefon: varisTelefon,
    mesafe_m: 0,
    hacim_sinifi: largestPackage,
    paket_sayisi: packageTotals.adet,
    toplam_hacim: packageTotals.hacim,
    agirlik_kg: packageTotals.agirlikKg,
    giden_paket: giden,
    donen_paket: null,
    rota_tipi: form.rota_tipi || 'Standart Rota',
    atanan_arac: null,
    atanan_kurye: null,
    etiketler: form.etiketler,
    olusturulma_zamani: createdAt,
    olusturan: 'Manuel',
    bolge: '—',
  }
}

export function mapRequirementsToSkillIds(
  values: string[],
  catalog: SkillCatalogItem[] = FALLBACK_ORDER_SKILLS
): number[] {
  return mapRequirementValuesToVroomIds(values, catalog)
}
