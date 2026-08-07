'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronDown,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  createCustomerAddress,
  deleteCustomerAddress,
  patchCustomerAddressActive,
  updateCustomerAddress,
} from '../../_api/addresses'
import { countScopeDistricts } from '../_lib/operation-scope-helpers'
import { CustomerStatusBadge } from '../../_components/customer-status-badge'
import { AddressWizardModal } from './address-wizard-modal'
import type { CustomerAddress } from '../_types/customer-detail'

type Props = {
  customerId: string
  addresses: CustomerAddress[]
  onAddressesChange: (addresses: CustomerAddress[]) => void
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const national = digits.startsWith('90') ? digits.slice(2) : digits
  if (national.length === 10) {
    return `+90 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
  }
  return value
}

export function TabFacilities({ customerId, addresses, onAddressesChange }: Props) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editAddress, setEditAddress] = useState<CustomerAddress | null>(null)

  function openCreate() {
    setEditAddress(null)
    setWizardOpen(true)
  }

  function openEdit(address: CustomerAddress) {
    setEditAddress(address)
    setWizardOpen(true)
  }

  async function handleSaved(address: CustomerAddress) {
    const isEdit = Boolean(editAddress?.id)

    if (isEdit && editAddress) {
      const updated: CustomerAddress = { ...address, id: editAddress.id }
      const result = await updateCustomerAddress(customerId, updated)

      if (!result.success) {
        toast.error(result.error)
        throw new Error(result.error)
      }

      const nextAddress =
        result.data ??
        ({
          ...updated,
          operasyon_bolgesi_tanimli:
            updated.giden_teslimat_scopes.length > 0 ||
            updated.gelen_teslimat_scopes.length > 0,
        } satisfies CustomerAddress)

      onAddressesChange(
        addresses.map((item) => (item.id === editAddress.id ? nextAddress : item))
      )
      toast.success('Adres güncellendi')
      return
    }

    const { id: _pendingId, ...createBody } = address
    void _pendingId
    const result = await createCustomerAddress(customerId, createBody)
    if (!result.success) {
      toast.error(result.error)
      throw new Error(result.error)
    }

    onAddressesChange([...addresses, result.data])
    toast.success('Adres eklendi')
  }

  async function handleToggleActive(address: CustomerAddress) {
    const nextActive = !address.aktif
    const result = await patchCustomerAddressActive(customerId, address, nextActive)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    onAddressesChange(
      addresses.map((item) =>
        item.id === address.id ? (result.data ?? { ...address, aktif: nextActive }) : item
      )
    )
    toast.success(nextActive ? `${address.baslik} aktifleştirildi` : `${address.baslik} pasife alındı`)
  }

  async function handleDelete(address: CustomerAddress) {
    const confirmed = window.confirm(`“${address.baslik}” adresi silinsin mi?`)
    if (!confirmed) return

    const result = await deleteCustomerAddress(address.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    onAddressesChange(addresses.filter((item) => item.id !== address.id))
    toast.success(`${address.baslik} silindi`)
  }

  return (
    <>
      <Card className='rounded-2xl border-slate-200 shadow-none'>
        <CardContent>
          {addresses.length === 0 ? (
            <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center'>
              <p className='text-sm font-medium text-slate-700'>Henüz adres yok</p>
              <p className='mt-1 text-xs text-slate-500'>
                İlk adresi ekleyip operasyon bölgesini belirleyin.
              </p>
              <Button type='button' size='sm' className='mt-4' onClick={openCreate}>
                <Plus className='mr-2 size-4' />
                Adres Ekle
              </Button>
            </div>
          ) : (
            <div className='overflow-x-auto rounded-xl border border-slate-200'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50/80'>
                    <TableHead>Adres Başlığı</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Bina No</TableHead>
                    <TableHead>Kat No</TableHead>
                    <TableHead>Daire No</TableHead>
                    <TableHead>Muhatap Ad Soyad</TableHead>
                    <TableHead>Muhatap Telefonu</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className='w-40'>
                      <div className='flex justify-end'>
                        <Button type='button' size='sm' className='h-8' onClick={openCreate}>
                          <Plus className='mr-1.5 size-3.5' />
                          Adres Ekle
                        </Button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell className='font-medium text-slate-900'>
                        <div>
                          {address.baslik}
                          {!address.operasyon_bolgesi_tanimli ? (
                            <p className='mt-0.5 text-[11px] font-normal text-amber-600'>
                              Operasyon bölgesi tanımsız
                            </p>
                          ) : (
                            <p className='mt-0.5 text-[11px] font-normal text-slate-400'>
                              Giden {countScopeDistricts(address.giden_teslimat_scopes)} ilçe
                              {address.gelen_teslimat_scopes.length > 0
                                ? ` · Gelen ${countScopeDistricts(address.gelen_teslimat_scopes)} ilçe`
                                : ''}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[220px] truncate' title={address.adres}>
                        {address.adres}
                      </TableCell>
                      <TableCell>{address.bina_no}</TableCell>
                      <TableCell>{address.kat_no}</TableCell>
                      <TableCell>{address.daire_no}</TableCell>
                      <TableCell>{address.muhatap_ad_soyad}</TableCell>
                      <TableCell className='whitespace-nowrap'>
                        {formatPhone(address.muhatap_telefon)}
                      </TableCell>
                      <TableCell>
                        <CustomerStatusBadge status={address.aktif ? 'aktif' : 'pasif'} />
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium'
                              >
                                İşlemler
                                <ChevronDown className='ml-1 size-3.5' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-52'>
                              <DropdownMenuLabel className='truncate'>
                                {address.baslik}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openEdit(address)}>
                                <Pencil className='mr-2 size-4' />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={
                                  address.aktif
                                    ? 'text-amber-700 focus:text-amber-700'
                                    : 'text-emerald-700 focus:text-emerald-700'
                                }
                                onSelect={() => {
                                  void handleToggleActive(address)
                                }}
                              >
                                {address.aktif ? (
                                  <>
                                    <PauseCircle className='mr-2 size-4' />
                                    Pasife Al
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className='mr-2 size-4' />
                                    Aktifleştir
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-rose-700 focus:text-rose-700'
                                onSelect={() => {
                                  void handleDelete(address)
                                }}
                              >
                                <Trash2 className='mr-2 size-4' />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddressWizardModal
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open)
          if (!open) setEditAddress(null)
        }}
        editAddress={editAddress}
        onSaved={handleSaved}
      />
    </>
  )
}
