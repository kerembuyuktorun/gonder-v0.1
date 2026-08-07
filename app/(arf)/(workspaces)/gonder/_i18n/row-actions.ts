/**
 * Satır aksiyonları için hafif i18n.
 * next-intl yok; ortak sözlük + t() ile labelKey çözülür.
 */

export type RowActionLocale = 'tr' | 'en'

const messages = {
  tr: {
    'actions.more': 'Daha fazla',
    'actions.cancel': 'Vazgeç',
    'actions.confirm': 'Onayla',

    'orders.inspect': 'İncele',
    'orders.approve': 'Onayla',
    'orders.reject': 'Reddet',
    'orders.createShipment': 'Kargo oluştur',
    'orders.createShipmentShort': 'Kargo',
    'orders.getQuote': 'Teklif al',
    'orders.pay': 'Ödemeye geç',
    'orders.openShipment': 'Gönderiyi aç',
    'orders.rejectConfirmTitle': 'Siparişi reddet',
    'orders.rejectConfirmDescription': 'Bu sipariş reddedilecek. Devam etmek istiyor musunuz?',
    'orders.rejectConfirmAction': 'Reddet',

    'shipments.inspect': 'İncele',
    'shipments.printLabel': 'Etiket yazdır',
    'shipments.printLabelShort': 'Etiket',
    'shipments.track': 'Takip et',
    'shipments.deliver': 'Teslim et',
    'shipments.markPickedUp': 'Teslim al',
    'shipments.notify': 'Bilgilendir',
    'shipments.reportIssue': 'Sorun bildir',
    'shipments.downloadDoc': 'Belge indir',

    'quotes.viewOffers': 'Teklifleri gör',
    'quotes.viewOffersShort': 'Teklifler',
    'quotes.selectOffer': 'Teklifi seç',
    'quotes.cancelRequest': 'Talebi iptal et',
    'quotes.rerequest': 'Yeniden talep et',
    'quotes.rerequestShort': 'Yeniden',
    'quotes.cancelConfirmTitle': 'Talebi iptal et',
    'quotes.cancelConfirmDescription': 'Teklif talebi iptal edilecek. Devam etmek istiyor musunuz?',
    'quotes.cancelConfirmAction': 'İptal et',

    'returns.inspect': 'İncele',
    'returns.approve': 'Onayla',
    'returns.reject': 'Reddet',
    'returns.printLabel': 'Etiket yazdır',
    'returns.printLabelShort': 'Etiket',
    'returns.complete': 'İadeyi tamamla',
    'returns.completeShort': 'Tamamla',
    'returns.handover': 'Teslim noktası',
    'returns.handoverShort': 'Teslim',
    'returns.rejectConfirmTitle': 'İadeyi reddet',
    'returns.rejectConfirmDescription': 'Bu iade talebi reddedilecek. Devam etmek istiyor musunuz?',
    'returns.rejectConfirmAction': 'Reddet',

    'desi.inspect': 'İncele',
    'desi.accept': 'Kabul et',
    'desi.dispute': 'İtiraz et',
    'desi.attachDoc': 'Belge ekle',
    'desi.acceptCharge': 'Ücreti kabul',
    'desi.acceptChargeShort': 'Kabul',
    'desi.waiveCharge': 'Ücreti feragat',
    'desi.waiveChargeShort': 'Feragat',
    'desi.notify': 'Bilgilendir',

    'excel.edit': 'Düzenle',
    'excel.validate': 'Doğrula',
    'excel.approve': 'Onayla',
    'excel.skip': 'Satırı atla',
    'excel.skipShort': 'Atla',
    'excel.inspect': 'İncele',
  },
  en: {
    'actions.more': 'More',
    'actions.cancel': 'Cancel',
    'actions.confirm': 'Confirm',

    'orders.inspect': 'Inspect',
    'orders.approve': 'Approve',
    'orders.reject': 'Reject',
    'orders.createShipment': 'Create shipment',
    'orders.createShipmentShort': 'Ship',
    'orders.getQuote': 'Get quote',
    'orders.pay': 'Pay now',
    'orders.openShipment': 'Open shipment',
    'orders.rejectConfirmTitle': 'Reject order',
    'orders.rejectConfirmDescription': 'This order will be rejected. Continue?',
    'orders.rejectConfirmAction': 'Reject',

    'shipments.inspect': 'Inspect',
    'shipments.printLabel': 'Print label',
    'shipments.printLabelShort': 'Label',
    'shipments.track': 'Track',
    'shipments.deliver': 'Deliver',
    'shipments.markPickedUp': 'Pick up',
    'shipments.notify': 'Notify',
    'shipments.reportIssue': 'Report issue',
    'shipments.downloadDoc': 'Download',

    'quotes.viewOffers': 'View quotes',
    'quotes.viewOffersShort': 'Quotes',
    'quotes.selectOffer': 'Select quote',
    'quotes.cancelRequest': 'Cancel request',
    'quotes.rerequest': 'Request again',
    'quotes.rerequestShort': 'Retry',
    'quotes.cancelConfirmTitle': 'Cancel request',
    'quotes.cancelConfirmDescription': 'This quote request will be cancelled. Continue?',
    'quotes.cancelConfirmAction': 'Cancel',

    'returns.inspect': 'Inspect',
    'returns.approve': 'Approve',
    'returns.reject': 'Reject',
    'returns.printLabel': 'Print label',
    'returns.printLabelShort': 'Label',
    'returns.complete': 'Complete return',
    'returns.completeShort': 'Complete',
    'returns.handover': 'Handover point',
    'returns.handoverShort': 'Handover',
    'returns.rejectConfirmTitle': 'Reject return',
    'returns.rejectConfirmDescription': 'This return request will be rejected. Continue?',
    'returns.rejectConfirmAction': 'Reject',

    'desi.inspect': 'Inspect',
    'desi.accept': 'Accept',
    'desi.dispute': 'Dispute',
    'desi.attachDoc': 'Attach file',
    'desi.acceptCharge': 'Accept charge',
    'desi.acceptChargeShort': 'Accept',
    'desi.waiveCharge': 'Waive charge',
    'desi.waiveChargeShort': 'Waive',
    'desi.notify': 'Notify',

    'excel.edit': 'Edit',
    'excel.validate': 'Validate',
    'excel.approve': 'Approve',
    'excel.skip': 'Skip row',
    'excel.skipShort': 'Skip',
    'excel.inspect': 'Inspect',
  },
} as const

export type RowActionMessageKey = keyof (typeof messages)['tr']

let activeLocale: RowActionLocale = 'tr'

export function setRowActionLocale(locale: RowActionLocale) {
  activeLocale = locale
}

export function getRowActionLocale(): RowActionLocale {
  return activeLocale
}

export function tRowAction(key: string, fallback?: string): string {
  const dict = messages[activeLocale] ?? messages.tr
  const value = (dict as Record<string, string>)[key]
  if (value) return value
  const trFallback = (messages.tr as Record<string, string>)[key]
  return trFallback ?? fallback ?? key
}
