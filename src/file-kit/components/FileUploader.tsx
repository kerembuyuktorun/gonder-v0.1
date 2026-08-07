'use client'

import { useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { UploadCloud, X, File as FileIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { FileUploadStatus, FileUploaderProps } from '../context/types'
import { FileImagePreview } from './FileImagePreview'

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function dedupeSelectedFiles(files: File[], enabled: boolean): File[] {
  if (!enabled) return files

  const seen = new Set<string>()
  return files.filter((file) => {
    const key = fileKey(file)
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function FileUploader({
  value = [],
  onChange,
  accept,
  multiple = true,
  maxFiles = 5,
  maxSizeMb = 5,
  disabled = false,
  className,
  showPreview = true,
  dedupeFiles = true,
  uploadStrategy = 'sequential',
  onUpload,
  header,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [statusMap, setStatusMap] = useState<Record<string, FileUploadStatus>>({})

  const maxSizeBytes = maxSizeMb * 1024 * 1024

  const validator = useMemo(
    () =>
      z
        .instanceof(File)
        .refine((file) => file.size <= maxSizeBytes, `File size must not exceed ${maxSizeMb}MB`)
        .refine((file) => {
          if (!accept) return true
          const accepted = accept
            .split(',')
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)

          if (accepted.length === 0) return true

          const fileExt = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
          return accepted.some((rule) => {
            if (rule.startsWith('.')) return rule === fileExt
            if (rule.endsWith('/*')) return file.type.startsWith(rule.replace('/*', '/'))
            return file.type === rule
          })
        }, 'File type not supported'),
    [accept, maxSizeBytes, maxSizeMb]
  )

  const emitFiles = async (incoming: File[]) => {
    if (disabled || incoming.length === 0) return

    const selected = multiple ? [...value, ...incoming] : [incoming[0]]
    const dedupedSelection = dedupeSelectedFiles(selected, dedupeFiles).slice(0, maxFiles)
    const validFiles: File[] = []

    for (const file of dedupedSelection) {
      const parsed = validator.safeParse(file)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || 'Invalid file', {
          description: file.name,
        })
        continue
      }
      validFiles.push(file)
    }

    onChange?.(validFiles)

    if (!onUpload) return

    const uploadFile = async (file: File) => {
      const key = fileKey(file)
      setStatusMap((prev) => ({ ...prev, [key]: 'uploading' }))
      setProgressMap((prev) => ({ ...prev, [key]: 0 }))

      try {
        await onUpload(file, (percent) => {
          setProgressMap((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, percent)) }))
        })
        setStatusMap((prev) => ({ ...prev, [key]: 'success' }))
        setProgressMap((prev) => ({ ...prev, [key]: 100 }))
      } catch (_error) {
        setStatusMap((prev) => ({ ...prev, [key]: 'error' }))
        toast.error('Upload failed', { description: file.name })
      }
    }

    setStatusMap((prev) => {
      const next = { ...prev }
      validFiles.forEach((file) => {
        next[fileKey(file)] = 'queued'
      })
      return next
    })

    if (uploadStrategy === 'parallel') {
      await Promise.all(validFiles.map((file) => uploadFile(file)))
      return
    }

    for (const file of validFiles) {
      await uploadFile(file)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    void emitFiles(files)
    event.target.value = ''
  }

  const removeFile = (index: number) => {
    const removedFile = value[index]
    const next = value.filter((_, i) => i !== index)
    const key = removedFile ? fileKey(removedFile) : null
    if (key) {
      setProgressMap((prev) => {
        const nextProgressMap = { ...prev }
        delete nextProgressMap[key]
        return nextProgressMap
      })
      setStatusMap((prev) => {
        const nextStatusMap = { ...prev }
        delete nextStatusMap[key]
        return nextStatusMap
      })
    }
    onChange?.(next)
  }

  const retryFile = async (file: File) => {
    if (!onUpload) return
    await emitFiles([file])
  }

  return (
    <div className={cn('space-y-4', className)}>
      {header}

      <div
        className={cn(
          'rounded-lg border border-dashed p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          const files = Array.from(event.dataTransfer.files || [])
          void emitFiles(files)
        }}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Dosyaları sürükleyin veya seçmek için tıklayın</p>
        <p className="mt-1 text-xs text-muted-foreground">En fazla {maxFiles} dosya, her biri en fazla {maxSizeMb}MB</p>
        
        <Button type="button" variant="outline" size="sm" className="mt-4" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Dosya Seç
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((file, index) => {
            const key = fileKey(file)
            const progress = progressMap[key]
            const status = statusMap[key]
            const isImage = file.type.startsWith('image/')

            return (
              <div key={key} className="rounded-md border p-3">
                <div className="flex items-center gap-3">
                  {isImage && showPreview ? (
                    <FileImagePreview file={file} />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                      {isImage ? <ImageIcon className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {status && <p className="text-xs text-muted-foreground">Status: {status}</p>}
                    {typeof progress === 'number' && <Progress value={progress} className="mt-2" />}
                  </div>

                  <div className="flex items-center gap-1">
                    {status === 'error' && (
                      <Button type="button" variant="outline" size="sm" onClick={() => void retryFile(file)} disabled={disabled}>
                        Retry
                      </Button>
                    )}

                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={disabled}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
