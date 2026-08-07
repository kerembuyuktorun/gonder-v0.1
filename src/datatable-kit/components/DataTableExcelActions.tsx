'use client'

/**
 * DataTableExcelActions - Excel Import/Export Actions
 * 
 * Buttons for Excel import and export functionality
 */

import React from 'react'
import { Download, Upload } from 'lucide-react'
import { Table as TanStackTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  exportToExcel,
  importFromExcel,
  validateExcelFile,
  type ExcelImportSecurityOptions,
} from '../utils/excel'
import { kitLogger } from '../../_shared/logger'
import { toast } from 'sonner'

export interface DataTableExcelActionsProps<TData> {
  table: TanStackTable<TData>
  /** Filename for export (without extension) */
  filename?: string
  /** Export only selected rows */
  exportSelected?: boolean
  /** Enable import functionality */
  enableImport?: boolean
  /** Callback after successful import */
  onImport?: (data: TData[]) => void
  /** Custom export button text */
  exportLabel?: string
  /** Custom import button text */
  importLabel?: string
  /** Excel import security controls */
  excelSecurity?: ExcelImportSecurityOptions
  /** Ask user confirmation for trusted source import */
  requireTrustedSourceConfirmation?: boolean
  /** Confirmation prompt override */
  trustedSourceConfirmationMessage?: string
  /** Optional className for export button */
  exportButtonClassName?: string
}

export function DataTableExcelActions<TData>({
  table,
  filename = 'export',
  exportSelected = false,
  enableImport = false,
  onImport,
  exportLabel = 'Export',
  importLabel = 'Import',
  excelSecurity,
  requireTrustedSourceConfirmation = true,
  trustedSourceConfirmationMessage =
    'Only import this file if you trust its source. Do you want to continue?',
  exportButtonClassName,
}: DataTableExcelActionsProps<TData>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const allowedExtensions = React.useMemo(() => {
    if (excelSecurity?.allowedExtensions?.length) {
      return excelSecurity.allowLegacyXls
        ? Array.from(new Set([...excelSecurity.allowedExtensions, '.xls']))
        : excelSecurity.allowedExtensions
    }

    return excelSecurity?.allowLegacyXls ? ['.xlsx', '.csv', '.xls'] : ['.xlsx', '.csv']
  }, [excelSecurity])

  // Handle Excel export
  const handleExport = () => {
    try {
      // Get data to export
      let dataToExport: TData[]
      
      if (exportSelected) {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
          toast.error('No rows selected for export')
          return
        }
        dataToExport = selectedRows.map((row) => row.original)
      } else {
        // Export filtered data (respects current filters/search)
        dataToExport = table.getFilteredRowModel().rows.map((row) => row.original)
      }

      if (dataToExport.length === 0) {
        toast.error('No data to export')
        return
      }

      // Get visible columns
      const visibleColumns = table.getAllColumns().filter((col) => col.getIsVisible())

      // Export to Excel
      exportToExcel(dataToExport, {
        filename,
        sheetName: 'Data',
        includeHeaders: true,
        columns: visibleColumns.map((col) => col.columnDef),
      })

      toast.success(
        `Exported ${dataToExport.length} row${dataToExport.length > 1 ? 's' : ''} to Excel`
      )
    } catch (error) {
      kitLogger.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  // Handle Excel import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Validate file
      const validation = await validateExcelFile(file, {
        maxSizeBytes: excelSecurity?.maxSizeBytes ?? 10 * 1024 * 1024,
        allowedExtensions,
        allowedMimeTypes: excelSecurity?.allowedMimeTypes,
        allowLegacyXls: excelSecurity?.allowLegacyXls,
      })

      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file')
        return
      }

      if (validation.warning) {
        toast.warning(validation.warning)
      }

      if (requireTrustedSourceConfirmation && !window.confirm(trustedSourceConfirmationMessage)) {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Import data
      const importedData = await importFromExcel<TData>(file, {
        skipRows: 0,
        maxRows: excelSecurity?.maxRows,
        maxColumns: excelSecurity?.maxColumns,
      })

      if (importedData.length === 0) {
        toast.error('No data found in file')
        return
      }

      // Call parent callback
      onImport?.(importedData)

      toast.success(
        `Imported ${importedData.length} row${importedData.length > 1 ? 's' : ''} from Excel`
      )

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      kitLogger.error('Import error:', error)
      toast.error('Failed to import data')
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className={exportButtonClassName ?? 'h-8'}
      >
        <Download className="mr-2 h-4 w-4" />
        {exportLabel}
        {exportSelected && table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span className="ml-1 text-muted-foreground">
            ({table.getFilteredSelectedRowModel().rows.length})
          </span>
        )}
      </Button>

      {/* Import Button */}
      {enableImport && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            className="h-8"
          >
            <Upload className="mr-2 h-4 w-4" />
            {importLabel}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedExtensions.join(',')}
            onChange={handleImport}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}
