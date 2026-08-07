'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Clock3, Map, Navigation, Route, Truck } from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { getSession } from '../../../../../(auth)/_api/auth-client'
import { isCustomerPortalUser } from '../../../_lib/customer-portal'
import { formatDistance } from '../../_lib/query-orders'
import { RouteTypeBadge } from '../../_components/route-type-badge'
import type { OrderDetail } from '../_types/order-detail'
import { isOrderAssigned } from '../_lib/order-detail-helpers'

export function RouteCard({ order }: { order: OrderDetail }) {
  const assigned = isOrderAssigned(order)
  const { rota } = order
  const stopIndex = rota.durak_sirasi
  const courierStop = rota.mevcut_durak_sirasi
  const stopProgress =
    courierStop != null && stopIndex
      ? Math.min(100, Math.round((courierStop / stopIndex) * 100))
      : 0
  const [canOpenRouteDetail, setCanOpenRouteDetail] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const session = await getSession()
      if (cancelled) return
      if (session.success) {
        setCanOpenRouteDetail(
          !isCustomerPortalUser(
            (session.data?.user ?? null) as Record<string, unknown> | null
          )
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="flex min-w-0 flex-col p-5 lg:col-span-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
            <Route className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Rota</h3>
        </div>
        <RouteTypeBadge type={order.rota_tipi} />
      </div>

      <div className="flex flex-1 flex-col">
        {!assigned ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
              <Map className="size-5" />
            </span>
            <p className="text-sm font-semibold text-slate-800">Rota ataması bekleniyor</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-slate-500">
              Sipariş uygun kurye ve rota planına henüz bağlanmadı.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            {rota.rota_id && canOpenRouteDetail ? (
              <Link
                href={ARF_ROUTES.lastmile.planning.routeDetail(rota.rota_id)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Atanan Rota
                    </span>
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {rota.rota_adi || order.rota_kodu || `#${rota.rota_id}`}
                    </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-800">
                  Rota detayına git
                  <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            ) : rota.rota_adi || order.rota_kodu ? (
              <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Atanan Rota
                </span>
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {rota.rota_adi || order.rota_kodu}
                </span>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Truck className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {rota.kurye_adi ?? '—'}
                  </p>
                  <p className="shrink-0 text-xs font-medium text-slate-500">
                    {rota.arac ?? 'Araç bilgisi yok'}
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100">
              <Metric icon={Clock3} label="ETA" value={rota.eta} />
              <Metric
                icon={Navigation}
                label="Mesafe"
                value={rota.mesafe_m != null ? formatDistance(rota.mesafe_m) : '—'}
              />
            </dl>

            <div className="mt-auto rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-600">
                  {courierStop != null
                    ? `Kurye ${courierStop}. durakta`
                    : 'Kurye konumu bekleniyor'}
                </p>
                {stopIndex != null ? (
                  <span className="text-xs font-semibold text-slate-800">
                    Bu sipariş {stopIndex}. durak
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">—</span>
                )}
              </div>

              {stopIndex != null && stopIndex > 0 ? (
                stopIndex <= 12 ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: stopIndex }, (_, index) => {
                      const stopNumber = index + 1
                      const reached = courierStop != null && stopNumber <= courierStop
                      const current = stopNumber === courierStop
                      return (
                        <span
                          key={stopNumber}
                          title={`${stopNumber}. durak`}
                          className={
                            current
                              ? 'h-2 flex-1 rounded-full bg-slate-800'
                              : reached
                                ? 'h-2 flex-1 rounded-full bg-slate-500'
                                : 'h-2 flex-1 rounded-full bg-slate-200'
                          }
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-600"
                      style={{ width: `${stopProgress}%` }}
                    />
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-500">Durak bilgisi yok</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {courierStop != null && stopIndex != null
                    ? `${courierStop} / ${stopIndex} durağa ulaşıldı`
                    : 'Durak bilgisi yok'}
                </span>
                {order.eta_kalan_dk != null && order.eta_kalan_dk > 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <Navigation className="size-3.5 shrink-0 text-slate-400" />
                    Yaklaşık {order.eta_kalan_dk} dk
                  </span>
                ) : order.durum === 'teslim_edildi' ? (
                  <span className="font-medium text-emerald-700">
                    Tamamlandı
                    {order.teslim_zamani ? (
                      <span className="ml-1.5 font-semibold tabular-nums">
                        · {order.teslim_zamani}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 px-2 py-3 text-center">
      <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-xs font-semibold text-slate-800">{value}</dd>
    </div>
  )
}
