export type ResultPanelMode = 'list' | 'detail'

const DETAIL_DEFAULT = { vhRatio: 0.58, maxPx: 480 } as const
const TOOLBAR_GAP_PX = 16
const FALLBACK_TOOLBAR_BOTTOM_PX = 72
export const RESULT_PANEL_BOTTOM_INSET_PX = 12
export const RESULT_PANEL_TOGGLE_HEIGHT_PX = 32

/** Liste görünümü — tek rota kartının tam görünmesi için içerik yükseklikleri */
const LIST_PANEL_HEADER_PX = 96
const LIST_PANEL_ALERT_PX = 52
const LIST_PANEL_CARD_ROW_PX = 240
const LIST_PANEL_CARD_PADDING_PX = 24
const DETAIL_PANEL_MIN_PX = 280

export type ResultPanelHeightOptions = {
  hasAlerts?: boolean
  viewportHeight?: number
}

export function getListResultPanelContentHeight(hasAlerts = false): number {
  return (
    LIST_PANEL_HEADER_PX +
    LIST_PANEL_CARD_PADDING_PX +
    LIST_PANEL_CARD_ROW_PX +
    (hasAlerts ? LIST_PANEL_ALERT_PX : 0)
  )
}

export function getMinResultPanelHeight(
  mode: ResultPanelMode,
  options?: Pick<ResultPanelHeightOptions, 'hasAlerts'>
): number {
  if (mode === 'detail') return DETAIL_PANEL_MIN_PX
  return getListResultPanelContentHeight(options?.hasAlerts ?? false)
}

export function getDefaultResultPanelHeight(
  mode: ResultPanelMode,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800,
  options?: Pick<ResultPanelHeightOptions, 'hasAlerts'>
): number {
  if (mode === 'detail') {
    return Math.round(
      Math.min(viewportHeight * DETAIL_DEFAULT.vhRatio, DETAIL_DEFAULT.maxPx)
    )
  }

  const contentHeight = getListResultPanelContentHeight(options?.hasAlerts ?? false)
  return Math.round(Math.min(contentHeight, viewportHeight * 0.5))
}

export function getMaxResultPanelHeightFromLayout(
  mapSectionRect: DOMRect,
  toolbarRect: DOMRect | null,
  bottomInsetPx: number,
  toolbarGapPx = TOOLBAR_GAP_PX
): number {
  const toolbarBottomRelative = toolbarRect
    ? toolbarRect.bottom - mapSectionRect.top
    : FALLBACK_TOOLBAR_BOTTOM_PX

  return Math.round(
    mapSectionRect.height -
      bottomInsetPx -
      toolbarBottomRelative -
      toolbarGapPx -
      RESULT_PANEL_TOGGLE_HEIGHT_PX
  )
}

export function clampResultPanelHeight(
  height: number,
  mode: ResultPanelMode,
  options?: {
    maxHeight?: number
    viewportHeight?: number
    hasAlerts?: boolean
  }
): number {
  const min = getMinResultPanelHeight(mode, { hasAlerts: options?.hasAlerts })
  const layoutMax = options?.maxHeight ?? Number.POSITIVE_INFINITY
  const max = Math.max(min, layoutMax)
  return Math.min(max, Math.max(min, Math.round(height)))
}

export function getResultPanelHeightFromPointer(
  mapSectionRect: DOMRect,
  clientY: number
): number {
  return (
    mapSectionRect.bottom -
    RESULT_PANEL_BOTTOM_INSET_PX -
    clientY -
    RESULT_PANEL_TOGGLE_HEIGHT_PX
  )
}
