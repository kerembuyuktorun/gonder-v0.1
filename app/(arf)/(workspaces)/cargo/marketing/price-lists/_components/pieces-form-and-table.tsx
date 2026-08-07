'use client'

import { type ChangeEvent, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import type { SimulationLookups } from '../_types'

export interface PieceRow {
  id: string
  pieceType: "koli" | "zarf" | "palet"
  length: number
  width: number
  height: number
  kg: number
  quantity: number
  desi: number
}

interface Props {
  lookups: SimulationLookups
  pieceRows: PieceRow[]
  pieceForm: {
    pieceType: string
    length: string
    width: string
    height: string
    kg: string
    quantity: string
    desi: string
  }
  onPieceFormChange: (field: string, value: string) => void
  onAddPiece: () => void
  onRemovePiece: (id: string) => void
}

const numericHeadClass = 'text-right'
const numericCellClass = 'text-right'

export function PiecesFormAndTable({
  lookups,
  pieceRows,
  pieceForm,
  onPieceFormChange,
  onAddPiece,
  onRemovePiece,
}: Props) {
  const pieceColumns = useMemo<ColumnDef<PieceRow>[]>(
    () => [
      {
        accessorKey: 'pieceType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tür" enableSearch={false} />,
      },
      {
        accessorKey: 'length',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="En" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('length') as number}</span>,
      },
      {
        accessorKey: 'width',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Boy" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('width') as number}</span>,
      },
      {
        accessorKey: 'height',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Yükseklik" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('height') as number}</span>,
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Adet" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('quantity') as number}</span>,
      },
      {
        accessorKey: 'desi',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Desi" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('desi') as number}</span>,
      },
      {
        accessorKey: 'kg',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kg" className={numericHeadClass} enableSearch={false} />
        ),
        cell: ({ row }) => <span className={numericCellClass}>{row.getValue('kg') as number}</span>,
      },
      {
        id: 'actions',
        header: 'İşlemler',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onRemovePiece(row.original.id)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onRemovePiece],
  )

  const totalDesi = useMemo(
    () => pieceRows.reduce((sum, piece) => sum + piece.quantity * piece.desi, 0),
    [pieceRows],
  )

  return (
    <div className="space-y-5">
      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="grid gap-3 xl:grid-cols-8">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Parça Tipi</Label>
            <Select value={pieceForm.pieceType} onValueChange={(value: string) => onPieceFormChange('pieceType', value)}>
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm">
                <SelectValue placeholder="Parça Tipi" />
              </SelectTrigger>
              <SelectContent>
                {lookups.pieceTypeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">En</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={pieceForm.length}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('length', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Boy</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={pieceForm.width}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('width', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Yükseklik</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={pieceForm.height}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('height', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Adet</Label>
            <Input
              type="number"
              min={1}
              value={pieceForm.quantity}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('quantity', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Desi</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={pieceForm.desi}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('desi', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Kg</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={pieceForm.kg}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onPieceFormChange('kg', event.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-transparent">Aksiyon</Label>
            <Button onClick={onAddPiece} className="h-11 rounded-2xl px-5 text-sm font-semibold w-full">
              Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={pieceRows}
        columns={pieceColumns}
        enablePagination={false}
        enableGlobalFilter={false}
        enableColumnVisibility={false}
        enableHorizontalScroll
        emptyMessage="Henüz parça eklenmedi."
        className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
      />

      {/* Toplam Desi */}
      {pieceRows.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Toplam Desi: <strong>{totalDesi.toFixed(2)}</strong>
        </div>
      )}
    </div>
  )
}
