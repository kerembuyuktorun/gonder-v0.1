"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import type { PriceRuleRow } from "../../_types"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatUnit(value: PriceRuleRow["unitType"]): string {
  if (value === "kg") {
    return "Kg"
  }

  return "Desi"
}

function formatShipmentType(value: PriceRuleRow["shipmentType"]): string {
  if (value === "koli") {
    return "Koli"
  }
  if (value === "zarf") {
    return "Zarf"
  }

  return "Palet"
}

export function getRulesColumns(): ColumnDef<PriceRuleRow>[] {
  return [
    {
      accessorKey: "unitType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Birim" />,
      cell: ({ row }) => formatUnit(row.original.unitType),
    },
    {
      accessorKey: "shipmentType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderi Tipi" />,
      cell: ({ row }) => formatShipmentType(row.original.shipmentType),
    },
    {
      accessorKey: "regionLabel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mesafe" />,
    },
    {
      id: "range",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Başlangıç - Bitiş" />,
      cell: ({ row }) => `${row.original.rangeStart.toFixed(2)} - ${row.original.rangeEnd.toFixed(2)}`,
    },
    {
      accessorKey: "basePrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fiyat (TL)" />,
      cell: ({ row }) => formatCurrency(row.original.basePrice),
    },
    {
      accessorKey: "incrementalPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="+ Fiyat Dinamik" />,
      cell: ({ row }) => {
        const value = row.original.incrementalPrice
        return value > 0 ? formatCurrency(value) : "-"
      },
    },
  ]
}
