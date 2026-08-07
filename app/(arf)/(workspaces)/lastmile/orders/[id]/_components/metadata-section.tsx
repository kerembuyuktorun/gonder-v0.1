'use client'

import { Braces, Check, ShieldCheck, Workflow, X } from 'lucide-react'
import type { OrderDetail } from '../_types/order-detail'

export function MetadataSection({ order }: { order: OrderDetail }) {
  const settings = order.atama_guvenlik
  const entries = Object.entries(order.meta)

  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Teslimat ve Bildirimler
            </h3>
          </div>

          <div className="space-y-3">
            <SettingRow
              label="Teslimat Kanıtı Zorunlu"
              enabled={settings.teslimat_kaniti_zorunlu}
            />
            <SettingRow label="SMS Bildirimi" enabled={settings.bildirim_sms} />
            <SettingRow label="E-posta Bildirimi" enabled={settings.bildirim_email} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
              <Workflow className="size-5" />
            </span>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Güvenlik ve Saha Ataması
            </h3>
          </div>

          <div className="space-y-3">
            <SettingRow
              label="Güvenli Teslimat Kodu (OTP)"
              enabled={settings.guvenli_teslimat_otp}
            />
            <SettingRow
              label="Yakındaki Kuryelere Dağıt"
              enabled={settings.yakin_kuryelere_dagit}
            />
            <SettingRow label="Anında Sahaya İlet" enabled={settings.aninda_sahaya_ilet} />

            {settings.aninda_sahaya_ilet ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Aktif Rotaya Ekle
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {settings.aktif_rota_label ?? settings.aktif_rota_id ?? '—'}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Braces className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Gelişmiş Meta Veri
              </h3>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            {entries.length} alan
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Meta veri yok</p>
        ) : (
          <dl className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="group min-w-0 rounded-xl border border-slate-200/70 bg-slate-50/50 px-4 py-3.5 transition-colors hover:border-slate-300 hover:bg-white"
              >
                <dt className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  {key.replaceAll('_', ' ')}
                </dt>
                <dd className="mt-1.5 wrap-break-word text-sm font-medium leading-5 text-slate-800">
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  )
}

function SettingRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <span
        className={
          enabled
            ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
            : 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500'
        }
      >
        {enabled ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        {enabled ? 'Açık' : 'Kapalı'}
      </span>
    </div>
  )
}
