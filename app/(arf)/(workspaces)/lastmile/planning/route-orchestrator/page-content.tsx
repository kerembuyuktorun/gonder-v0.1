'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen,
  Play,
  RotateCcw,
  ArrowRight,
  Info,
  Settings2,
  Undo2,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import type { OrderType, RouteType } from '../../orders/_types/order'
import type {
  VehicleOperationalStatus,
  VehicleSkill,
} from '../../resources/vehicles/_types/vehicle'
import { AdvancedSettingsDialog } from './_components/advanced-settings-dialog'
import { MapVisibilityHelpDialog } from './_components/map-visibility-help-dialog'
import { OptimizationResultPanel } from './_components/optimization-result-panel'
import { RouteListPanel } from './_components/route-list-panel'
import {
  ResultPanelShell,
  ResultPanelToggle,
} from './_components/result-panel-shell'
import { OrderPoolPanel } from './_components/order-pool-panel'
import type {
  OrchestratorMapPoint,
  OrchestratorMapRoute,
} from './_components/orchestrator-leaflet-map'
import { OrchestratorMapHost } from './_components/orchestrator-map-host'
import { ResourcesPanel } from './_components/resources-panel'
import {
  isOperationalVehicleStatus,
  resolveFieldVehicleFilter,
  resolvePlanningMapMode,
  shouldShowOnlySelectedOrders,
  shouldShowPlanningOrders,
  shouldShowSelectedActiveRoutes,
} from './_lib/planning-map-visibility'
import {
  approveOptimizeResult,
  mergeActiveRoutes,
} from './_lib/approve-optimize-result'
import {
  activeRouteMatchesDateScope,
  orderMatchesOperationDate,
  toOperationDateInputValue,
} from './_lib/operation-date'
import { runMockOptimize } from './_lib/optimize'
import { optionalOptimizeCustomerId } from './_lib/customer-scope'
import { summarizeUnmatchedReasons } from './_lib/unmatched-reason'
import { isSparseRoadGeometry, snapLatLngToPolyline } from './_lib/route-geometry'
import {
  removeOrderFromActiveRoute,
  removeOrderFromPendingRoute,
} from './_lib/remove-order-from-route'
import {
  reoptimizeActiveRouteRemaining,
  type ReoptimizeActiveRouteResult,
} from './_lib/reoptimize-active-route'
import {
  reorderActiveRouteStops,
  reorderPendingRouteStops,
} from './_lib/reorder-route-stops'
import {
  applyOptimizeSolution,
  applyReoptimizeActiveRoute,
  createOptimizeJob,
  fetchLastMileSettings,
  loadPlanningContext,
  upsertLastMileSettings,
  pollOptimizeJobUntilDone,
  previewReoptimizeActiveRoute,
  rejectOptimizeSolution,
  removeOrdersFromActiveRouteApi,
  removeOrdersFromPendingRoute,
  reorderActiveRouteStopsApi,
  reorderPendingRouteStopsApi,
} from './_api/orchestrator-client'
import { bootstrapOrchestratorCatalog } from './_lib/orchestrator-bootstrap'
import {
  isOrchestratorDemo,
  type OrchestratorMode,
} from './_lib/orchestrator-mode'
import {
  pushOrchestratorUndo,
  type OrchestratorUndoEntry,
} from './_lib/orchestrator-undo'
import {
  clampResultPanelHeight,
  getDefaultResultPanelHeight,
  getMaxResultPanelHeightFromLayout,
  RESULT_PANEL_BOTTOM_INSET_PX,
} from './_lib/result-panel-layout'
import { ReoptimizePreviewDialog } from './_components/reoptimize-preview-dialog'
import {
  buildOrchestratorActiveRoutes,
  defaultPlanningPool,
} from './_mock/orchestrator-mock'
import {
  DEFAULT_OPTIMIZE_SETTINGS,
  clampOptimizeSettings,
  type ActiveRouteDateScope,
  type OptimizeResult,
  type OptimizeSettings,
  type OrchestratorActiveRoute,
  type OrchestratorOrder,
  type OrchestratorStep,
} from './_types/orchestrator'

function toggleId(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export type RouteOrchestratorPageContentProps = {
  mode: OrchestratorMode
  /** Deep-link: open active route detail when catalog is ready */
  initialRouteId?: string | null
}

export function RouteOrchestratorPageContent({
  mode,
  initialRouteId = null,
}: RouteOrchestratorPageContentProps) {
  const isDemo = isOrchestratorDemo(mode)

  const [allOrders, setAllOrders] = useState(
    () => bootstrapOrchestratorCatalog(mode).orders
  )
  const [allVehicles, setAllVehicles] = useState(
    () => bootstrapOrchestratorCatalog(mode).vehicles
  )
  const [apiActiveRoutes, setApiActiveRoutes] = useState<
    OrchestratorActiveRoute[]
  >([])
  const [catalogLoading, setCatalogLoading] = useState(!isDemo)
  const [optimizeJobId, setOptimizeJobId] = useState<string | null>(null)
  const [optimizeJobVersion, setOptimizeJobVersion] = useState<number | null>(
    null
  )
  const [sessionActiveRoutes, setSessionActiveRoutes] = useState<
    OrchestratorActiveRoute[]
  >([])
  const [hiddenActiveRouteIds, setHiddenActiveRouteIds] = useState<Set<string>>(
    () => new Set()
  )
  const [routeColorById, setRouteColorById] = useState<Record<string, string>>(
    {}
  )
  const [reoptimizeDraft, setReoptimizeDraft] =
    useState<ReoptimizeActiveRouteResult | null>(null)
  const [undoStack, setUndoStack] = useState<OrchestratorUndoEntry[]>([])
  const undoStackRef = useRef<OrchestratorUndoEntry[]>([])

  const [step, setStep] = useState<OrchestratorStep>(1)
  const [operationDate, setOperationDate] = useState(() =>
    toOperationDateInputValue()
  )
  const [activeRouteDateScope, setActiveRouteDateScope] =
    useState<ActiveRouteDateScope>('today')

  const [orderSearch, setOrderSearch] = useState('')
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'all'>('all')
  const [routeTypeFilter, setRouteTypeFilter] = useState<RouteType | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(() => new Set())

  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] =
    useState<VehicleOperationalStatus | 'all'>('all')
  const [vehicleFormFilter, setVehicleFormFilter] = useState('all')
  const [vehicleSkillFilter, setVehicleSkillFilter] =
    useState<VehicleSkill | 'all'>('all')
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(() => new Set())

  const [settings, setSettings] = useState<OptimizeSettings>(DEFAULT_OPTIMIZE_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [mapVisibilityHelpOpen, setMapVisibilityHelpOpen] = useState(false)
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedActiveRouteIds, setSelectedActiveRouteIds] = useState<Set<string>>(
    () => new Set()
  )
  const [detailActiveRouteId, setDetailActiveRouteId] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)

  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [headerOpen, setHeaderOpen] = useState(true)
  const [mapToolbarOpen, setMapToolbarOpen] = useState(true)
  const [resultPanelOpen, setResultPanelOpen] = useState(false)
  const [resultPanelHeight, setResultPanelHeight] = useState(() =>
    getDefaultResultPanelHeight('list')
  )
  const [resultPanelDragging, setResultPanelDragging] = useState(false)
  const mapSectionRef = useRef<HTMLElement>(null)
  const mapToolbarRef = useRef<HTMLDivElement>(null)
  const [mobilePanel, setMobilePanel] = useState<'orders' | 'map' | 'resources'>('map')

  const resultPanelMode =
    selectedRouteId != null || detailActiveRouteId != null ? 'detail' : 'list'
  const resultPanelHasAlerts = Boolean(
    result &&
      (result.unmatchedOrderIds.length > 0 || result.warnings.length > 0)
  )

  const resolveMaxPanelHeight = useCallback(() => {
    const anchor = mapSectionRef.current
    if (!anchor) return getDefaultResultPanelHeight(resultPanelMode)
    const mapRect = anchor.getBoundingClientRect()
    const toolbarRect = mapToolbarRef.current?.getBoundingClientRect() ?? null
    return getMaxResultPanelHeightFromLayout(
      mapRect,
      toolbarRect,
      RESULT_PANEL_BOTTOM_INSET_PX
    )
  }, [resultPanelMode])

  const setClampedResultPanelHeight = useCallback(
    (height: number) => {
      setResultPanelHeight(
        clampResultPanelHeight(height, resultPanelMode, {
          maxHeight: resolveMaxPanelHeight(),
          hasAlerts: resultPanelHasAlerts,
        })
      )
    },
    [resultPanelMode, resolveMaxPanelHeight, resultPanelHasAlerts]
  )

  useEffect(() => {
    setResultPanelHeight((prev) =>
      clampResultPanelHeight(prev, resultPanelMode, {
        maxHeight: resolveMaxPanelHeight(),
        hasAlerts: resultPanelHasAlerts,
      })
    )
  }, [resultPanelMode, resolveMaxPanelHeight, resultPanelHasAlerts])

  useEffect(() => {
    const onResize = () => {
      setResultPanelHeight((prev) =>
        clampResultPanelHeight(prev, resultPanelMode, {
          maxHeight: resolveMaxPanelHeight(),
          hasAlerts: resultPanelHasAlerts,
        })
      )
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [resultPanelMode, resolveMaxPanelHeight, resultPanelHasAlerts])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setResultPanelHeight((prev) =>
        clampResultPanelHeight(prev, resultPanelMode, {
          maxHeight: resolveMaxPanelHeight(),
          hasAlerts: resultPanelHasAlerts,
        })
      )
    })
    return () => window.cancelAnimationFrame(frame)
  }, [mapToolbarOpen, resultPanelMode, resolveMaxPanelHeight, resultPanelHasAlerts])

  const showOptimizationPanel = Boolean(result && step >= 2)
  const showPlanningRoutePanel = step === 1
  const showBottomPanel = showPlanningRoutePanel || showOptimizationPanel
  const sidePanelTogglesVisible = step !== 2
  const sidePanelsLocked = showPlanningRoutePanel && resultPanelOpen
  const leftPanelExpanded =
    sidePanelTogglesVisible && leftOpen && !sidePanelsLocked
  const rightPanelExpanded =
    sidePanelTogglesVisible && rightOpen && !sidePanelsLocked

  useEffect(() => {
    if (!sidePanelsLocked) return
    setLeftOpen(false)
    setRightOpen(false)
    if (mobilePanel !== 'map') {
      setMobilePanel('map')
    }
  }, [sidePanelsLocked, mobilePanel])

  const seedActiveRoutes = useMemo(
    () =>
      isDemo ? buildOrchestratorActiveRoutes(allVehicles, allOrders) : [],
    [isDemo, allVehicles, allOrders]
  )
  const activeRoutes = useMemo(() => {
    const base = isDemo
      ? mergeActiveRoutes(seedActiveRoutes, sessionActiveRoutes).filter(
          (route) => !hiddenActiveRouteIds.has(route.id)
        )
      : apiActiveRoutes
    return base.map((route) => {
      const override = routeColorById[route.id]
      return override ? { ...route, color: override } : route
    })
  }, [
    isDemo,
    seedActiveRoutes,
    sessionActiveRoutes,
    apiActiveRoutes,
    routeColorById,
    hiddenActiveRouteIds,
  ])

  const refreshLiveCatalog = useCallback(async (respectShiftsOverride?: boolean) => {
    if (isDemo) return
    setCatalogLoading(true)
    // Both today + carryover scopes are loaded so tab counts stay accurate
    // without re-fetching when the user switches Bugün / Geçmişten kalan.
    const loaded = await loadPlanningContext({
      operationDate,
      respectShifts: respectShiftsOverride ?? settings.respectShifts,
    })
    setCatalogLoading(false)
    if (!loaded.success) {
      toast.error(loaded.error || 'Planlama verisi yüklenemedi')
      return
    }
    setAllOrders(loaded.data.orders)
    setAllVehicles(loaded.data.vehicles)
    setApiActiveRoutes(loaded.data.activeRoutes)
  }, [isDemo, operationDate, settings.respectShifts])

  useEffect(() => {
    if (isDemo) return
    void (async () => {
      const loaded = await fetchLastMileSettings()
      if (loaded.success) {
        setSettings(loaded.data)
      }
    })()
  }, [isDemo])

  const handleSaveSettings = useCallback(
    async (next: OptimizeSettings) => {
      const normalized = clampOptimizeSettings(next)
      if (isDemo) {
        setSettings(normalized)
        setSettingsOpen(false)
        return
      }

      const previousRespectShifts = settings.respectShifts
      setSettingsSaving(true)
      const saved = await upsertLastMileSettings(normalized)
      setSettingsSaving(false)

      if (!saved.success) {
        toast.error(saved.error || 'Optimizasyon ayarları kaydedilemedi')
        return
      }

      setSettings(saved.data)
      setSettingsOpen(false)
      toast.success('Optimizasyon ayarları kaydedildi')

      if (previousRespectShifts !== saved.data.respectShifts) {
        void refreshLiveCatalog(saved.data.respectShifts)
      }
    },
    [isDemo, refreshLiveCatalog, settings.respectShifts]
  )

  useEffect(() => {
    if (isDemo) return
    void refreshLiveCatalog()
  }, [isDemo, refreshLiveCatalog])

  const activeRouteScopeCounts = useMemo(() => {
    let today = 0
    let carryover = 0
    for (const route of activeRoutes) {
      if (activeRouteMatchesDateScope(route, 'today')) today += 1
      else if (activeRouteMatchesDateScope(route, 'carryover')) carryover += 1
    }
    return { today, carryover }
  }, [activeRoutes])

  const scopedActiveRoutes = useMemo(
    () =>
      activeRoutes.filter((route) =>
        activeRouteMatchesDateScope(route, activeRouteDateScope)
      ),
    [activeRoutes, activeRouteDateScope]
  )

  useEffect(() => {
    const visibleIds = new Set(scopedActiveRoutes.map((route) => route.id))
    setSelectedActiveRouteIds((prev) => {
      if (prev.size === 0) return prev
      const next = new Set([...prev].filter((id) => visibleIds.has(id)))
      return next.size === prev.size ? prev : next
    })
    setDetailActiveRouteId((prev) =>
      prev != null && !visibleIds.has(prev) ? null : prev
    )
  }, [scopedActiveRoutes])

  const hasSelectedActiveRoutes = selectedActiveRouteIds.size > 0
  /** Toolbar / harita özeti: pinli rota veya açık detay */
  const mapRouteDisplayCount =
    selectedActiveRouteIds.size > 0
      ? selectedActiveRouteIds.size
      : detailActiveRouteId != null
        ? 1
        : 0
  const hasMapRouteDisplay = mapRouteDisplayCount > 0

  const orderIdsOnActiveRoutes = useMemo(
    () => new Set(activeRoutes.flatMap((route) => route.orderIds)),
    [activeRoutes]
  )

  const planningBase = useMemo(() => {
    const pool = defaultPlanningPool(allOrders)
    return pool.filter(
      (order) =>
        orderMatchesOperationDate(order, operationDate) &&
        !orderIdsOnActiveRoutes.has(order.id)
    )
  }, [allOrders, operationDate, orderIdsOnActiveRoutes])

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLocaleLowerCase('tr-TR')

    return planningBase.filter((order) => {
      if (orderTypeFilter !== 'all' && order.siparis_tipi !== orderTypeFilter) {
        return false
      }
      if (routeTypeFilter !== 'all' && order.rota_tipi !== routeTypeFilter) {
        return false
      }
      if (customerFilter !== 'all') {
        const customerKey = order.musteri_id ?? order.musteri
        if (customerKey !== customerFilter) return false
      }

      if (!q) return true
      const haystack = [
        order.takip_no,
        order.referans_no,
        order.musteri,
        order.alis_noktasi,
        order.varis_noktasi,
        order.bolge,
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR')
      return haystack.includes(q)
    })
  }, [
    planningBase,
    orderSearch,
    orderTypeFilter,
    routeTypeFilter,
    customerFilter,
  ])

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLocaleLowerCase('tr-TR')
    return allVehicles.filter((vehicle) => {
      if (vehicleStatusFilter !== 'all' && vehicle.durum !== vehicleStatusFilter) {
        return false
      }
      if (
        vehicleFormFilter !== 'all' &&
        vehicleFormFilter !== `class:${vehicle.arac_tipi}` &&
        vehicleFormFilter !== `body:${vehicle.kasa_tipi}`
      ) {
        return false
      }
      if (
        vehicleSkillFilter !== 'all' &&
        !vehicle.yetenekler.includes(vehicleSkillFilter)
      ) {
        return false
      }

      if (!q) return true
      const haystack = [
        vehicle.plaka,
        vehicle.marka,
        vehicle.model,
        vehicle.zimmetli_surucu ?? '',
        vehicle.hizmet_bolgesi,
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR')
      return haystack.includes(q)
    })
  }, [
    allVehicles,
    vehicleSearch,
    vehicleStatusFilter,
    vehicleFormFilter,
    vehicleSkillFilter,
  ])

  const selectedValidVehicles = useMemo(
    () =>
      allVehicles.filter(
        (v) => selectedVehicleIds.has(v.id) && v.selectable
      ),
    [allVehicles, selectedVehicleIds]
  )

  const selectedOrderIdList = useMemo(
    () => Array.from(selectedOrderIds),
    [selectedOrderIds]
  )
  const selectedVehicleIdList = useMemo(
    () => Array.from(selectedVehicleIds),
    [selectedVehicleIds]
  )

  const selectedOrders = useMemo(
    () => allOrders.filter((o) => selectedOrderIds.has(o.id)),
    [allOrders, selectedOrderIds]
  )

  const canOptimize =
    selectedOrders.length > 0 && selectedValidVehicles.length > 0 && !optimizing

  const hasPlanningSelection =
    selectedOrders.length > 0 || selectedValidVehicles.length > 0

  const addToRouteTargetId =
    detailActiveRouteId ??
    (selectedActiveRouteIds.size === 1
      ? [...selectedActiveRouteIds][0]!
      : null)
  const canPreviewAddToRoute =
    step === 1 && selectedOrders.length > 0 && addToRouteTargetId != null

  useEffect(() => {
    const validIds = new Set(planningBase.map((order) => order.id))
    setSelectedOrderIds((prev) => {
      let changed = false
      const next = new Set<string>()
      for (const id of prev) {
        if (validIds.has(id)) next.add(id)
        else changed = true
      }
      return changed ? next : prev
    })
  }, [planningBase])

  const mapLeftPanelVisible =
    leftPanelExpanded ||
    (mobilePanel === 'orders' && !showOptimizationPanel && !sidePanelsLocked)

  const mapRightPanelVisible =
    rightPanelExpanded ||
    (mobilePanel === 'resources' && !showOptimizationPanel && !sidePanelsLocked)

  // Sol/sağ panel açılınca harita rota pin seçimini temizle; detay açık kalabilir (Rotaya ekle)
  useEffect(() => {
    if (!mapLeftPanelVisible && !mapRightPanelVisible) return
    setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
  }, [mapLeftPanelVisible, mapRightPanelVisible])

  const planningMapMode = useMemo(
    () =>
      resolvePlanningMapMode({
        step,
        bottomPanelExpanded: sidePanelsLocked,
        leftPanelVisible: mapLeftPanelVisible,
        rightPanelVisible: mapRightPanelVisible,
        hasPlanningSelection,
        hasSelectedActiveRoutes,
      }),
    [
      step,
      sidePanelsLocked,
      mapLeftPanelVisible,
      mapRightPanelVisible,
      hasPlanningSelection,
      hasSelectedActiveRoutes,
    ]
  )

  const mapPoints: OrchestratorMapPoint[] = useMemo(() => {
    if (result && step >= 2) {
      const points: OrchestratorMapPoint[] = []

      for (const route of result.routes) {
        const emphasized =
          selectedRouteId == null || selectedRouteId === route.id
        for (const stop of route.stops) {
          if (stop.kind === 'depot_start' || stop.kind === 'depot_end') continue
          const stopOrders = stop.orderIds
            .map((id) => allOrders.find((item) => item.id === id))
            .filter((order): order is OrchestratorOrder => order != null)
          const isPickup = stop.kind === 'pickup'
          const isDelivery = stop.kind === 'delivery'
          const trackingNos = stopOrders.map((order) => order.takip_no).join(', ')
          const stopLabel = stop.locationLabel ?? stop.label
          const snapped =
            route.polyline.length >= 2
              ? snapLatLngToPolyline(stop.position, route.polyline)
              : stop.position

          points.push({
            id: `${route.id}:${stop.id}:${stop.kind}:${stop.sequence}`,
            lat: snapped.lat,
            lng: snapped.lng,
            kind: isPickup ? 'pickup' : isDelivery ? 'delivery' : 'stop',
            label: stopOrders.length > 1 ? String(stopOrders.length) : undefined,
            title:
              stopOrders.length > 1
                ? `${route.vehiclePlate} · ${isPickup ? 'Alım' : 'Teslim'} · ${stopLabel} · ${stopOrders.length} sipariş (${trackingNos})`
                : stopOrders[0]
                  ? `${route.vehiclePlate} · ${stopOrders[0].takip_no} · ${isPickup ? 'Alım' : isDelivery ? 'Teslim' : `Durak ${stop.sequence}`}`
                  : `${route.vehiclePlate} · Durak ${stop.sequence}`,
            color: route.color,
            dimmed: !emphasized,
          })
        }

        const vehicle = allVehicles.find((v) => v.id === route.vehicleId)
        if (vehicle) {
          points.push({
            id: `veh-pos-${vehicle.id}`,
            lat: vehicle.position.lat,
            lng: vehicle.position.lng,
            kind: 'vehicle',
            title: `${vehicle.plaka}${vehicle.zimmetli_surucu ? ` · ${vehicle.zimmetli_surucu}` : ''}`,
            color: route.color,
            vehicleStatus: 'yolda',
            dimmed: !emphasized,
          })
        }
      }
      return points
    }

    if (shouldShowSelectedActiveRoutes(planningMapMode)) {
      const points: OrchestratorMapPoint[] = []
      const selectedRoutes = activeRoutes.filter((route) =>
        selectedActiveRouteIds.has(route.id)
      )
      if (selectedRoutes.length === 0) return points

      for (const route of selectedRoutes) {
        for (const stop of route.stops) {
          if (stop.kind === 'depot_start' || stop.kind === 'depot_end') continue
          const snapped =
            route.polyline.length >= 2
              ? snapLatLngToPolyline(stop.position, route.polyline)
              : stop.position
          points.push({
            id: `${route.id}:${stop.id}:${stop.kind}:${stop.sequence}`,
            lat: snapped.lat,
            lng: snapped.lng,
            kind: stop.kind,
            label: String(stop.sequence),
            title: `${route.label} · ${stop.label}`,
            color: route.color,
            dimmed: stop.completed,
          })
        }
        points.push({
          id: `active-route-veh-${route.vehicleId}`,
          lat: route.position.lat,
          lng: route.position.lng,
          kind: 'vehicle',
          title: `${route.label} · ${route.vehiclePlate}${route.courierName ? ` · ${route.courierName}` : ''}`,
          color: route.color,
          vehicleStatus: 'yolda',
          vehicleId: route.vehicleId,
        })
      }
      return points
    }

    const points: OrchestratorMapPoint[] = []

    const vehicleFilter = resolveFieldVehicleFilter(
      planningMapMode,
      selectedVehicleIds.size > 0
    )
    const vehiclesForMap =
      vehicleFilter === 'none'
        ? []
        : vehicleFilter === 'selected-only'
          ? allVehicles.filter((vehicle) => selectedVehicleIds.has(vehicle.id))
          : vehicleFilter === 'operational'
            ? allVehicles.filter((vehicle) =>
                isOperationalVehicleStatus(vehicle.durum)
              )
            : allVehicles

    const hasVehicleSelection = selectedVehicleIds.size > 0
    for (const vehicle of vehiclesForMap) {
      const selected = selectedVehicleIds.has(vehicle.id)
      points.push({
        id: `field-veh-${vehicle.id}`,
        lat: vehicle.position.lat,
        lng: vehicle.position.lng,
        kind: 'vehicle',
        title: `${vehicle.plaka}${vehicle.zimmetli_surucu ? ` · ${vehicle.zimmetli_surucu}` : ''}`,
        vehicleStatus: vehicle.durum,
        vehicleId: vehicle.id,
        selected,
        dimmed: hasVehicleSelection && !selected,
      })
    }

    if (shouldShowPlanningOrders(planningMapMode)) {
      const ordersForMap = shouldShowOnlySelectedOrders(planningMapMode)
        ? selectedOrders
        : filteredOrders

      for (const order of ordersForMap) {
        const selected = selectedOrderIds.has(order.id)
        points.push({
          id: `pickup-${order.id}`,
          lat: order.pickup.lat,
          lng: order.pickup.lng,
          kind: 'pickup',
          title: `Alım · ${order.takip_no}`,
          selected,
          dimmed: !selected,
          orderId: order.id,
        })
        points.push({
          id: `delivery-${order.id}`,
          lat: order.delivery.lat,
          lng: order.delivery.lng,
          kind: 'delivery',
          title: `Teslim · ${order.takip_no}`,
          selected,
          dimmed: !selected,
          orderId: order.id,
        })
      }
    }

    return points
  }, [
    result,
    step,
    selectedRouteId,
    planningMapMode,
    selectedActiveRouteIds,
    activeRoutes,
    filteredOrders,
    selectedOrderIds,
    selectedOrders,
    selectedVehicleIds,
    allVehicles,
    allOrders,
  ])

  const mapRoutes: OrchestratorMapRoute[] = useMemo(() => {
    if (step === 1 && shouldShowSelectedActiveRoutes(planningMapMode)) {
      return activeRoutes
        .filter((route) => selectedActiveRouteIds.has(route.id))
        .map((route) => ({
          id: route.id,
          color: route.color,
          polyline: route.polyline,
          emphasized: true,
        }))
    }
    if (!result || step < 2) return []
    return result.routes.map((route) => ({
      id: route.id,
      color: route.color,
      polyline: route.polyline,
      emphasized: selectedRouteId == null || selectedRouteId === route.id,
    }))
  }, [
    result,
    step,
    selectedRouteId,
    planningMapMode,
    selectedActiveRouteIds,
    activeRoutes,
  ])

  const mapEmphasizeRouteId =
    step === 1 && planningMapMode === 'bottom-only'
      ? selectedActiveRouteIds.size === 1
        ? [...selectedActiveRouteIds][0]
        : null
      : step === 1
        ? null
        : selectedRouteId

  /** Planlama seçimi ile aktif rota seçimi birbirini dışlar */
  const clearPlanningSelection = useCallback(() => {
    setSelectedOrderIds((prev) => (prev.size === 0 ? prev : new Set()))
    setSelectedVehicleIds((prev) => (prev.size === 0 ? prev : new Set()))
  }, [])

  const clearActiveRouteSelection = useCallback(() => {
    setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
    setDetailActiveRouteId(null)
  }, [])

  const handleOpenActiveRouteDetail = useCallback(
    (routeId: string) => {
      const route = activeRoutes.find((item) => item.id === routeId)
      if (route) {
        const scopeForRoute: ActiveRouteDateScope = activeRouteMatchesDateScope(
          route,
          'today'
        )
          ? 'today'
          : 'carryover'
        setActiveRouteDateScope(scopeForRoute)
      }
      // Sipariş seçimini koru — "Rotaya ekle" için hedef rota + havuz seçimi birlikte tutulur
      setSelectedVehicleIds((prev) => (prev.size === 0 ? prev : new Set()))
      setLeftOpen(false)
      setRightOpen(false)
      setSelectedActiveRouteIds((prev) => {
        if (prev.has(routeId) && prev.size === 1) return prev
        return new Set([routeId])
      })
      setDetailActiveRouteId(routeId)
      setResultPanelOpen(true)
      setResultPanelHeight(getDefaultResultPanelHeight('detail'))
      setMobilePanel('map')
    },
    [activeRoutes]
  )

  const initialRouteOpenedRef = useRef(false)
  useEffect(() => {
    if (!initialRouteId || initialRouteOpenedRef.current) return
    if (catalogLoading) return
    const exists = activeRoutes.some((route) => route.id === initialRouteId)
    if (!exists) return
    initialRouteOpenedRef.current = true
    handleOpenActiveRouteDetail(initialRouteId)
  }, [
    initialRouteId,
    catalogLoading,
    activeRoutes,
    handleOpenActiveRouteDetail,
  ])

  const handleMapPointClick = useCallback(
    (point: OrchestratorMapPoint) => {
      if (step !== 1) return

      if (
        (point.kind === 'pickup' || point.kind === 'delivery') &&
        point.orderId != null
      ) {
        // Harita pin seçiminde rota pin seçimini temizle; açık detayı koru (B akışı)
        setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
        setSelectedOrderIds((prev) => toggleId(prev, point.orderId!))
        setLeftOpen(true)
        setMobilePanel('orders')
        return
      }

      if (point.kind !== 'vehicle' || point.vehicleId == null) return

      // Boşta araç → planlama seçimine ekle / çıkar
      if (point.vehicleStatus === 'bos_ta') {
        const vehicle = allVehicles.find((item) => item.id === point.vehicleId)
        if (!vehicle?.selectable) {
          toast.message(vehicle?.disabledReason ?? 'Bu araç seçilemez')
          return
        }
        setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
        setSelectedVehicleIds((prev) => toggleId(prev, point.vehicleId!))
        setRightOpen(true)
        setMobilePanel('resources')
        return
      }

      // Aktif rotadaki araç → rota detayı
      if (point.vehicleStatus !== 'yolda') return
      const route = activeRoutes.find((item) => item.vehicleId === point.vehicleId)
      if (!route) return
      handleOpenActiveRouteDetail(route.id)
    },
    [step, activeRoutes, allVehicles, handleOpenActiveRouteDetail]
  )

  const handleCloseActiveRouteDetail = useCallback(() => {
    setDetailActiveRouteId(null)
    setResultPanelHeight(getDefaultResultPanelHeight('list'))
  }, [])

  const handleToggleOrder = useCallback((id: string) => {
    setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
    setSelectedOrderIds((prev) => toggleId(prev, id))
  }, [])

  const handleSelectAllOrders = useCallback(() => {
    setSelectedActiveRouteIds((prev) => (prev.size === 0 ? prev : new Set()))
    setSelectedOrderIds(new Set(filteredOrders.map((order) => order.id)))
  }, [filteredOrders])

  const handleToggleVehicle = useCallback(
    (id: string) => {
      const vehicle = allVehicles.find((item) => item.id === id)
      if (!vehicle?.selectable) {
        toast.message(vehicle?.disabledReason ?? 'Bu araç seçilemez')
        return
      }
      clearActiveRouteSelection()
      setSelectedVehicleIds((prev) => toggleId(prev, id))
    },
    [allVehicles, clearActiveRouteSelection]
  )

  const handleSelectAllVehicles = useCallback(() => {
    clearActiveRouteSelection()
    setSelectedVehicleIds(
      new Set(
        filteredVehicles
          .filter((vehicle) => vehicle.selectable)
          .map((vehicle) => vehicle.id)
      )
    )
  }, [clearActiveRouteSelection, filteredVehicles])

  const handleChangeRouteColor = useCallback(
    (routeId: string, color: string) => {
      setRouteColorById((prev) => ({ ...prev, [routeId]: color }))
      setSessionActiveRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId ? { ...route, color } : route
        )
      )
    },
    []
  )

  const handleToggleActiveRoute = useCallback(
    (id: string) => {
      clearPlanningSelection()
      setSelectedActiveRouteIds((prev) => {
        const next = toggleId(prev, id)
        // Haritadan kaldırılan rota detaydaysa detayı kapat
        setDetailActiveRouteId((current) =>
          current != null && !next.has(current) ? null : current
        )
        return next
      })
    },
    [clearPlanningSelection]
  )

  const applyOptimizeResultToUi = useCallback((next: OptimizeResult) => {
    const geometryWarnings = next.routes
      .filter((route) => isSparseRoadGeometry(route.polyline))
      .map(
        (route) =>
          `${route.vehiclePlate}: rota geometrisi seyrek (${route.polyline.length} nokta). Duraklardan yol uydurulmadı.`
      )
    const existing = new Set(next.warnings)
    const mergedWarnings = [
      ...next.warnings,
      ...geometryWarnings.filter((w) => !existing.has(w)),
    ]
    const withWarnings =
      mergedWarnings.length === next.warnings.length
        ? next
        : { ...next, warnings: mergedWarnings }

    setResult(withWarnings)
    setSelectedRouteId(null)
    setSelectedActiveRouteIds(new Set())
    setDetailActiveRouteId(null)
    setStep(2)
    setLeftOpen(false)
    setRightOpen(false)
    setResultPanelOpen(true)
    setResultPanelHeight(
      getDefaultResultPanelHeight('list', undefined, {
        hasAlerts:
          withWarnings.unmatchedOrderIds.length > 0 ||
          withWarnings.warnings.length > 0,
      })
    )
    setMobilePanel('map')
    undoStackRef.current = []
    setUndoStack([])

    if (geometryWarnings.length > 0) {
      toast.message(
        'Bazı rotalarda yol geometrisi seyrek; duraklardan çizgi üretilmedi.'
      )
    }
  }, [])

  const handleOptimize = () => {
    if (!canOptimize) {
      toast.message('En az bir sipariş ve bir geçerli araç seçin')
      return
    }

    if (isDemo) {
      setOptimizing(true)
      window.setTimeout(() => {
        const next = runMockOptimize({
          orders: selectedOrders,
          vehicles: selectedValidVehicles,
          settings,
          occupiedColors: activeRoutes.map((route) => route.color),
        })
        applyOptimizeResultToUi(next)
        setOptimizing(false)
        if (next.unmatchedOrderIds.length > 0) {
          const reasonSummary = summarizeUnmatchedReasons(next.unmatchedOrders)
          toast.message(
            next.routes.length === 0
              ? `Rota oluşturulamadı · ${next.unmatchedOrderIds.length} sipariş eşleşmedi${reasonSummary ? ` (${reasonSummary})` : ''}`
              : `${next.routes.length} rota oluşturuldu · ${next.unmatchedOrderIds.length} sipariş eşleşmedi${reasonSummary ? ` (${reasonSummary})` : ''}`
          )
        } else {
          toast.success(`${next.routes.length} rota optimize edildi`)
        }
      }, 450)
      return
    }

    setOptimizing(true)
    void (async () => {
      const customerId = optionalOptimizeCustomerId(
        selectedOrders.map((order) => order.id),
        selectedOrders
      )
      const created = await createOptimizeJob({
        operationDate,
        orderIds: selectedOrders.map((order) => order.id),
        vehicleIds: selectedValidVehicles.map((vehicle) => vehicle.id),
        settings,
        occupiedColors: activeRoutes.map((route) => route.color),
        ...(customerId ? { customerId } : {}),
      })
      if (!created.success) {
        setOptimizing(false)
        toast.error(created.error)
        return
      }

      setOptimizeJobId(created.data.jobId)

      const polled = await pollOptimizeJobUntilDone({
        jobId: created.data.jobId,
        vehicles: allVehicles,
      })
      setOptimizing(false)

      if (!polled.success || !polled.data.result) {
        toast.error(polled.success ? 'Optimizasyon sonucu boş.' : polled.error)
        return
      }

      setOptimizeJobVersion(polled.data.version)
      applyOptimizeResultToUi(polled.data.result)
      if (polled.data.result.unmatchedOrderIds.length > 0) {
        const reasonSummary = summarizeUnmatchedReasons(
          polled.data.result.unmatchedOrders
        )
        toast.message(
          polled.data.result.routes.length === 0
            ? `Rota oluşturulamadı · ${polled.data.result.unmatchedOrderIds.length} sipariş eşleşmedi${reasonSummary ? ` (${reasonSummary})` : ''}`
            : `${polled.data.result.routes.length} rota oluşturuldu · ${polled.data.result.unmatchedOrderIds.length} sipariş eşleşmedi${reasonSummary ? ` (${reasonSummary})` : ''}`
        )
      } else {
        toast.success(
          `${polled.data.result.routes.length} rota optimize edildi`
        )
      }
    })()
  }

  const handleCancelResult = () => {
    if (isDemo) {
      pushUndo('Optimizasyon sonucu iptal')
      clearOptimizePreviewUi()
      toast.message('Optimizasyon sonucu iptal edildi')
      return
    }

    if (!optimizeJobId) {
      clearOptimizePreviewUi()
      toast.message('Optimizasyon sonucu iptal edildi')
      return
    }

    // Preview is COMPLETED — reject-solution, never cancel finished job
    void (async () => {
      const rejected = await rejectOptimizeSolution({
        jobId: optimizeJobId,
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!rejected.success) {
        toast.error(rejected.error)
        return
      }
      clearOptimizePreviewUi()
      toast.message('Optimizasyon önerisi reddedildi')
    })()
  }

  const handleReturnToPlanning = () => {
    if (isDemo) {
      pushUndo('Planlama ekranına dönüş')
      clearOptimizePreviewUi()
      toast.message('Orkestratör ekranına dönüldü')
      return
    }

    if (!optimizeJobId) {
      clearOptimizePreviewUi()
      toast.message('Orkestratör ekranına dönüldü')
      return
    }

    void (async () => {
      const rejected = await rejectOptimizeSolution({
        jobId: optimizeJobId,
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!rejected.success) {
        toast.error(rejected.error)
        return
      }
      clearOptimizePreviewUi()
      toast.message('Orkestratör ekranına dönüldü')
    })()
  }

  function clearOptimizePreviewUi() {
    setOptimizeJobId(null)
    setOptimizeJobVersion(null)
    setResult(null)
    setSelectedRouteId(null)
    setSelectedActiveRouteIds(new Set())
    setDetailActiveRouteId(null)
    setStep(1)
    setLeftOpen(false)
    setRightOpen(false)
    setResultPanelOpen(true)
    setResultPanelHeight(getDefaultResultPanelHeight('list'))
  }

  const applyApprovedRoutes = (
    approved: ReturnType<typeof approveOptimizeResult>,
    remainingResult: OptimizeResult | null
  ) => {
    pushUndo(
      approved.approvedRoutes.length > 1
        ? `${approved.approvedRoutes.length} rota onaylandı`
        : `${approved.approvedRoutes[0]?.label ?? 'Rota'} onaylandı`
    )
    setAllOrders(approved.orders)
    setAllVehicles(approved.vehicles)
    setActiveRouteDateScope('today')
    setSessionActiveRoutes((prev) => {
      const vehicleIds = new Set(
        approved.approvedRoutes.map((route) => route.vehicleId)
      )
      const kept = prev.filter((route) => !vehicleIds.has(route.vehicleId))
      return [...kept, ...approved.approvedRoutes]
    })

    const approvedOrderIdSet = new Set(approved.approvedOrderIds)
    const approvedVehicleIdSet = new Set(approved.approvedVehicleIds)
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      for (const id of approvedOrderIdSet) next.delete(id)
      return next
    })
    setSelectedVehicleIds((prev) => {
      const next = new Set(prev)
      for (const id of approvedVehicleIdSet) next.delete(id)
      return next
    })

    setSelectedActiveRouteIds(
      new Set(approved.approvedRoutes.map((route) => route.id))
    )
    setDetailActiveRouteId(null)
    setSelectedRouteId(null)
    setLeftOpen(false)
    setRightOpen(false)
    setResultPanelOpen(true)
    setMobilePanel('map')

    if (remainingResult && remainingResult.routes.length > 0) {
      setResult(remainingResult)
      setStep(2)
      setResultPanelHeight(
        getDefaultResultPanelHeight('list', undefined, {
          hasAlerts:
            remainingResult.unmatchedOrderIds.length > 0 ||
            remainingResult.warnings.length > 0,
        })
      )
    } else {
      setResult(null)
      setStep(1)
      setResultPanelHeight(getDefaultResultPanelHeight('list'))
    }

    toast.success(
      `${approved.approvedRoutes.length} rota aktif listeye alındı · ${approved.approvedOrderIds.length} sipariş planlandı`
    )
  }

  const handleApproveAll = () => {
    if (!result) return

    if (isDemo) {
      const approved = approveOptimizeResult({
        result,
        orders: allOrders,
        vehicles: allVehicles,
        existingActiveRoutes: activeRoutes,
        operationDate,
      })
      applyApprovedRoutes(approved, null)
      return
    }

    if (!optimizeJobId) {
      toast.error('Onay için optimize job bulunamadı')
      return
    }

    void (async () => {
      const applied = await applyOptimizeSolution({
        jobId: optimizeJobId,
        operationDate,
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!applied.success) {
        toast.error(applied.error)
        return
      }

      setOptimizeJobId(applied.data.jobId)
      setOptimizeJobVersion(applied.data.version)
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of applied.data.approvedOrderIds) next.delete(id)
        return next
      })
      setSelectedVehicleIds((prev) => {
        const next = new Set(prev)
        for (const id of applied.data.approvedVehicleIds) next.delete(id)
        return next
      })
      setSelectedActiveRouteIds(
        new Set(applied.data.approvedRoutes.map((route) => route.id))
      )
      setDetailActiveRouteId(null)
      setSelectedRouteId(null)
      setActiveRouteDateScope('today')

      const remaining = applied.data.remainingResult
      if (remaining && remaining.routes.length > 0) {
        // Child job + new route ids — no refetch needed
        applyOptimizeResultToUi(remaining)
      } else if (remaining == null && applied.data.jobId) {
        // Legacy fallback when BE omitted remainingResult
        const nextJob = await pollOptimizeJobUntilDone({
          jobId: applied.data.jobId,
          vehicles: allVehicles,
        })
        if (nextJob.success && nextJob.data.result) {
          setOptimizeJobId(applied.data.jobId)
          setOptimizeJobVersion(nextJob.data.version)
          applyOptimizeResultToUi(nextJob.data.result)
        } else {
          setOptimizeJobId(null)
          setOptimizeJobVersion(null)
          setResult(null)
          setStep(1)
          setResultPanelOpen(true)
          setResultPanelHeight(getDefaultResultPanelHeight('list'))
        }
      } else {
        setOptimizeJobId(null)
        setOptimizeJobVersion(null)
        setResult(null)
        setStep(1)
        setResultPanelOpen(true)
        setResultPanelHeight(getDefaultResultPanelHeight('list'))
      }

      await refreshLiveCatalog()
      toast.success(
        `${applied.data.approvedRoutes.length} rota onaylandı · ${applied.data.approvedOrderIds.length} sipariş planlandı`
      )
    })()
  }

  const handleApproveRoute = (routeId: string) => {
    if (!result) return

    if (isDemo) {
      const approved = approveOptimizeResult({
        result,
        orders: allOrders,
        vehicles: allVehicles,
        existingActiveRoutes: activeRoutes,
        operationDate,
        routeIds: [routeId],
      })
      const remainingRoutes = result.routes.filter((route) => route.id !== routeId)
      const remaining: OptimizeResult = {
        ...result,
        routes: remainingRoutes,
        totals: {
          ...result.totals,
          vehicleCount: remainingRoutes.length,
          orderCount: remainingRoutes.reduce(
            (sum, route) => sum + route.orderIds.length,
            0
          ),
          stopCount: remainingRoutes.reduce((sum, route) => sum + route.stopCount, 0),
          distanceKm:
            Math.round(
              remainingRoutes.reduce((sum, route) => sum + route.distanceKm, 0) * 10
            ) / 10,
          durationMin: remainingRoutes.reduce(
            (sum, route) => sum + route.durationMin,
            0
          ),
        },
      }
      applyApprovedRoutes(approved, remaining)
      return
    }

    if (!optimizeJobId) {
      toast.error('Onay için optimize job bulunamadı')
      return
    }

    void (async () => {
      const applied = await applyOptimizeSolution({
        jobId: optimizeJobId,
        operationDate,
        routeIds: [routeId],
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!applied.success) {
        toast.error(applied.error)
        return
      }

      setOptimizeJobId(applied.data.jobId)
      setOptimizeJobVersion(applied.data.version)
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of applied.data.approvedOrderIds) next.delete(id)
        return next
      })
      setSelectedVehicleIds((prev) => {
        const next = new Set(prev)
        for (const id of applied.data.approvedVehicleIds) next.delete(id)
        return next
      })
      setSelectedActiveRouteIds(
        new Set(applied.data.approvedRoutes.map((route) => route.id))
      )
      setDetailActiveRouteId(null)
      setSelectedRouteId(null)
      setActiveRouteDateScope('today')

      const remaining = applied.data.remainingResult
      if (remaining && remaining.routes.length > 0) {
        applyOptimizeResultToUi(remaining)
      } else if (remaining == null && applied.data.jobId) {
        const nextJob = await pollOptimizeJobUntilDone({
          jobId: applied.data.jobId,
          vehicles: allVehicles,
        })
        if (nextJob.success && nextJob.data.result) {
          setOptimizeJobId(applied.data.jobId)
          setOptimizeJobVersion(nextJob.data.version)
          applyOptimizeResultToUi(nextJob.data.result)
        } else {
          setOptimizeJobId(null)
          setOptimizeJobVersion(null)
          setResult(null)
          setStep(1)
          setResultPanelOpen(true)
          setResultPanelHeight(getDefaultResultPanelHeight('list'))
        }
      } else {
        setOptimizeJobId(null)
        setOptimizeJobVersion(null)
        setResult(null)
        setStep(1)
        setResultPanelOpen(true)
        setResultPanelHeight(getDefaultResultPanelHeight('list'))
      }

      await refreshLiveCatalog()
      toast.success(
        `${applied.data.approvedRoutes.length} rota onaylandı · ${applied.data.approvedOrderIds.length} sipariş planlandı`
      )
    })()
  }

  const handleRejectRoute = (routeId: string) => {
    if (!result) return
    const rejected = result.routes.find((route) => route.id === routeId)
    if (!rejected) return

    if (isDemo) {
      pushUndo(`${rejected.vehiclePlate} rotası reddedildi`)

      const remainingRoutes = result.routes.filter((route) => route.id !== routeId)
      setResult({
        ...result,
        routes: remainingRoutes,
        totals: {
          ...result.totals,
          vehicleCount: remainingRoutes.length,
          orderCount: remainingRoutes.reduce(
            (sum, route) => sum + route.orderIds.length,
            0
          ),
          stopCount: remainingRoutes.reduce((sum, route) => sum + route.stopCount, 0),
          distanceKm:
            Math.round(
              remainingRoutes.reduce((sum, route) => sum + route.distanceKm, 0) * 10
            ) / 10,
          durationMin: remainingRoutes.reduce(
            (sum, route) => sum + route.durationMin,
            0
          ),
        },
      })
      setSelectedRouteId((current) => (current === routeId ? null : current))
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of rejected.orderIds) next.add(id)
        return next
      })

      toast.message(
        `${rejected.vehiclePlate} reddedildi · ${rejected.orderIds.length} sipariş havuza döndü`
      )

      if (remainingRoutes.length === 0 && result.unmatchedOrderIds.length === 0) {
        setResult(null)
        setStep(1)
        setResultPanelHeight(getDefaultResultPanelHeight('list'))
      }
      return
    }

    if (!optimizeJobId) {
      toast.error('Reddetmek için optimize job bulunamadı')
      return
    }

    void (async () => {
      const rejectedRes = await rejectOptimizeSolution({
        jobId: optimizeJobId,
        routeIds: [routeId],
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!rejectedRes.success) {
        toast.error(rejectedRes.error)
        return
      }

      setSelectedRouteId((current) => (current === routeId ? null : current))
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of rejected.orderIds) next.add(id)
        return next
      })

      // Keep job cursor current for chained rejects (no refetch required)
      if (rejectedRes.data.jobId) {
        setOptimizeJobId(rejectedRes.data.jobId)
      }
      if (rejectedRes.data.version != null) {
        setOptimizeJobVersion(rejectedRes.data.version)
      }

      const remaining = rejectedRes.data.remainingResult
      if (remaining && remaining.routes.length > 0) {
        setResult(remaining)
        toast.message(
          `${rejected.vehiclePlate} reddedildi · ${rejected.orderIds.length} sipariş havuza döndü`
        )
      } else {
        setOptimizeJobId(null)
        setOptimizeJobVersion(null)
        setResult(null)
        setStep(1)
        setResultPanelHeight(getDefaultResultPanelHeight('list'))
        toast.message(
          `${rejected.vehiclePlate} reddedildi · ${rejected.orderIds.length} sipariş havuza döndü`
        )
      }
    })()
  }

  const upsertSessionActiveRoute = useCallback((route: OrchestratorActiveRoute) => {
    setSessionActiveRoutes((prev) => {
      const next = prev.filter(
        (item) => item.id !== route.id && item.vehicleId !== route.vehicleId
      )
      next.push(route)
      return next
    })
    setHiddenActiveRouteIds((prev) => {
      if (!prev.has(route.id)) return prev
      const next = new Set(prev)
      next.delete(route.id)
      return next
    })
  }, [])

  const pushUndo = useCallback(
    (label: string) => {
      const snapshot = structuredClone({
        label,
        allOrders,
        allVehicles,
        sessionActiveRoutes,
        hiddenActiveRouteIds: [...hiddenActiveRouteIds],
        selectedOrderIds: [...selectedOrderIds],
        selectedVehicleIds: [...selectedVehicleIds],
        selectedActiveRouteIds: [...selectedActiveRouteIds],
        activeRouteDateScope,
        result,
        step,
        selectedRouteId,
        detailActiveRouteId,
        leftOpen,
        rightOpen,
        resultPanelOpen,
        resultPanelHeight,
      })
      const next = pushOrchestratorUndo(undoStackRef.current, { label, snapshot })
      undoStackRef.current = next
      setUndoStack(next)
    },
    [
      allOrders,
      allVehicles,
      sessionActiveRoutes,
      hiddenActiveRouteIds,
      selectedOrderIds,
      selectedVehicleIds,
      selectedActiveRouteIds,
      activeRouteDateScope,
      result,
      step,
      selectedRouteId,
      detailActiveRouteId,
      leftOpen,
      rightOpen,
      resultPanelOpen,
      resultPanelHeight,
    ]
  )

  const handleUndo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const entry = stack[stack.length - 1]!
    const snapshot = entry.snapshot
    const next = stack.slice(0, -1)
    undoStackRef.current = next
    setUndoStack(next)

    setAllOrders(snapshot.allOrders)
    setAllVehicles(snapshot.allVehicles)
    setSessionActiveRoutes(snapshot.sessionActiveRoutes)
    setHiddenActiveRouteIds(new Set(snapshot.hiddenActiveRouteIds))
    setSelectedOrderIds(new Set(snapshot.selectedOrderIds))
    setSelectedVehicleIds(new Set(snapshot.selectedVehicleIds))
    setSelectedActiveRouteIds(new Set(snapshot.selectedActiveRouteIds))
    setActiveRouteDateScope(snapshot.activeRouteDateScope)
    setResult(snapshot.result)
    setStep(snapshot.step)
    setSelectedRouteId(snapshot.selectedRouteId)
    setDetailActiveRouteId(snapshot.detailActiveRouteId)
    setLeftOpen(snapshot.leftOpen)
    setRightOpen(snapshot.rightOpen)
    setResultPanelOpen(snapshot.resultPanelOpen)
    setResultPanelHeight(snapshot.resultPanelHeight)
    setReoptimizeDraft(null)
    toast.message(`Geri alındı · ${entry.label}`)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (!(event.metaKey || event.ctrlKey) || key !== 'z' || event.shiftKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      if (undoStackRef.current.length === 0) return
      event.preventDefault()
      handleUndo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo])

  const handlePreviewAddToActiveRoute = () => {
    if (!addToRouteTargetId || selectedOrders.length === 0) return
    const route = activeRoutes.find((item) => item.id === addToRouteTargetId)
    if (!route) {
      toast.error('Hedef rota bulunamadı')
      return
    }
    const vehicle = allVehicles.find((item) => item.id === route.vehicleId)
    if (!vehicle) {
      toast.error('Rota aracı bulunamadı')
      return
    }

    if (isDemo) {
      const draft = reoptimizeActiveRouteRemaining({
        route,
        vehicle,
        newOrders: selectedOrders,
        orderCatalog: allOrders,
        settings,
      })
      setReoptimizeDraft(draft)
      return
    }

    void (async () => {
      const preview = await previewReoptimizeActiveRoute({
        route,
        orderIds: selectedOrders.map((order) => order.id),
        orders: allOrders,
        vehicles: allVehicles,
        settings,
      })
      if (!preview.success) {
        toast.error(preview.error)
        return
      }
      setReoptimizeDraft(preview.data)
    })()
  }

  const handleApplyReoptimize = () => {
    if (!reoptimizeDraft) return
    const { route, assignedOrderIds, previewToken } = reoptimizeDraft

    if (isDemo) {
      const assignedSet = new Set(assignedOrderIds)
      pushUndo(`${assignedOrderIds.length} sipariş ${route.label} rotasına eklendi`)
      upsertSessionActiveRoute(route)
      setAllOrders((prev) =>
        prev.map((order) =>
          assignedSet.has(order.id)
            ? {
                ...order,
                durum: 'yolda' as const,
                atanan_arac: route.vehiclePlate,
                atanan_kurye: route.courierName,
              }
            : order
        )
      )
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of assignedOrderIds) next.delete(id)
        return next
      })
      setSelectedActiveRouteIds(new Set([route.id]))
      setDetailActiveRouteId(route.id)
      setResultPanelOpen(true)
      setReoptimizeDraft(null)
      toast.success(
        `${assignedOrderIds.length} sipariş ${route.label} rotasına eklendi · kalan optimize edildi`
      )
      return
    }

    void (async () => {
      const applied = await applyReoptimizeActiveRoute({
        routeId: route.id,
        previewToken,
        orderIds: assignedOrderIds,
        settings,
        version: route.version,
      })
      if (!applied.success) {
        toast.error(applied.error)
        return
      }
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const id of assignedOrderIds) next.delete(id)
        return next
      })
      setSelectedActiveRouteIds(new Set([route.id]))
      setDetailActiveRouteId(route.id)
      setResultPanelOpen(true)
      setReoptimizeDraft(null)
      await refreshLiveCatalog()
      toast.success(
        `${assignedOrderIds.length} sipariş ${route.label} rotasına eklendi · kalan optimize edildi`
      )
    })()
  }

  const handleRemoveOrderFromPending = (routeId: string, orderId: string) => {
    if (!result) return
    const route = result.routes.find((item) => item.id === routeId)
    if (!route) return

    if (isDemo) {
      const outcome = removeOrderFromPendingRoute(route, orderId)
      pushUndo('Sipariş onay bekleyen rotadan çıkarıldı')

      if (outcome.kind === 'empty') {
        const remainingRoutes = result.routes.filter((item) => item.id !== routeId)
        setResult({
          ...result,
          routes: remainingRoutes,
          totals: {
            ...result.totals,
            vehicleCount: remainingRoutes.length,
            orderCount: remainingRoutes.reduce(
              (sum, item) => sum + item.orderIds.length,
              0
            ),
            stopCount: remainingRoutes.reduce((sum, item) => sum + item.stopCount, 0),
            distanceKm:
              Math.round(
                remainingRoutes.reduce((sum, item) => sum + item.distanceKm, 0) * 10
              ) / 10,
            durationMin: remainingRoutes.reduce(
              (sum, item) => sum + item.durationMin,
              0
            ),
          },
        })
        setSelectedRouteId(null)
      } else {
        setResult({
          ...result,
          routes: result.routes.map((item) =>
            item.id === routeId ? outcome.route : item
          ),
        })
      }

      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        next.add(orderId)
        return next
      })
      toast.message('Sipariş rotadan çıkarıldı · havuza döndü')
      return
    }

    if (!optimizeJobId) {
      toast.error('Job bulunamadı')
      return
    }

    void (async () => {
      const removed = await removeOrdersFromPendingRoute({
        jobId: optimizeJobId,
        routeId,
        orderIds: [orderId],
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!removed.success) {
        toast.error(removed.error)
        return
      }
      setOptimizeJobVersion(removed.data.version)
      setResult(removed.data.result)
      if (removed.data.result.routes.length === 0) {
        setSelectedRouteId(null)
        setStep(1)
      }
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        next.add(orderId)
        return next
      })
      toast.message('Sipariş rotadan çıkarıldı · havuza döndü')
    })()
  }

  const handleRemoveOrderFromActive = (routeId: string, orderId: string) => {
    const route = activeRoutes.find((item) => item.id === routeId)
    if (!route) return

    if (isDemo) {
      const outcome = removeOrderFromActiveRoute(route, orderId)
      if (outcome.kind === 'blocked') {
        toast.error(outcome.reason)
        return
      }
      pushUndo('Sipariş aktif rotadan çıkarıldı')

      if (outcome.kind === 'empty') {
        setSessionActiveRoutes((prev) => prev.filter((item) => item.id !== routeId))
        setHiddenActiveRouteIds((prev) => new Set(prev).add(routeId))
        setDetailActiveRouteId((current) => (current === routeId ? null : current))
        setSelectedActiveRouteIds((prev) => {
          if (!prev.has(routeId)) return prev
          const next = new Set(prev)
          next.delete(routeId)
          return next
        })
      } else {
        upsertSessionActiveRoute(outcome.route)
      }

      setAllOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                durum: 'atama_bekliyor' as const,
                atanan_arac: null,
                atanan_kurye: null,
              }
            : order
        )
      )
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        next.add(orderId)
        return next
      })
      toast.message('Sipariş aktif rotadan çıkarıldı · havuza döndü')
      return
    }

    void (async () => {
      const removed = await removeOrdersFromActiveRouteApi({
        routeId,
        orderIds: [orderId],
        version: route.version,
      })
      if (!removed.success) {
        toast.error(removed.error)
        return
      }
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        next.add(orderId)
        return next
      })
      await refreshLiveCatalog()
      toast.message('Sipariş aktif rotadan çıkarıldı · havuza döndü')
    })()
  }

  const handleReorderPendingStops = (
    routeId: string,
    orderedStopIds: string[]
  ) => {
    if (!result) return

    if (isDemo) {
      pushUndo('Onay bekleyen durak sırası değişti')
      setResult({
        ...result,
        routes: result.routes.map((route) =>
          route.id === routeId
            ? reorderPendingRouteStops(route, orderedStopIds)
            : route
        ),
      })
      return
    }

    if (!optimizeJobId) {
      toast.error('Job bulunamadı')
      return
    }

    void (async () => {
      const reordered = await reorderPendingRouteStopsApi({
        jobId: optimizeJobId,
        routeId,
        orderedStopIds,
        version: optimizeJobVersion ?? undefined,
        vehicles: allVehicles,
      })
      if (!reordered.success) {
        toast.error(reordered.error)
        return
      }
      setOptimizeJobVersion(reordered.data.version)
      setResult(reordered.data.result)
    })()
  }

  const handleReorderActiveStops = (
    routeId: string,
    orderedStopIds: string[]
  ) => {
    const route = activeRoutes.find((item) => item.id === routeId)
    if (!route) return

    if (isDemo) {
      pushUndo('Aktif rota durak sırası değişti')
      upsertSessionActiveRoute(reorderActiveRouteStops(route, orderedStopIds))
      return
    }

    void (async () => {
      const reordered = await reorderActiveRouteStopsApi({
        routeId,
        orderedStopIds,
        version: route.version,
      })
      if (!reordered.success) {
        toast.error(reordered.error)
        return
      }
      await refreshLiveCatalog()
    })()
  }

  const handleSelectRoute = (routeId: string | null) => {
    setSelectedRouteId(routeId)
    if (routeId == null && result) {
      setResultPanelHeight(
        getDefaultResultPanelHeight('list', undefined, {
          hasAlerts:
            result.unmatchedOrderIds.length > 0 || result.warnings.length > 0,
        })
      )
    }
  }

  const panelShell =
    'flex min-h-0 flex-col overflow-hidden border-border bg-card shadow-sm'

  return (
    <>
      <ReoptimizePreviewDialog
        open={reoptimizeDraft != null}
        preview={reoptimizeDraft?.preview ?? null}
        onOpenChange={(open) => {
          if (!open) setReoptimizeDraft(null)
        }}
        onApply={handleApplyReoptimize}
      />

      {headerOpen ? (
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Planlama' },
            { label: isDemo ? 'Orkestratör Demo' : 'Orkestratör' },
          ]}
          searchPlaceholder='Lastmile ara...'
          searchShortcut={<>⌘K</>}
        />
      ) : null}

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        {/* Mobile panel switcher */}
        {!showOptimizationPanel ? (
          <div className='flex shrink-0 gap-1 border-b border-border bg-slate-50 px-3 py-2 lg:hidden'>
          {(
            [
              ['orders', 'Siparişler'],
              ['map', 'Harita'],
              ['resources', 'Kaynaklar'],
            ] as const
          ).map(([id, label]) => {
            const tabLocked = sidePanelsLocked && id !== 'map'
            return (
            <button
              key={id}
              type='button'
              disabled={tabLocked}
              onClick={() => {
                if (!tabLocked) setMobilePanel(id)
              }}
              className={cn(
                'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium',
                tabLocked && 'cursor-not-allowed opacity-45',
                mobilePanel === id
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              {label}
            </button>
            )
          })}
          </div>
        ) : null}

        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <div className='relative h-full min-h-0'>
            {/* Left panel — desktop */}
            <aside
              style={{ zIndex: 800 }}
              className={cn(
                panelShell,
                'absolute inset-y-3 left-3 hidden rounded-xl border transition-[width,opacity] lg:flex',
                sidePanelTogglesVisible && leftOpen && !sidePanelsLocked
                  ? 'w-[340px] opacity-100 xl:w-[380px]'
                  : 'pointer-events-none w-0 border-0 opacity-0 shadow-none'
              )}
            >
              {leftPanelExpanded ? (
                <OrderPoolPanel
                  orders={planningBase}
                  filteredOrders={filteredOrders}
                  selectedIds={selectedOrderIdList}
                  search={orderSearch}
                  orderType={orderTypeFilter}
                  routeType={routeTypeFilter}
                  customerFilter={customerFilter}
                  operationDate={operationDate}
                  onSearchChange={setOrderSearch}
                  onToggleOrder={handleToggleOrder}
                  onSelectAllVisible={handleSelectAllOrders}
                  onClearSelection={() => setSelectedOrderIds(new Set())}
                  onOrderTypeChange={setOrderTypeFilter}
                  onRouteTypeChange={setRouteTypeFilter}
                  onCustomerFilterChange={setCustomerFilter}
                  onOperationDateChange={setOperationDate}
                />
              ) : null}
            </aside>

            {/* Map */}
            <section
              ref={mapSectionRef}
              className={cn(
                'absolute inset-0 min-h-0 min-w-0 bg-slate-100',
                mobilePanel !== 'map' && 'hidden lg:block'
              )}
            >
              <OrchestratorMapHost
                points={mapPoints}
                routes={mapRoutes}
                emphasizeRouteId={mapEmphasizeRouteId}
                onPointClick={handleMapPointClick}
                className='h-full'
              />

              {showOptimizationPanel &&
              result &&
              result.routes.length === 0 &&
              (result.unmatchedOrders?.length ?? 0) > 0 ? (
                <div
                  className='pointer-events-none absolute inset-x-0 top-14 flex justify-center px-3 lg:top-3'
                  style={{ zIndex: 950 }}
                >
                  <div className='max-w-md rounded-xl border border-rose-200/80 bg-rose-50/95 px-3 py-2 text-center text-xs font-medium text-rose-900 shadow-sm backdrop-blur-sm'>
                    Rota oluşturulamadı — eşleşmeyen siparişleri alt panelde inceleyin
                  </div>
                </div>
              ) : null}

              <div
                className='pointer-events-none absolute inset-x-0 top-3'
                style={{ zIndex: 900 }}
              >
                <div
                  className={cn(
                    'pointer-events-auto absolute hidden transition-[top,left] lg:flex',
                    sidePanelTogglesVisible && leftOpen && !sidePanelsLocked
                      ? 'top-10 left-[336px] xl:left-[376px]'
                      : 'top-0 left-4'
                  )}
                >
                  {sidePanelTogglesVisible ? (
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      disabled={sidePanelsLocked}
                      className={cn(
                        'shadow-lg transition-all',
                        sidePanelsLocked
                          ? 'size-8 cursor-not-allowed rounded-lg border-slate-200/80 bg-white/80 text-slate-400 opacity-45 shadow-none'
                          : leftOpen
                            ? 'size-8 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'size-10 rounded-lg border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
                      )}
                      onClick={() => setLeftOpen((v) => !v)}
                      aria-label={
                        sidePanelsLocked
                          ? 'Aktif rota listesi açıkken sipariş paneli kullanılamaz'
                          : leftOpen
                            ? 'Sol paneli gizle'
                            : 'Sol paneli aç'
                      }
                      title={
                        sidePanelsLocked
                          ? 'Aktif rota listesi açıkken sipariş paneli kullanılamaz'
                          : leftOpen
                            ? 'Sipariş panelini gizle'
                            : 'Sipariş panelini aç'
                      }
                    >
                      {leftOpen && !sidePanelsLocked ? (
                        <PanelLeftClose className='size-4' />
                      ) : (
                        <PanelLeftOpen className='size-4' />
                      )}
                    </Button>
                  ) : null}
                </div>

                <div
                  ref={mapToolbarRef}
                  className='pointer-events-auto absolute top-0 left-1/2 -translate-x-1/2'
                >
                  {mapToolbarOpen ? (
                    <div
                      className={cn(
                        'inline-flex max-w-[calc(100vw-4rem)] shrink-0 items-center gap-2 whitespace-nowrap text-xs',
                        step === 3
                          ? 'p-0'
                          : 'rounded-2xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur'
                      )}
                    >
                      {!showOptimizationPanel &&
                      (hasMapRouteDisplay || hasPlanningSelection) ? (
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-1 pl-2.5 ring-1',
                            hasMapRouteDisplay && hasPlanningSelection
                              ? 'bg-emerald-50/90 text-emerald-950 ring-emerald-200/70'
                              : hasMapRouteDisplay
                                ? 'bg-emerald-50/90 text-emerald-900 ring-emerald-200/70'
                                : 'bg-sky-50/90 text-sky-900 ring-sky-200/70'
                          )}
                        >
                          <span>
                            {hasMapRouteDisplay ? (
                              <>
                                Haritada{' '}
                                <strong className='font-semibold tabular-nums'>
                                  {mapRouteDisplayCount}
                                </strong>{' '}
                                rota
                              </>
                            ) : null}
                            {hasMapRouteDisplay && selectedOrders.length > 0
                              ? ' ve '
                              : null}
                            {selectedOrders.length > 0 ? (
                              <>
                                Seçili{' '}
                                <strong className='font-semibold tabular-nums'>
                                  {selectedOrders.length}
                                </strong>{' '}
                                sipariş
                              </>
                            ) : null}
                            {selectedValidVehicles.length > 0 ? (
                              <>
                                {hasMapRouteDisplay || selectedOrders.length > 0
                                  ? ' · '
                                  : 'Seçili '}
                                <strong className='font-semibold tabular-nums'>
                                  {selectedValidVehicles.length}
                                </strong>{' '}
                                araç
                              </>
                            ) : null}
                          </span>
                          <button
                            type='button'
                            onClick={() => {
                              if (hasMapRouteDisplay) clearActiveRouteSelection()
                              if (hasPlanningSelection) clearPlanningSelection()
                            }}
                            className={cn(
                              'inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2',
                              hasMapRouteDisplay
                                ? 'text-emerald-700/80 hover:bg-emerald-100 hover:text-emerald-950 focus-visible:ring-emerald-400/50'
                                : 'text-sky-700/80 hover:bg-sky-100 hover:text-sky-950 focus-visible:ring-sky-400/50'
                            )}
                            title='Seçimleri temizle'
                            aria-label='Seçimleri temizle'
                          >
                            <X className='size-3' aria-hidden />
                          </button>
                        </span>
                      ) : null}

                      {step === 1 ? (
                          <>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setHeaderOpen((open) => !open)}
                              title={headerOpen ? 'Header alanını gizle' : 'Header alanını göster'}
                              aria-label={
                                headerOpen ? 'Header alanını gizle' : 'Header alanını göster'
                              }
                            >
                              {headerOpen ? (
                                <ChevronUp className='size-3.5' />
                              ) : (
                                <ChevronDown className='size-3.5' />
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setMapVisibilityHelpOpen(true)}
                              title='Orkestratör Bilgi'
                              aria-label='Orkestratör Bilgi'
                            >
                              <Info className='size-3.5' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setSettingsOpen(true)}
                              title='Optimizasyon ayarları'
                              aria-label='Optimizasyon ayarları'
                            >
                              <Settings2 className='size-3.5' />
                            </Button>
                            {canPreviewAddToRoute ? (
                              <Button
                                type='button'
                                size='sm'
                                variant='secondary'
                                onClick={handlePreviewAddToActiveRoute}
                              >
                                Rotaya ekle
                              </Button>
                            ) : null}
                            {undoStack.length > 0 ? (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='h-8'
                                onClick={handleUndo}
                                title={`Geri al · ${undoStack[undoStack.length - 1]!.label}`}
                              >
                                <Undo2 className='size-3.5' aria-hidden />
                                Geri al
                              </Button>
                            ) : null}
                            <Button
                              type='button'
                              size='sm'
                              disabled={!canOptimize}
                              onClick={handleOptimize}
                            >
                              <Play className='size-3.5' />
                              {optimizing ? 'Optimizasyon…' : 'Optimize Et'}
                            </Button>
                          </>
                        ) : step === 2 ? (
                          <>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setHeaderOpen((open) => !open)}
                              title={headerOpen ? 'Header alanını gizle' : 'Header alanını göster'}
                              aria-label={
                                headerOpen ? 'Header alanını gizle' : 'Header alanını göster'
                              }
                            >
                              {headerOpen ? (
                                <ChevronUp className='size-3.5' />
                              ) : (
                                <ChevronDown className='size-3.5' />
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setMapVisibilityHelpOpen(true)}
                              title='Orkestratör Bilgi'
                              aria-label='Orkestratör Bilgi'
                            >
                              <Info className='size-3.5' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={() => setSettingsOpen(true)}
                              title='Optimizasyon ayarları'
                              aria-label='Optimizasyon ayarları'
                            >
                              <Settings2 className='size-3.5' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={handleOptimize}
                              disabled={!canOptimize}
                              title='Yeniden optimize et'
                              aria-label='Yeniden optimize et'
                            >
                              <RotateCcw className='size-3.5' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-8 rounded-full bg-white'
                              onClick={handleCancelResult}
                              title='Öneriyi reddet'
                              aria-label='Öneriyi reddet'
                            >
                              <XCircle className='size-3.5' />
                            </Button>
                            {undoStack.length > 0 ? (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='h-8'
                                onClick={handleUndo}
                                title={`Geri al · ${undoStack[undoStack.length - 1]!.label}`}
                              >
                                <Undo2 className='size-3.5' aria-hidden />
                                Geri al
                              </Button>
                            ) : null}
                            <Button
                              type='button'
                              size='sm'
                              onClick={handleApproveAll}
                              disabled={!result || result.routes.length === 0}
                              title={
                                result && result.routes.length === 0
                                  ? 'Onaylanacak rota yok'
                                  : 'Tümünü onayla'
                              }
                            >
                              <CheckCircle2 className='size-3.5' />
                              Tümünü onayla
                            </Button>
                          </>
                        ) : (
                          <div className='inline-flex h-10 items-stretch overflow-hidden rounded-full shadow-lg ring-1 ring-black/8'>
                            <span className='inline-flex items-center gap-2 rounded-l-full bg-primary px-4 text-xs font-semibold tracking-tight text-primary-foreground'>
                              <span className='animate-approval-icon motion-reduce:animate-none flex size-5 items-center justify-center rounded-full bg-primary-foreground/12'>
                                <CheckCircle2 className='size-3.5' strokeWidth={2.5} aria-hidden />
                              </span>
                              Onaylandı
                            </span>
                            <button
                              type='button'
                              onClick={handleReturnToPlanning}
                              className='inline-flex items-center gap-1.5 rounded-r-full bg-secondary px-4 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/90'
                            >
                              Orkestratör&apos;e Geri Dön
                              <ArrowRight className='size-3.5 opacity-80' aria-hidden />
                            </button>
                          </div>
                        )}

                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-8 shrink-0 rounded-full bg-white'
                        onClick={() => setMapToolbarOpen(false)}
                        title='Araç çubuğunu gizle'
                        aria-label='Araç çubuğunu gizle'
                      >
                        <PanelTopClose className='size-3.5' />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      className='size-10 rounded-full border-white/70 bg-white/95 shadow-lg backdrop-blur hover:bg-white'
                      onClick={() => setMapToolbarOpen(true)}
                      title='Araç çubuğunu göster'
                      aria-label='Araç çubuğunu göster'
                    >
                      <PanelTopOpen className='size-4' />
                    </Button>
                  )}
                </div>

                <div
                  className={cn(
                    'pointer-events-auto absolute hidden transition-[top,right] lg:flex',
                    sidePanelTogglesVisible && rightOpen && !sidePanelsLocked
                      ? 'top-10 right-[316px] xl:right-[356px]'
                      : 'top-0 right-4'
                  )}
                >
                  {sidePanelTogglesVisible ? (
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      disabled={sidePanelsLocked}
                      className={cn(
                        'shadow-lg transition-all',
                        sidePanelsLocked
                          ? 'size-8 cursor-not-allowed rounded-lg border-slate-200/80 bg-white/80 text-slate-400 opacity-45 shadow-none'
                          : rightOpen
                            ? 'size-8 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'size-10 rounded-lg border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
                      )}
                      onClick={() => setRightOpen((v) => !v)}
                      aria-label={
                        sidePanelsLocked
                          ? 'Aktif rota listesi açıkken kaynak paneli kullanılamaz'
                          : rightOpen
                            ? 'Sağ paneli gizle'
                            : 'Sağ paneli aç'
                      }
                      title={
                        sidePanelsLocked
                          ? 'Aktif rota listesi açıkken kaynak paneli kullanılamaz'
                          : rightOpen
                            ? 'Kaynak panelini gizle'
                            : 'Kaynak panelini aç'
                      }
                    >
                      {rightOpen && !sidePanelsLocked ? (
                        <PanelRightClose className='size-4' />
                      ) : (
                        <PanelRightOpen className='size-4' />
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>

              {showBottomPanel ? (
                <div
                  className={cn(
                    'pointer-events-none absolute inset-x-3 bottom-3 z-850 flex flex-col items-center sm:inset-x-4 lg:inset-x-6 lg:bottom-4',
                    'transition-transform duration-300 ease-out',
                    resultPanelOpen
                      ? 'translate-y-0'
                      : 'translate-y-[calc(100%-2.5rem)]'
                  )}
                >
                  <div className='pointer-events-auto flex w-full flex-col items-center'>
                    <ResultPanelToggle
                      open={resultPanelOpen}
                      anchorRef={mapSectionRef}
                      onToggle={() => setResultPanelOpen((open) => !open)}
                      onHeightChange={setClampedResultPanelHeight}
                      onDraggingChange={setResultPanelDragging}
                    />
                  </div>

                  <ResultPanelShell
                    open={resultPanelOpen}
                    height={resultPanelHeight}
                    dragging={resultPanelDragging}
                    panelShellClassName={cn(panelShell, 'pointer-events-auto w-full')}
                  >
                    {showPlanningRoutePanel ? (
                      <RouteListPanel
                        routes={scopedActiveRoutes}
                        orders={allOrders}
                        dateScope={activeRouteDateScope}
                        dateScopeCounts={activeRouteScopeCounts}
                        onDateScopeChange={setActiveRouteDateScope}
                        selectedRouteIds={selectedActiveRouteIds}
                        onToggleRoute={handleToggleActiveRoute}
                        onChangeRouteColor={handleChangeRouteColor}
                        detailRouteId={detailActiveRouteId}
                        onOpenDetail={handleOpenActiveRouteDetail}
                        onCloseDetail={handleCloseActiveRouteDetail}
                        onRemoveOrder={handleRemoveOrderFromActive}
                        onReorderStops={handleReorderActiveStops}
                      />
                    ) : result ? (
                      <OptimizationResultPanel
                        result={result}
                        orders={allOrders}
                        selectedRouteId={selectedRouteId}
                        onSelectRoute={handleSelectRoute}
                        onApproveRoute={handleApproveRoute}
                        onRejectRoute={handleRejectRoute}
                        onRemoveOrder={handleRemoveOrderFromPending}
                        onReorderStops={handleReorderPendingStops}
                      />
                    ) : null}
                  </ResultPanelShell>
                </div>
              ) : null}

            </section>

            {/* Right panel — desktop */}
            <aside
              style={{ zIndex: 800 }}
              className={cn(
                panelShell,
                'absolute inset-y-3 right-3 hidden rounded-xl border transition-[width,opacity] lg:flex',
                rightPanelExpanded
                  ? 'w-xs opacity-100 xl:w-[360px]'
                  : 'pointer-events-none w-0 border-0 opacity-0 shadow-none'
              )}
            >
              {rightPanelExpanded ? (
                <ResourcesPanel
                  vehicles={allVehicles}
                  filteredVehicles={filteredVehicles}
                  selectedIds={selectedVehicleIdList}
                  search={vehicleSearch}
                  statusFilter={vehicleStatusFilter}
                  formFilter={vehicleFormFilter}
                  skillFilter={vehicleSkillFilter}
                  onSearchChange={setVehicleSearch}
                  onStatusFilterChange={setVehicleStatusFilter}
                  onFormFilterChange={setVehicleFormFilter}
                  onSkillFilterChange={setVehicleSkillFilter}
                  onSelectAllVisible={handleSelectAllVehicles}
                  onClearSelection={() => setSelectedVehicleIds(new Set())}
                  onToggleVehicle={handleToggleVehicle}
                />
              ) : null}
            </aside>

            {/* Mobile overlays */}
            {mobilePanel === 'orders' && leftPanelExpanded ? (
              <div
                className='absolute inset-0 bg-card lg:hidden'
                style={{ zIndex: 900 }}
              >
                <div className='flex h-9 items-center justify-between border-b px-3'>
                  <span className='text-sm font-medium'>Siparişler</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setMobilePanel('map')}
                  >
                    <ChevronRight className='size-4' />
                    Harita
                  </Button>
                </div>
                <div className='h-[calc(100%-2.25rem)]'>
                  <OrderPoolPanel
                    orders={planningBase}
                    filteredOrders={filteredOrders}
                    selectedIds={selectedOrderIdList}
                    search={orderSearch}
                    orderType={orderTypeFilter}
                    routeType={routeTypeFilter}
                    customerFilter={customerFilter}
                    operationDate={operationDate}
                    onSearchChange={setOrderSearch}
                    onToggleOrder={handleToggleOrder}
                    onSelectAllVisible={handleSelectAllOrders}
                    onClearSelection={() => setSelectedOrderIds(new Set())}
                    onOrderTypeChange={setOrderTypeFilter}
                    onRouteTypeChange={setRouteTypeFilter}
                    onCustomerFilterChange={setCustomerFilter}
                    onOperationDateChange={setOperationDate}
                  />
                </div>
              </div>
            ) : null}

            {mobilePanel === 'resources' && rightPanelExpanded ? (
              <div
                className='absolute inset-0 bg-card lg:hidden'
                style={{ zIndex: 900 }}
              >
                <div className='flex h-9 items-center justify-between border-b px-3'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setMobilePanel('map')}
                  >
                    <ChevronLeft className='size-4' />
                    Harita
                  </Button>
                  <span className='text-sm font-medium'>Kaynaklar</span>
                </div>
                <div className='h-[calc(100%-2.25rem)]'>
                  <ResourcesPanel
                    vehicles={allVehicles}
                    filteredVehicles={filteredVehicles}
                    selectedIds={selectedVehicleIdList}
                    search={vehicleSearch}
                    statusFilter={vehicleStatusFilter}
                    formFilter={vehicleFormFilter}
                    skillFilter={vehicleSkillFilter}
                    onSearchChange={setVehicleSearch}
                    onStatusFilterChange={setVehicleStatusFilter}
                    onFormFilterChange={setVehicleFormFilter}
                    onSkillFilterChange={setVehicleSkillFilter}
                    onSelectAllVisible={handleSelectAllVehicles}
                    onClearSelection={() => setSelectedVehicleIds(new Set())}
                    onToggleVehicle={handleToggleVehicle}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AdvancedSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        value={settings}
        saving={settingsSaving}
        onSave={(next) => void handleSaveSettings(next)}
      />
      <MapVisibilityHelpDialog
        open={mapVisibilityHelpOpen}
        onOpenChange={setMapVisibilityHelpOpen}
      />
    </>
  )
}
