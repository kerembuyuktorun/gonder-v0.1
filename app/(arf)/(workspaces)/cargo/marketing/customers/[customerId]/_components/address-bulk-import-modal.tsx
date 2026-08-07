"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@hascanb/arf-ui-kit/datatable-kit"
import { FileUploader } from "@hascanb/arf-ui-kit/file-kit"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, CheckCircle2, X } from "lucide-react"
import { resolveAddressBranch } from "../../../../shipments/_components/customer-address-modal"
import type { CustomerAddressRecord } from "../../_data/customers"

// Şablondaki zorunlu sütun başlıkları
const REQUIRED_COLUMNS = ["Adres Başlığı", "Şehir", "İlçe", "Mahalle", "Açık Adres"] as const
const OPTIONAL_COLUMNS = ["Telefon"] as const

type ParsedRow = {
  label: string
  city: string
  district: string
  neighborhood: string
  line1: string
  phone: string
  branch: string
  error?: string
}

type Step = "upload" | "preview"

interface AddressBulkImportModalProps {
  onClose: () => void
  onImport: (rows: CustomerAddressRecord[]) => void
}

const previewColumns: ColumnDef<ParsedRow>[] = [
  {
    accessorKey: "label",
    header: "Başlık",
    cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.label}</span>,
  },
  {
    accessorKey: "city",
    header: "Şehir",
    cell: ({ row }) => <span className="text-slate-600">{row.original.city}</span>,
  },
  {
    accessorKey: "district",
    header: "İlçe",
    cell: ({ row }) => <span className="text-slate-600">{row.original.district}</span>,
  },
  {
    accessorKey: "branch",
    header: "Şube",
    cell: ({ row }) => <span className="text-slate-500">{row.original.branch || "—"}</span>,
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => <span className="text-slate-500">{row.original.phone || "—"}</span>,
  },
]

function downloadTemplate() {
  const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]
  const sample = [
    ["Merkez Ofis", "Adana", "Seyhan", "Alidede", "Alidede Mah. 1185 Sok. No:12", "05001234567"],
    ["Depo", "Ankara", "Çankaya", "Kızılay", "Kızılay Cad. No:5", ""],
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])

  // Sütun genişlikleri
  ws["!cols"] = headers.map(() => ({ wch: 22 }))
  XLSX.utils.book_append_sheet(wb, ws, "Adresler")
  XLSX.writeFile(wb, "adres-sablonu.xlsx")
}

function parseWorkbook(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: "binary" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })

        const parsed: ParsedRow[] = rows.map((row, idx) => {
          const label = String(row["Adres Başlığı"] ?? "").trim()
          const city = String(row["Şehir"] ?? "").trim()
          const district = String(row["İlçe"] ?? "").trim()
          const neighborhood = String(row["Mahalle"] ?? "").trim()
          const line1 = String(row["Açık Adres"] ?? "").trim()
          const phone = String(row["Telefon"] ?? "").trim()

          const missing = REQUIRED_COLUMNS.filter((col) => !String(row[col] ?? "").trim())
          const error = missing.length > 0 ? `Satır ${idx + 2}: "${missing.join('", "')}" boş bırakılamaz` : undefined

          const branch = resolveAddressBranch(city, district, neighborhood)

          return { label, city, district, neighborhood, line1, phone, branch, error }
        })

        resolve(parsed)
      } catch {
        reject(new Error("Dosya okunamadı. Lütfen geçerli bir .xlsx veya .csv dosyası yükleyin."))
      }
    }
    reader.onerror = () => reject(new Error("Dosya okuma hatası."))
    reader.readAsBinaryString(file)
  })
}

export function AddressBulkImportModal({ onClose, onImport }: AddressBulkImportModalProps) {
  const [step, setStep] = useState<Step>("upload")
  const [files, setFiles] = useState<File[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const validRows = parsedRows.filter((r) => !r.error)
  const errorRows = parsedRows.filter((r) => r.error)

  const handleFileChange = (selected: File[]) => {
    setFiles(selected)
    setParseError("")
  }

  const handleAnalyze = async () => {
    if (files.length === 0) return
    setIsParsing(true)
    setParseError("")
    try {
      const rows = await parseWorkbook(files[0])
      if (rows.length === 0) {
        setParseError("Dosyada hiç satır bulunamadı. Şablonu kontrol edin.")
        setIsParsing(false)
        return
      }
      setParsedRows(rows)
      setStep("preview")
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Bilinmeyen hata.")
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    const records: CustomerAddressRecord[] = validRows.map((row) => ({
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: row.label,
      line1: row.line1,
      city: row.city,
      district: row.district || "-",
      neighborhood: row.neighborhood || "-",
      branch: row.branch || "-",
      phone: row.phone || "-",
      contactName: "",
    }))
    onImport(records)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-16 backdrop-blur-[2px]">
      <div className="max-h-[calc(100vh-5rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900">Toplu Adres İçe Aktar</h2>
            <p className="text-sm text-slate-500">
              Excel veya CSV dosyası yükleyerek birden fazla adresi tek seferde ekleyebilirsiniz.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-2xl" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {step === "upload" && (
            <>
              {/* Şablon indirme */}
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">Şablon Dosyası</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Zorunlu sütunlar:{" "}
                    <span className="font-medium text-slate-700">{REQUIRED_COLUMNS.join(", ")}</span>
                    <br />
                    Opsiyonel:{" "}
                    <span className="font-medium text-slate-700">{OPTIONAL_COLUMNS.join(", ")}</span>
                    {" "}— Şube otomatik atanır
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-2xl"
                  onClick={downloadTemplate}
                >
                  <Download className="mr-2 size-4" />
                  Şablonu İndir
                </Button>
              </div>

              {/* File uploader */}
              <FileUploader
                value={files}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                multiple={false}
                maxFiles={1}
                maxSizeMb={10}
                showPreview
              />

              {parseError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {parseError}
                </div>
              )}
            </>
          )}

          {step === "preview" && (
            <div ref={previewRef} className="space-y-4">
              {/* Özet */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600">Geçerli Satır</p>
                    <p className="text-xl font-bold text-emerald-700">{validRows.length}</p>
                  </div>
                </div>
                {errorRows.length > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <AlertCircle className="size-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-xs text-rose-600">Hatalı Satır</p>
                      <p className="text-xl font-bold text-rose-700">{errorRows.length}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hata listesi */}
              {errorRows.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Atlanan Satırlar</p>
                  <div className="max-h-32 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {errorRows.map((r, i) => (
                      <p key={i}>{r.error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Önizleme tablosu */}
              {validRows.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Önizleme{" "}
                    {validRows.length > 5 ? `(ilk 5 / ${validRows.length} satır gösteriliyor)` : ""}
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <DataTable
                      data={validRows.slice(0, 5)}
                      columns={previewColumns}
                      enablePagination={false}
                      enableSorting={false}
                      enableGlobalFilter={false}
                      enableColumnVisibility={false}
                      emptyMessage="Önizleme satırı bulunamadı."
                      className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {validRows.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <AlertCircle className="size-4 shrink-0" />
                  İçe aktarılabilecek geçerli satır bulunamadı. Lütfen dosyanızı düzenleyin.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          {step === "upload" ? (
            <>
              <Button variant="outline" className="rounded-2xl" onClick={onClose}>
                İptal
              </Button>
              <Button
                className="rounded-2xl"
                disabled={files.length === 0 || isParsing}
                onClick={handleAnalyze}
              >
                {isParsing ? "Analiz ediliyor…" : "Dosyayı Analiz Et"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setStep("upload")
                  setParsedRows([])
                  setFiles([])
                }}
              >
                Geri
              </Button>
              <Button
                className="rounded-2xl"
                disabled={validRows.length === 0}
                onClick={handleImport}
              >
                {validRows.length} Adresi İçe Aktar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
