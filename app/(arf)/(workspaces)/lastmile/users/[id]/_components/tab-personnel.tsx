'use client'

import {
  Briefcase,
  CalendarDays,
  Droplets,
  FileUp,
  GraduationCap,
  Hash,
  HeartHandshake,
  ContactRound,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react'
import {
  UserDocumentUploadButton,
  UserDocumentsList,
  useUserDocumentsActions,
} from '../../_components/user-documents-manager'
import {
  USER_GENDER_LABELS,
  USER_MARITAL_STATUS_LABELS,
  formatTckn,
  formatUserDate,
} from '../../_lib/query-users'
import type { LastmileUser, UserDocumentMeta } from '../../_types/user'
import { InfoRow, PanelHeader, SectionLabel } from './detail-panels'

type Props = {
  user: LastmileUser
  onDocumentsChange: (documents: UserDocumentMeta[]) => void
  readOnly?: boolean
}

export function TabPersonnel({ user, onDocumentsChange, readOnly = false }: Props) {
  const personel = user.personel
  const documentActions = useUserDocumentsActions({
    documents: user.evraklar,
    onChange: onDocumentsChange,
    uploadedBy: 'Operasyon Ekibi',
  })

  return (
    <div className='grid gap-4'>
      <div className='grid gap-4 lg:grid-cols-2'>
        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          <PanelHeader icon={ContactRound} title='Kimlik Bilgileri' />
          <div className='px-4 py-3.5'>
            <div className='divide-y divide-slate-100'>
              <InfoRow
                icon={Hash}
                label='TCKN'
                value={formatTckn(personel.tckn)}
                mono
                copyable={Boolean(personel.tckn)}
              />
              <InfoRow
                icon={CalendarDays}
                label='Doğum Tarihi'
                value={formatUserDate(personel.dogum_tarihi)}
              />
              <InfoRow
                icon={UserRound}
                label='Cinsiyet'
                value={
                  personel.cinsiyet ? USER_GENDER_LABELS[personel.cinsiyet] : null
                }
              />
              <InfoRow
                icon={HeartHandshake}
                label='Medeni Hal'
                value={
                  personel.medeni_hal
                    ? USER_MARITAL_STATUS_LABELS[personel.medeni_hal]
                    : null
                }
              />
              <InfoRow
                icon={Droplets}
                label='Kan Grubu'
                value={personel.kan_grubu}
              />
              <InfoRow
                icon={GraduationCap}
                label='Eğitim Durumu'
                value={personel.egitim_durumu}
              />
            </div>
          </div>
        </section>

        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          <PanelHeader icon={Briefcase} title='İstihdam, İkamet ve Acil İletişim' />
          <div className='space-y-4 px-4 py-3.5'>
            <div>
              <SectionLabel>İstihdam</SectionLabel>
              <div className='mt-1 divide-y divide-slate-100'>
                <InfoRow
                  icon={CalendarDays}
                  label='İşe Giriş'
                  value={formatUserDate(personel.ise_giris_tarihi)}
                />
              </div>
            </div>
            <div className='border-t border-slate-100 pt-4'>
              <SectionLabel>İkamet Adresi</SectionLabel>
              <div className='mt-1 divide-y divide-slate-100'>
                <InfoRow
                  icon={MapPin}
                  label='Adres'
                  value={personel.ikamet_adresi}
                  copyable={Boolean(personel.ikamet_adresi)}
                />
              </div>
            </div>
            <div className='border-t border-slate-100 pt-4'>
              <SectionLabel>Acil Durum</SectionLabel>
              <div className='mt-1 divide-y divide-slate-100'>
                <InfoRow
                  icon={UserRound}
                  label='Kişi'
                  value={personel.acil_kisi}
                />
                <InfoRow
                  icon={Phone}
                  label='Telefon'
                  value={personel.acil_telefon}
                  copyable={Boolean(personel.acil_telefon)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader
          icon={FileUp}
          title='Personel Evrakları'
          meta={
            readOnly ? null : (
              <UserDocumentUploadButton
                fileInputRef={documentActions.fileInputRef}
                isUploading={documentActions.isUploading}
                onUpload={documentActions.handleUploadDocument}
              />
            )
          }
        />
        <div className='px-4 py-4'>
          <UserDocumentsList
            documents={user.evraklar}
            actions={documentActions}
            readOnly={readOnly}
          />
        </div>
      </section>
    </div>
  )
}
