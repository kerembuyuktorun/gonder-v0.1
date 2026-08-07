'use client'

import { useRef, type RefObject, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PanelBottomClose, PanelBottomOpen } from 'lucide-react'
import { getResultPanelHeightFromPointer } from '../_lib/result-panel-layout'

/** Basılı tutma — normal tıklamadan uzun, sürüklemeye geçiş */
const HOLD_TO_DRAG_MS = 280

type ShellProps = {
  open: boolean
  height: number
  dragging?: boolean
  panelShellClassName: string
  children: ReactNode
}

export function ResultPanelShell({
  open,
  height,
  dragging = false,
  panelShellClassName,
  children,
}: ShellProps) {
  return (
    <aside
      style={{ height: open ? height : 0 }}
      className={cn(
        panelShellClassName,
        'pointer-events-auto flex w-full flex-col overflow-hidden rounded-xl border shadow-sm',
        dragging ? '' : 'transition-[height,opacity]',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className='min-h-0 flex-1 overflow-hidden'>{children}</div>
    </aside>
  )
}

type ToggleProps = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  onToggle: () => void
  onHeightChange: (height: number) => void
  onDraggingChange?: (dragging: boolean) => void
}

type InteractionMode = 'idle' | 'hold' | 'drag'

export function ResultPanelToggle({
  open,
  anchorRef,
  onToggle,
  onHeightChange,
  onDraggingChange,
}: ToggleProps) {
  const interactionRef = useRef<{ mode: InteractionMode } | null>(null)
  const suppressClickRef = useRef(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingHeightRef = useRef<number | null>(null)

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const clearDragUi = () => {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    onDraggingChange?.(false)
  }

  const flushHeight = () => {
    rafRef.current = null
    if (pendingHeightRef.current == null) return
    onHeightChange(pendingHeightRef.current)
    pendingHeightRef.current = null
  }

  const scheduleHeight = (height: number) => {
    pendingHeightRef.current = height
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(flushHeight)
  }

  const enterHoldMode = () => {
    if (!interactionRef.current || interactionRef.current.mode !== 'idle') return
    interactionRef.current.mode = 'hold'
    suppressClickRef.current = true
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
    onDraggingChange?.(true)
  }

  const resizeFromPointer = (clientY: number) => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    scheduleHeight(getResultPanelHeightFromPointer(rect, clientY))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!open) return

    clearHoldTimer()
    suppressClickRef.current = false
    interactionRef.current = { mode: 'idle' }
    event.currentTarget.setPointerCapture(event.pointerId)
    holdTimerRef.current = setTimeout(enterHoldMode, HOLD_TO_DRAG_MS)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!open || !interactionRef.current) return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

    const mode = interactionRef.current.mode
    if (mode !== 'hold' && mode !== 'drag') return

    interactionRef.current.mode = 'drag'
    suppressClickRef.current = true
    resizeFromPointer(event.clientY)
  }

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    clearHoldTimer()

    const state = interactionRef.current
    interactionRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current)
      flushHeight()
    }

    if (state?.mode === 'hold' || state?.mode === 'drag') {
      suppressClickRef.current = true
    }

    clearDragUi()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      onToggle()
      return
    }

    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      return
    }

    onToggle()
  }

  return (
    <Button
      type='button'
      size='icon'
      variant={open ? 'outline' : 'default'}
      className={cn(
        'pointer-events-auto relative z-10 shrink-0 select-none shadow-lg transition-all',
        open
          ? 'size-8 cursor-pointer rounded-b-none rounded-t-lg border-b-0 bg-white text-slate-700 hover:bg-slate-50'
          : 'size-10 cursor-pointer rounded-lg border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      aria-label={
        open
          ? 'Sonuç panelini kapat veya basılı tutup sürükleyerek boyutlandır'
          : 'Sonuç panelini aç'
      }
      title={
        open
          ? 'Tek tıkla: kapat · Basılı tut ve sürükle: yüksekliği ayarla'
          : 'Optimizasyon sonucunu göster'
      }
    >
      {open ? (
        <PanelBottomClose className='pointer-events-none size-4' />
      ) : (
        <PanelBottomOpen className='pointer-events-none size-4' />
      )}
    </Button>
  )
}
