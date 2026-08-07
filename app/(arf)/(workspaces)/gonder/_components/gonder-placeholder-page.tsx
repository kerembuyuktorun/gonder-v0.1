"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"

type Props = {
  breadcrumbs: string[]
  title: string
  description: string
}

export function GonderPlaceholderPage({ breadcrumbs, title, description }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={breadcrumbs.map((label) => ({ label }))}
        searchPlaceholder="Gönder ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={1}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <section className="rounded-xl border border-border bg-card p-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </section>
      </div>
    </>
  )
}
