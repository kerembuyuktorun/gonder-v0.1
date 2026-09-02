'use client'

import { Badge } from '@/components/ui/badge'
import {
  FINANCE_INVOICE_KIND_LABELS,
  FINANCE_INVOICE_STATUS_BADGE,
  FINANCE_INVOICE_STATUS_LABELS,
  FINANCE_SETTLEMENT_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  type FinanceInvoiceKind,
  type FinanceInvoiceStatus,
  type FinanceSettlementChannel,
  type PaymentStatus,
} from '../../_types/finance'

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant='outline' className={PAYMENT_STATUS_BADGE[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

export function InvoiceStatusBadge({ status }: { status: FinanceInvoiceStatus }) {
  return (
    <Badge variant='outline' className={FINANCE_INVOICE_STATUS_BADGE[status]}>
      {FINANCE_INVOICE_STATUS_LABELS[status]}
    </Badge>
  )
}

export function SettlementBadge({
  settlement,
}: {
  settlement: FinanceSettlementChannel | null | undefined
}) {
  if (!settlement) return <span className='text-muted-foreground'>—</span>
  return (
    <Badge variant='secondary' className='font-normal'>
      {FINANCE_SETTLEMENT_LABELS[settlement]}
    </Badge>
  )
}

export function InvoiceKindBadge({ kind }: { kind: FinanceInvoiceKind | null | undefined }) {
  if (!kind) return null
  return (
    <Badge variant='outline' className='font-normal'>
      {FINANCE_INVOICE_KIND_LABELS[kind]}
    </Badge>
  )
}
