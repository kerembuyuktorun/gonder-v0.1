import {
  FINANCE_INVOICE_KIND_LABELS,
  formatMoneyTry,
  type FinanceInvoiceKind,
  type FinanceSettlementChannel,
  type PaymentMethod,
} from '../_types/finance'

type DebitNarrativeInput = {
  shipmentLabel?: string | null
  orderLabel?: string | null
  amountTry: number
  invoiceLabel?: string | null
  invoiceKind?: FinanceInvoiceKind | null
  settlement: FinanceSettlementChannel
}

export function debitNarrative(input: DebitNarrativeInput): string {
  const amount = formatMoneyTry(input.amountTry)
  const subject = input.shipmentLabel
    ? `${input.shipmentLabel} gönderisi${input.orderLabel ? ` (sipariş ${input.orderLabel})` : ''}`
    : input.orderLabel
      ? `${input.orderLabel} siparişi`
      : 'Bu işlem'

  const invoicePart = input.invoiceLabel
    ? input.invoiceKind === 'batch'
      ? ` Tutar ${input.invoiceLabel} toplu faturası içerisinde yer alıyor.`
      : ` Faturası ${input.invoiceLabel}.`
    : ''

  const settlePart =
    input.settlement === 'wallet' ? ' Cüzdanından çekildi.' : ' Carine yansıtıldı.'

  return `${subject} ile ${amount} borçlandın.${invoicePart}${settlePart}`
}

export function creditTopUpNarrative(amountTry: number, method: PaymentMethod | null): string {
  const via =
    method === 'card' ? 'kart ile' : method === 'transfer' ? 'havale / EFT ile' : 'ile'
  return `Cüzdanına ${via} ${formatMoneyTry(amountTry)} yüklendi.`
}

export function creditRefundNarrative(opts: {
  shipmentLabel?: string | null
  amountTry: number
}): string {
  const subject = opts.shipmentLabel ? `${opts.shipmentLabel} gönderisi` : 'İşlem'
  return `${subject} için ${formatMoneyTry(opts.amountTry)} iade edildi ve cüzdanına yazıldı.`
}

export function upcomingNarrative(opts: {
  invoiceLabel: string
  invoiceKind: FinanceInvoiceKind
  amountTry: number
  settlement: FinanceSettlementChannel
  shipmentLabel?: string | null
}): string {
  const kind = FINANCE_INVOICE_KIND_LABELS[opts.invoiceKind].toLocaleLowerCase('tr-TR')
  const related = opts.shipmentLabel ? ` ${opts.shipmentLabel} gönderisine ait` : ''
  const settle =
    opts.settlement === 'wallet'
      ? 'Cüzdan bakiyenle ödeyebilirsin.'
      : 'Açık hesap (cari) faturası; vadesinde ödenmesi bekleniyor.'
  return `${opts.invoiceLabel} ${kind}${related} için ${formatMoneyTry(opts.amountTry)} ödeme bekleniyor. ${settle}`
}
