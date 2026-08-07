'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 2 * 1024 * 1024

type Props = {
  name: string
  src: string | null
  onChange: (nextUrl: string | null) => void
  className?: string
}

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Dosya okunamadı'))
    }
    reader.onerror = () => reject(new Error('Dosya okunamadı'))
    reader.readAsDataURL(file)
  })
}

export function UserAvatarControl({ name, src, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const initials = userInitials(name) || '?'

  const openPicker = () => {
    inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    if (!ACCEPTED_TYPES.has(file.type)) {
      toast.error('Yalnızca JPG, PNG, WEBP veya GIF yükleyebilirsiniz')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('Görsel en fazla 2 MB olabilir')
      return
    }

    setBusy(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
      toast.success('Profil fotoğrafı güncellendi')
    } catch {
      toast.error('Fotoğraf yüklenemedi')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        className='sr-only'
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            disabled={busy}
            className={cn(
              'group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2',
              className
            )}
            aria-label='Profil fotoğrafını değiştir'
          >
            <Avatar className='size-14 ring-1 ring-slate-200'>
              {src ? <AvatarImage src={src} alt={name} /> : null}
              <AvatarFallback className='bg-slate-100 text-sm font-semibold text-slate-700'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className='absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
              <Camera className='size-4 text-white' aria-hidden />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-52'>
          <DropdownMenuItem
            disabled={busy}
            onSelect={(event) => {
              event.preventDefault()
              openPicker()
            }}
          >
            <ImagePlus className='size-3.5' aria-hidden />
            Fotoğraf Yükle
          </DropdownMenuItem>
          {src ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={busy}
                className='text-rose-700 focus:text-rose-700'
                onSelect={() => {
                  onChange(null)
                  toast.success('Profil fotoğrafı kaldırıldı')
                }}
              >
                <Trash2 className='size-3.5' aria-hidden />
                Fotoğrafı Kaldır
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
