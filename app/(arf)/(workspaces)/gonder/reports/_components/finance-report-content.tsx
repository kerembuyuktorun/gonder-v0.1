'use client'

import { ReportsShell } from './reports-shell'
import { ReportPlannedState } from './report-planned-state'

export function FinanceReportContent() {
  return (
    <ReportsShell
      slug='finance'
      title='Finans'
      description='Fatura, ödeme ve kargo fatura audit (planlı)'
      showDateRange={false}
    >
      <ReportPlannedState
        title='Finans analitiği sonraki dilimde'
        description='Sifted tarzı parcel invoice audit, fatura–gönderi eşleştirme ve ödeme yaşlandırma burada toplanacak.'
        roadmap={[
          'Fatura satırı ↔ gönderi eşleştirme',
          'Beklenmeyen ek ücret / accessorial audit',
          'Ödeme ve cüzdan yaşlandırma',
        ]}
      />
    </ReportsShell>
  )
}
