import type { CreateOrderType, OrderCreateFormState } from '../_types/order-create'
import {
  filterImplicitSkillIds,
  type SkillCatalogItem,
} from '../../../_lib/skill-catalog'
import { getOrderTypeFieldConfig, mapRequirementsToSkillIds } from './order-create-helpers'
import { toNationalPhoneDigits } from './phone'

function toE164Phone(value: string): string {
  const national = toNationalPhoneDigits(value)
  if (national.length === 10) return `+90${national}`
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length >= 12) return `+${digits}`
  return value.trim()
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '-' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function toIsoDateTime(date: string, time: string): string | undefined {
  if (!date || !time) return undefined
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return undefined
  // Europe/Istanbul fixed offset — avoids UTC day-shift vs BE calendarDayKey
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `${date}T${hh}:${mm}:00+03:00`
}

const ORDER_TYPE_MAP: Record<Exclude<CreateOrderType, 'gel_al'>, string> = {
  dagitim: 'DELIVERY',
  toplama: 'PICKUP',
  iade: 'RETURN',
  transfer: 'TRANSFER',
  degisim: 'SWAP',
  kurulumlu_teslimat: 'INSTALL',
}

const METHOD_MAP: Record<string, 'STANDARD' | 'EXPRESS' | 'MILK_RUN'> = {
  'Standart Rota': 'STANDARD',
  'Ekspres Rota': 'EXPRESS',
  'Toplama Ringi': 'MILK_RUN',
}

const TAG_TO_BE: Record<string, string> = {
  'Kırılabilir Paket': 'Kirilabilir Paket',
  'Zile Basma': 'Zile Basma',
  'Kapıya Bırak': 'Kapiya Birak',
  Acil: 'Acil',
}

function mapTags(tags: string[]): string[] {
  return tags.map((tag) => TAG_TO_BE[tag] ?? tag)
}

function buildContactInput(
  contactType: 'SENDER' | 'RECEIVER',
  form: OrderCreateFormState,
  side: 'alis' | 'varis'
) {
  const tip = form[`${side}_contact_tipi`]
  const muhatabi = form[`${side}_muhatabi`]
  const telefon = form[`${side}_telefon`]
  const { firstName, lastName } = splitFullName(muhatabi)

  if (tip === 'kurumsal') {
    return {
      contactType,
      companyType: 'CORPORATE' as const,
      companyName: form[`${side}_firma_adi`].trim(),
      taxNumber: form[`${side}_vkn`].replace(/\D/g, ''),
      taxOffice: form[`${side}_vergi_dairesi`].trim(),
      firstName,
      lastName,
      phone: toE164Phone(telefon),
    }
  }

  return {
    contactType,
    companyType: 'INDIVIDUAL' as const,
    firstName,
    lastName,
    tckn: form[`${side}_tckn`].replace(/\D/g, ''),
    phone: toE164Phone(telefon),
  }
}

function buildAddressInput(
  title: string,
  fullAddress: string,
  lat: number | null,
  lon: number | null,
  no: string,
  floor: string,
  door: string,
  phone: string
) {
  const body: Record<string, unknown> = {
    title,
    fullAddress,
    phone: toE164Phone(phone),
  }
  if (typeof lat === 'number' && Number.isFinite(lat)) body.latitude = lat
  if (typeof lon === 'number' && Number.isFinite(lon)) body.longitude = lon
  if (no.trim()) body.no = no.trim()
  if (floor.trim()) body.floor = floor.trim()
  if (door.trim()) body.door = door.trim()
  return body
}

export class CreateOrderPayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreateOrderPayloadError'
  }
}

/**
 * Wizard form → POST /api/v1/last-mile-orders body.
 * Gel-Al create BE’de kapalı; burada engellenir.
 */
export function buildCreateOrderPayload(
  form: OrderCreateFormState,
  options?: { skillCatalog?: SkillCatalogItem[] }
): Record<string, unknown> {
  if (!form.siparis_tipi) {
    throw new CreateOrderPayloadError('Sipariş tipi seçimi zorunludur.')
  }
  if (!form.rota_tipi) {
    throw new CreateOrderPayloadError('Rota tipi seçimi zorunludur.')
  }
  if (form.siparis_tipi === 'gel_al') {
    throw new CreateOrderPayloadError(
      'Gel-Al sipariş oluşturma henüz desteklenmiyor. Backend müşteri-merkezli tasarım sonrası açılacak.'
    )
  }

  const config = getOrderTypeFieldConfig(form.siparis_tipi)
  const method = METHOD_MAP[form.rota_tipi]
  if (!method) {
    throw new CreateOrderPayloadError('Geçersiz rota tipi.')
  }

  const type = ORDER_TYPE_MAP[form.siparis_tipi]
  const payload: Record<string, unknown> = {
    method,
    type,
    sourceType: 'MANUAL',
    isSmsSendReceiver: form.bildirim_sms,
    isEmailSendReceiver: form.bildirim_email,
    requireProofOnComplete: form.teslimat_kaniti_zorunlu,
    secureDeliveryOtp: form.guvenli_teslimat_otp,
    items: form.paketler.map((item) => {
      const quantity = Number(item.adet)
      const row: Record<string, unknown> = {
        quantity: Number.isInteger(quantity) && quantity >= 1 ? quantity : 1,
        sizeClass: item.hacim_sinifi,
      }
      if (item.hacim.trim()) {
        const volume = Number(item.hacim.replace(',', '.'))
        if (Number.isFinite(volume)) {
          row.volume = volume
        }
      }
      if (item.agirlik_kg.trim()) {
        const kg = Number(item.agirlik_kg)
        if (Number.isFinite(kg)) row.kg = kg
      }
      return row
    }),
  }

  // Sipariş sahibi (UI müşteri dropdown)
  if (form.musteriId.trim()) {
    payload.orderOwner = form.musteriId.trim()
  }

  // Gönderici / alıcı müşteri yönü (sipariş tipine göre)
  if (form.siparis_tipi === 'toplama' || form.siparis_tipi === 'iade') {
    payload.receiverCustomerId = form.musteriId
  } else {
    payload.senderCustomerId = form.musteriId
  }

  if (form.referans_no.trim()) payload.referenceNo = form.referans_no.trim()
  if (form.kurye_notu.trim()) payload.note = form.kurye_notu.trim()

  const priority = Number(form.oncelik_puani)
  if (Number.isFinite(priority)) payload.priority = priority

  const serviceMinutes = Number(form.gorev_suresi_dk)
  if (Number.isFinite(serviceMinutes) && serviceMinutes > 0) {
    payload.serviceTimeSec = Math.round(serviceMinutes * 60)
  }

  const skills = filterImplicitSkillIds(
    mapRequirementsToSkillIds(form.gereksinimler, options?.skillCatalog)
  )
  if (skills.length > 0) payload.requiredSkills = skills

  const tags = mapTags(form.etiketler)
  if (tags.length > 0) payload.tags = tags

  const metadata = Object.fromEntries(
    form.meta_fields
      .filter((item) => item.key.trim())
      .map((item) => [item.key.trim(), item.value])
  )
  if (Object.keys(metadata).length > 0) payload.metadata = metadata

  const serviceDate = form.alim_tarih
  const pickupFrom = toIsoDateTime(serviceDate, form.alim_baslangic)
  const pickupTo = toIsoDateTime(serviceDate, form.alim_bitis)
  if (pickupFrom && pickupTo) {
    payload.scheduledPickupFrom = pickupFrom
    payload.scheduledPickupTo = pickupTo
  }

  const deliveryDate = form.teslim_tarih || serviceDate
  const deliveryFrom = toIsoDateTime(deliveryDate, form.teslim_baslangic)
  const deliveryTo = toIsoDateTime(deliveryDate, form.teslim_bitis)
  if (deliveryFrom && deliveryTo) {
    payload.scheduledDeliveryFrom = deliveryFrom
    payload.scheduledDeliveryTo = deliveryTo
  }

  // Alış
  if (config.alisMode === 'facility') {
    payload.fromCustomerAddressId = form.alis_tesis_id
  } else if (config.alisMode === 'address') {
    if (form.alis_lat == null || form.alis_lon == null || !form.alis_full_address.trim()) {
      throw new CreateOrderPayloadError(
        'Alış adresi için listeden seçim ve konum bilgisi zorunludur.'
      )
    }
    payload.senderContactInput = buildContactInput('SENDER', form, 'alis')
    payload.fromContactAddressInput = buildAddressInput(
      form.alis_adres_baslik.trim() || 'Alış',
      form.alis_full_address.trim() || form.alis_adres.trim(),
      form.alis_lat,
      form.alis_lon,
      form.alis_bina_no,
      form.alis_kat,
      form.alis_daire_no,
      form.alis_telefon
    )
  }

  // Varış
  if (config.varisMode === 'facility') {
    payload.toCustomerAddressId = form.varis_tesis_id
  } else if (config.varisMode === 'address') {
    if (form.varis_lat == null || form.varis_lon == null || !form.varis_full_address.trim()) {
      throw new CreateOrderPayloadError(
        'Varış adresi için listeden seçim ve konum bilgisi zorunludur.'
      )
    }
    payload.receiverContactInput = buildContactInput('RECEIVER', form, 'varis')
    payload.toContactAddressInput = buildAddressInput(
      form.varis_adres_baslik.trim() || 'Teslimat',
      form.varis_full_address.trim() || form.varis_adres.trim(),
      form.varis_lat,
      form.varis_lon,
      form.varis_bina_no,
      form.varis_kat,
      form.varis_daire_no,
      form.varis_telefon
    )
  }

  // Tesis tarafında muhatap create body’ye ayrı gitmez; customer-address’te saklı.
  // Facility mode’da karşı taraf serbest adres ise contact yukarıda set edildi.
  // Dağıtım: facility + address → senderCustomer + fromCustomerAddress + receiverContact + toAddress
  // Facility-only party contact: BE customer-address authorizedPerson kullanır.

  if (form.yakin_kuryelere_dagit) {
    payload.dispatchNearby = true
  } else if (form.aninda_sahaya_ilet && form.aktif_rota_id) {
    payload.instantRouteId = form.aktif_rota_id
    payload.dispatchNearby = false
  }

  return payload
}
