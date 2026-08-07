'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  visible: boolean
  loading: boolean
  loaded: number
  total: number
  onClick: () => void
}

export function HistoryLoadMore({ visible, loading, loaded, total, onClick }: Props) {
  if (!visible) return null

  return (
    <div className='border-t border-slate-100 px-4 py-3'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='h-9 w-full'
        disabled={loading}
        onClick={onClick}
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 size-4 animate-spin' />
            Yükleniyor…
          </>
        ) : (
          `Daha fazla göster (${loaded}/${total})`
        )}
      </Button>
    </div>
  )
}
