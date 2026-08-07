'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PIECE_TYPE_OPTIONS,
  calcPieceDesi,
  calcPiecesTotals,
  createPieceId,
  type DraftPiece,
} from '../_types/price-calculation'

type DraftForm = {
  type: string
  widthCm: string
  lengthCm: string
  heightCm: string
  quantity: string
  desi: string
  weightKg: string
}

const EMPTY_FORM: DraftForm = {
  type: 'Paket',
  widthCm: '',
  lengthCm: '',
  heightCm: '',
  quantity: '1',
  desi: '',
  weightKg: '',
}

type Props = {
  pieces: DraftPiece[]
  onAdd: (piece: DraftPiece) => void
  onRemove: (pieceId: string) => void
  invalid?: boolean
  showLogisticsHint?: boolean
  onSwitchToLogistics?: () => void
}

export function PieceListEditor({
  pieces,
  onAdd,
  onRemove,
  invalid,
  showLogisticsHint,
  onSwitchToLogistics,
}: Props) {
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM)
  const totals = useMemo(() => calcPiecesTotals(pieces), [pieces])

  function updateField<K extends keyof DraftForm>(key: K, value: DraftForm[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'widthCm' || key === 'lengthCm' || key === 'heightCm') {
        const autoDesi = calcPieceDesi(
          Number(key === 'widthCm' ? value : next.widthCm) || 0,
          Number(key === 'lengthCm' ? value : next.lengthCm) || 0,
          Number(key === 'heightCm' ? value : next.heightCm) || 0
        )
        next.desi = autoDesi > 0 ? String(autoDesi) : ''
      }
      return next
    })
  }

  function handleAdd() {
    const widthCm = Number(form.widthCm) || 0
    const lengthCm = Number(form.lengthCm) || 0
    const heightCm = Number(form.heightCm) || 0
    const quantity = Math.max(1, Number(form.quantity) || 1)
    const weightKg = Number(form.weightKg) || 0
    const desi = Number(form.desi) || calcPieceDesi(widthCm, lengthCm, heightCm)

    if (!form.type.trim() || widthCm <= 0 || lengthCm <= 0 || heightCm <= 0 || weightKg <= 0) {
      return
    }

    onAdd({
      id: createPieceId(),
      type: form.type.trim(),
      widthCm,
      lengthCm,
      heightCm,
      quantity,
      desi,
      weightKg,
    })
    setForm({ ...EMPTY_FORM, type: form.type })
  }

  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
        <CardTitle className='text-sm font-semibold'>Parça listesi</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 px-3 pb-3 pt-0'>
        <div className='rounded-xl border bg-muted/10 p-2'>
          <div className='grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.1fr)_repeat(6,minmax(0,0.7fr))_auto]'>
            <div className='col-span-2 space-y-1 sm:col-span-1 lg:col-span-1'>
              <Label className='text-[11px] text-muted-foreground'>Parça tipi</Label>
              <Select value={form.type} onValueChange={(value) => updateField('type', value)}>
                <SelectTrigger className='h-9'>
                  <SelectValue placeholder='Tip seçin' />
                </SelectTrigger>
                <SelectContent>
                  {PIECE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(
              [
                ['widthCm', 'En'],
                ['lengthCm', 'Boy'],
                ['heightCm', 'Yükseklik'],
                ['quantity', 'Adet'],
                ['desi', 'Desi'],
                ['weightKg', 'Kg'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className='min-w-0 space-y-1'>
                <Label className='text-[11px] text-muted-foreground'>{label}</Label>
                <Input
                  type='number'
                  min={key === 'quantity' ? 1 : 0}
                  step={key === 'quantity' ? 1 : 0.1}
                  className='h-9'
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </div>
            ))}

            <div className='col-span-2 flex items-end sm:col-span-3 lg:col-span-1'>
              <Button type='button' className='h-9 w-full gap-1 px-3' onClick={handleAdd}>
                <Plus className='size-3.5' />
                Ekle
              </Button>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto rounded-xl border'>
          <table className='w-full min-w-[720px] text-left text-sm'>
            <thead className='border-b bg-muted/30 text-[11px] text-muted-foreground'>
              <tr>
                <th className='px-3 py-2 font-medium'>Tür</th>
                <th className='px-3 py-2 font-medium'>Ölçü</th>
                <th className='px-3 py-2 font-medium'>Adet</th>
                <th className='px-3 py-2 font-medium'>Desi</th>
                <th className='px-3 py-2 font-medium'>Toplam desi</th>
                <th className='px-3 py-2 font-medium'>Kg</th>
                <th className='px-3 py-2 font-medium'>Toplam kg</th>
                <th className='px-3 py-2 font-medium' />
              </tr>
            </thead>
            <tbody className='divide-y'>
              {pieces.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-3 py-5 text-center text-xs text-muted-foreground'>
                    Henüz parça eklenmedi
                  </td>
                </tr>
              ) : (
                pieces.map((piece) => (
                  <tr key={piece.id}>
                    <td className='px-3 py-2 font-medium'>{piece.type}</td>
                    <td className='px-3 py-2 text-muted-foreground'>
                      {piece.widthCm}×{piece.lengthCm}×{piece.heightCm}
                    </td>
                    <td className='px-3 py-2'>{piece.quantity}</td>
                    <td className='px-3 py-2'>{piece.desi}</td>
                    <td className='px-3 py-2'>{Math.round(piece.desi * piece.quantity * 100) / 100}</td>
                    <td className='px-3 py-2'>{piece.weightKg}</td>
                    <td className='px-3 py-2'>
                      {Math.round(piece.weightKg * piece.quantity * 100) / 100}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 text-muted-foreground hover:text-destructive'
                        onClick={() => onRemove(piece.id)}
                        aria-label='Parçayı sil'
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pieces.length > 0 ? (
          <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
            <span>
              Toplam adet: <strong className='text-foreground'>{totals.quantity}</strong>
            </span>
            <span>
              Toplam desi:{' '}
              <strong className='text-foreground'>{Math.round(totals.desi * 100) / 100}</strong>
            </span>
            <span>
              Toplam kg:{' '}
              <strong className='text-foreground'>{Math.round(totals.weightKg * 100) / 100}</strong>
            </span>
          </div>
        ) : null}

        {invalid && pieces.length === 0 ? (
          <p className='text-[11px] text-destructive'>En az bir parça ekleyin</p>
        ) : null}

        {showLogisticsHint ? (
          <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-sm text-amber-700'>
            Desi 30’dan büyük. Lojistik operasyonuna geçmek daha uygun olabilir.
            {onSwitchToLogistics ? (
              <Button
                type='button'
                variant='link'
                className='ml-1 h-auto p-0 text-amber-800'
                onClick={onSwitchToLogistics}
              >
                Lojistik’e geç
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
