'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react'
import { formatScopeRow, scopeRowKey } from '../_lib/operation-scope-helpers'
import type { OperationScopeRow } from '../_types/customer-detail'
import { InfoHint } from './info-hint'
import { OperationScopeRowModal } from './operation-scope-row-modal'

type Props = {
  title: string
  tooltip: string
  icon?: LucideIcon
  scopes: OperationScopeRow[]
  onChange: (scopes: OperationScopeRow[]) => void
  error?: string
  readOnly?: boolean
}

export function OperationScopeEditor({
  title,
  tooltip,
  icon: Icon,
  scopes,
  onChange,
  error,
  readOnly = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<OperationScopeRow | null>(null)

  const existingKeys = useMemo(() => {
    const keys = scopes.map((row) => scopeRowKey(row))
    if (!editingRow) return keys
    const editingKey = scopeRowKey(editingRow)
    return keys.filter((key) => key !== editingKey)
  }, [editingRow, scopes])

  function openCreate() {
    setEditingRow(null)
    setModalOpen(true)
  }

  function openEdit(row: OperationScopeRow) {
    setEditingRow(row)
    setModalOpen(true)
  }

  function handleSave(row: OperationScopeRow) {
    const exists = scopes.some((item) => item.id === row.id)
    onChange(
      exists ? scopes.map((item) => (item.id === row.id ? row : item)) : [...scopes, row]
    )
  }

  function handleDelete(id: string) {
    onChange(scopes.filter((item) => item.id !== id))
  }

  return (
    <div className='rounded-xl border border-slate-200 bg-white'>
      <div className='border-b border-slate-200 px-4 py-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2.5'>
            {Icon ? (
              <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                <Icon className='size-4' />
              </span>
            ) : null}
            <div className='flex min-w-0 items-center gap-1.5'>
              <p className='text-sm font-semibold text-slate-900'>{title}</p>
              <InfoHint label={title} content={tooltip} />
            </div>
          </div>
          {readOnly ? null : (
            <Button type='button' size='sm' variant='outline' className='h-8 shrink-0' onClick={openCreate}>
              <Plus className='mr-1.5 size-3.5' />
              Ekle
            </Button>
          )}
        </div>
      </div>

      {scopes.length === 0 ? (
        <div className='px-4 py-6 text-center text-sm text-slate-500'>
          {readOnly
            ? 'Tanımlı hizmet bölgesi yok.'
            : 'Henüz kapsam satırı yok. İl → ilçe → mahalle seçerek ekleyin.'}
        </div>
      ) : (
        <ul className='divide-y divide-slate-100'>
          {scopes.map((row) => (
            <li key={row.id} className='flex items-center gap-2 px-4 py-2.5'>
              <p className='min-w-0 flex-1 text-sm text-slate-700'>{formatScopeRow(row)}</p>
              {readOnly ? null : (
                <>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-8 shrink-0'
                    aria-label='Düzenle'
                    onClick={() => openEdit(row)}
                  >
                    <Pencil className='size-3.5' />
                  </Button>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-8 shrink-0 text-rose-600 hover:text-rose-700'
                    aria-label='Sil'
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? <p className='border-t border-slate-100 px-4 py-2 text-xs text-rose-600'>{error}</p> : null}

      <OperationScopeRowModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingRow}
        existingKeys={existingKeys}
        onSave={handleSave}
      />
    </div>
  )
}
