/**
 * DataTable Kit - Excel Utils
 * 
 * Excel import/export utilities for DataTable
 */

import * as XLSX from 'xlsx'
import type { ColumnDef } from '@tanstack/react-table'
import { kitLogger } from '../../_shared/logger'

/**
 * Export options for Excel
 */
export interface ExcelExportOptions<TData = unknown> {
  /** Filename without extension */
  filename?: string
  /** Sheet name */
  sheetName?: string
  /** Include headers in export */
  includeHeaders?: boolean
  /** Column definitions for header mapping */
  columns?: ColumnDef<TData, unknown>[]
}

/**
 * Import options for Excel
 */
export interface ExcelImportOptions {
  /** Expected sheet name (optional) */
  sheetName?: string
  /** Skip first N rows */
  skipRows?: number
  /** Column mapping { excelColumn: dataKey } */
  columnMapping?: Record<string, string>
  /** Maximum allowed data rows after header */
  maxRows?: number
  /** Maximum allowed columns */
  maxColumns?: number
}

/**
 * Security options for Excel file validation/import.
 */
export interface ExcelImportSecurityOptions {
  maxSizeBytes?: number
  allowedExtensions?: string[]
  allowedMimeTypes?: string[]
  allowLegacyXls?: boolean
  maxRows?: number
  maxColumns?: number
}

export interface ExcelValidationResult {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * Export data to Excel file
 * 
 * @example
 * ```ts
 * exportToExcel({
 *   data: tableData,
 *   filename: 'users-export',
 *   sheetName: 'Users',
 *   columns: columnDefs
 * })
 * ```
 */
export function exportToExcel<TData = unknown>(
  data: TData[],
  options: ExcelExportOptions<TData> = {}
): void {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    includeHeaders = true,
    columns = [],
  } = options

  if (!data || data.length === 0) {
    kitLogger.warn('No data to export')
    return
  }

  try {
    // Prepare data for Excel
    let exportData: Record<string, unknown>[] = []

    if (columns && columns.length > 0) {
      // Use column definitions to map and format data
      exportData = data.map((row) => {
        const mappedRow: Record<string, unknown> = {}
        
        columns.forEach((col) => {
          // Skip selection columns and action columns
          if (col.id === 'select' || col.id === 'actions') return
          
          // Get column header text
          let header = col.id || ''
          if (typeof col.header === 'string') {
            header = col.header
          } else if (col.meta && 'title' in col.meta && typeof col.meta.title === 'string') {
            header = col.meta.title
          }

          // Get cell value
          let value: unknown = ''
          if ('accessorKey' in col && col.accessorKey) {
            const key = col.accessorKey as string
            value = (row as Record<string, unknown>)[key]
          } else if ('accessorFn' in col && col.accessorFn) {
            value = col.accessorFn(row, 0)
          }

          // Format date objects
          if (value && typeof value === 'object' && 'toLocaleDateString' in value) {
            value = (value as Date).toLocaleDateString()
          }

          mappedRow[header] = value
        })

        return mappedRow
      })
    } else {
      // Export raw data
      exportData = data as Record<string, unknown>[]
    }

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      skipHeader: !includeHeaders,
    })

    // Auto-size columns
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Download file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    kitLogger.error('Error exporting to Excel:', error)
    throw Object.assign(new Error('Failed to export data to Excel'), { cause: error })
  }
}

/**
 * Import data from Excel file
 * 
 * @example
 * ```ts
 * const handleFileUpload = async (file: File) => {
 *   const data = await importFromExcel(file, {
 *     sheetName: 'Users',
 *     skipRows: 0
 *   })
 *   setTableData(data)
 * }
 * ```
 */
export async function importFromExcel<TData = unknown>(
  file: File,
  options: ExcelImportOptions = {}
): Promise<TData[]> {
  const {
    sheetName,
    skipRows = 0,
    columnMapping = {},
    maxRows,
    maxColumns,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('Failed to read file'))
          return
        }

        // Parse workbook
        const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' })

        // Get sheet
        const targetSheetName = sheetName || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[targetSheetName]

        if (!worksheet) {
          reject(new Error(`Sheet "${targetSheetName}" not found`))
          return
        }

        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as unknown[][]

        // Skip rows if needed
        const dataRows = skipRows > 0 ? rawData.slice(skipRows) : rawData

        if (dataRows.length === 0) {
          resolve([])
          return
        }

        // Get headers from first row
        const headers = dataRows[0] as string[]
        const rows = dataRows.slice(1)

        if (maxColumns && headers.length > maxColumns) {
          reject(new Error(`Column count exceeds limit (${maxColumns})`))
          return
        }

        if (maxRows && rows.length > maxRows) {
          reject(new Error(`Row count exceeds limit (${maxRows})`))
          return
        }

        // Map to objects
        const mappedData: TData[] = rows.map((row) => {
          const obj: Record<string, unknown> = {}
          
          headers.forEach((header, index) => {
            const cellValue = row[index]
            
            // Use column mapping if provided
            const key = columnMapping[header] || header
            
            obj[key] = cellValue
          })

          return obj as TData
        })

        resolve(mappedData)
      } catch (error) {
        kitLogger.error('Error importing from Excel:', error)
        reject(new Error('Failed to import data from Excel'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Download Excel template with headers
 * 
 * @example
 * ```ts
 * downloadExcelTemplate({
 *   filename: 'users-template',
 *   headers: ['Name', 'Email', 'Role', 'Status'],
 *   sheetName: 'Users'
 * })
 * ```
 */
export function downloadExcelTemplate(options: {
  filename?: string
  headers: string[]
  sheetName?: string
  sampleData?: Record<string, unknown>[]
}): void {
  const {
    filename = 'template',
    headers,
    sheetName = 'Sheet1',
    sampleData = [],
  } = options

  try {
    // Create data with headers and optional sample data
    const data = sampleData.length > 0 ? sampleData : [{}]

    // Create worksheet with only headers visible if no sample data
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: headers,
    })

    // If no sample data, clear the data row
    if (sampleData.length === 0) {
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index })
        delete worksheet[cellAddress]
      })
    }

    // Auto-size columns
    worksheet['!cols'] = headers.map((header) => ({
      wch: Math.max(header.length + 2, 15),
    }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Download file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    kitLogger.error('Error downloading template:', error)
    throw Object.assign(new Error('Failed to download Excel template'), { cause: error })
  }
}

/**
 * Validate Excel file before import
 */
export async function validateExcelFile(
  file: File,
  options: ExcelImportSecurityOptions = {}
): Promise<ExcelValidationResult> {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    allowedExtensions = ['.xlsx', '.csv'],
    allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel',
    ],
    allowLegacyXls = false,
  } = options

  const resolvedAllowedExtensions = allowLegacyXls
    ? Array.from(new Set([...allowedExtensions, '.xls']))
    : allowedExtensions

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`,
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!resolvedAllowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${resolvedAllowedExtensions.join(', ')}`,
    }
  }

  if (extension === '.xls' && !allowLegacyXls) {
    return {
      valid: false,
      error: 'Legacy .xls files are disabled by default for security reasons.',
    }
  }

  if (file.type) {
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File MIME type is not allowed: ${file.type}`,
      }
    }

    const extensionMimeMap: Record<string, string[]> = {
      '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      '.xls': ['application/vnd.ms-excel'],
      '.csv': ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'],
    }

    const allowedForExtension = extensionMimeMap[extension]
    if (allowedForExtension && !allowedForExtension.includes(file.type)) {
      return {
        valid: false,
        error: `File extension (${extension}) does not match MIME type (${file.type}).`,
      }
    }
  }

  return file.type
    ? { valid: true }
    : {
        valid: true,
        warning: 'File MIME type could not be verified by the browser. Import only trusted files.',
      }

  return { valid: true }
}
