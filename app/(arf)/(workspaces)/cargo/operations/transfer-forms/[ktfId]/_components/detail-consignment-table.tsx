"use client"

import { useMemo, useRef, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getConsignmentColumns } from "../_columns/consignment-columns"
import type { ConsignmentItem } from "../_types/detail"
import { BarcodeInputSection } from "./barcode-input-section"

interface Props {
  consignments: ConsignmentItem[]
  isKtfClosed: boolean
  onRemove: (cargoId: string) => Promise<void>
  ktfId: string
  onCargoFound: (cargoId: string) => Promise<void>
}

export function DetailConsignmentTable({ consignments, isKtfClosed, onRemove, ktfId, onCargoFound }: Props) {
  const [table, setTable] = useState<TanStackTable<ConsignmentItem> | null>(null)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showBarcodeInput, setShowBarcodeInput] = useState(false)
  const barcodeWrapperRef = useRef<HTMLDivElement>(null)

  const columns = useMemo(
    () =>
      getConsignmentColumns({
        isKtfClosed,
        onRemove: (cargoId: string) => setRemoveTarget(cargoId),
      }),
    [isKtfClosed],
  )

  async function handleConfirmRemove() {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      await onRemove(removeTarget)
    } finally {
      setIsRemoving(false)
      setRemoveTarget(null)
    }
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardContent className="space-y-4 pt-2">
          {!isKtfClosed && (
            <div className="flex flex-col gap-3">
              <div>
                <Button
                  size="sm"
                  variant={showBarcodeInput ? "secondary" : "default"}
                  className="h-9 rounded-xl px-4 text-sm"
                  onClick={() => {
                    setShowBarcodeInput((prev) => !prev)
                    if (!showBarcodeInput) {
                      setTimeout(() => {
                        barcodeWrapperRef.current?.querySelector<HTMLInputElement>("input")?.focus()
                      }, 80)
                    }
                  }}
                >
                  {showBarcodeInput ? "Barkod Girişini Kapat" : "Zimmete Al"}
                </Button>
              </div>
              {showBarcodeInput && (
                <div ref={barcodeWrapperRef} className="sm:max-w-xl">
                  <BarcodeInputSection ktfId={ktfId} isKtfClosed={isKtfClosed} onCargoFound={onCargoFound} />
                </div>
              )}
            </div>
          )}

          <DataTable
            data={consignments}
            columns={columns}
            enablePagination
            enableSorting
            enableColumnVisibility
            onTableReady={setTable}
            enableGlobalFilter
            enableHorizontalScroll
            stickyFirstColumn
            stickyLastColumn
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Henüz zimmetlenmiş parça bulunmuyor."
          />

          {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[10, 20, 50]} totalRows={consignments.length} />}
        </CardContent>
      </Card>

      {/* Zimmetten Çıkar Onay */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open: boolean) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zimmetten Çıkar</AlertDialogTitle>
            <AlertDialogDescription>Bu parçayı zimmetinden çıkarmak istiyor musunuz?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} disabled={isRemoving}>
              Evet, Çıkar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
