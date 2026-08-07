'use client'

import { FileText, FileUp, Shield } from 'lucide-react'
import {
  useVehicleDocumentsActions,
  VehicleDocumentUploadButton,
  VehicleDocumentsList,
} from '../../_components/vehicle-documents-manager'
import type { LastmileVehicle, VehicleDocumentMeta } from '../../_types/vehicle'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

type Props = {
  vehicle: LastmileVehicle
  onDocumentsChange: (documents: VehicleDocumentMeta[]) => void
  readOnly?: boolean
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR')
}

export function TabDocuments({ vehicle, onDocumentsChange, readOnly = false }: Props) {
  const documentActions = useVehicleDocumentsActions({
    vehicleId: vehicle.id,
    documents: vehicle.evraklar,
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
              label='Muayene Bitiş Tarihi'
              value={formatDate(vehicle.muayene_bitis)}
            />
            <InfoRow
              icon={Shield}
              label='Trafik Sigortası Bitiş Tarihi'
              value={formatDate(vehicle.trafik_sigortasi_bitis)}
            />
            <InfoRow
              icon={FileText}
              label='Kasko Poliçe No'
              value={vehicle.kasko_police_no}
              mono
              copyable
            />
            <InfoRow
              icon={Shield}
              label='Kasko Bitiş Tarihi'
              value={formatDate(vehicle.kasko_bitis)}
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
              <VehicleDocumentUploadButton
                fileInputRef={documentActions.fileInputRef}
                isUploading={documentActions.isUploading}
                onUpload={documentActions.handleUploadDocument}
              />
            )
          }
        />
        <div className='px-4 py-4'>
          <VehicleDocumentsList
            vehicleId={vehicle.id}
            documents={vehicle.evraklar}
            onChange={onDocumentsChange}
            actions={documentActions}
            readOnly={readOnly}
          />
        </div>
      </section>
    </div>
  )
}
