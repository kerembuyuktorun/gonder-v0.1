'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'

interface FileImagePreviewProps {
  file: File
}

function FileImagePreviewComponent({ file }: FileImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!previewUrl) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
        <ImageIcon className="h-5 w-5" />
      </div>
    )
  }

  return <Image src={previewUrl} alt={file.name} width={48} height={48} className="h-12 w-12 rounded object-cover" unoptimized />
}

export const FileImagePreview = React.memo(FileImagePreviewComponent)
