'use client'

import { FileText, FileUp, Shield } from 'lucide-react'
import {
  CourierDocumentUploadButton,
  CourierDocumentsList,
  useCourierDocumentsActions,
} from '../../_components/courier-documents-manager'
import type { CourierDocumentMeta, LastmileCourier } from '../../_types/courier'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

type Props = {
  courier: LastmileCourier
  onDocumentsChange: (documents: CourierDocumentMeta[]) => void
  readOnly?: boolean
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR')
}

export function TabDocuments({ courier, onDocumentsChange, readOnly = false }: Props) {
  const documentActions = useCourierDocumentsActions({
    driverId: courier.id,
    documents: courier.evraklar,
    onChange: onDocumentsChange,
  })

  return (
    <div className='grid gap-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={Shield} title='Yasal Belgeler' />
        <div className='px-4 py-3.5'>
          <SectionLabel>Belge Geçerlilik Tarihleri</SectionLabel>
          <div className='mt-1 divide-y divide-slate-100'>
            <InfoRow
              icon={Shield}
              label='Ehliyet Bitiş Tarihi'
              value={formatDate(courier.ehliyet_bitis)}
            />
            <InfoRow
              icon={Shield}
              label='SRC Belgesi Bitiş Tarihi'
              value={formatDate(courier.src_bitis)}
            />
            <InfoRow
              icon={FileText}
              label='Sağlık Raporu Bitiş Tarihi'
              value={formatDate(courier.saglik_bitis)}
            />
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader
          icon={FileUp}
          title='Yüklenen Yasal Belgeler'
          meta={
            readOnly ? null : (
              <CourierDocumentUploadButton
                fileInputRef={documentActions.fileInputRef}
                isUploading={documentActions.isUploading}
                onUpload={documentActions.handleUploadDocument}
              />
            )
          }
        />
        <div className='px-4 py-4'>
          <CourierDocumentsList
            driverId={courier.id}
            documents={courier.evraklar}
            onChange={onDocumentsChange}
            actions={documentActions}
            readOnly={readOnly}
          />
        </div>
      </section>
    </div>
  )
}
