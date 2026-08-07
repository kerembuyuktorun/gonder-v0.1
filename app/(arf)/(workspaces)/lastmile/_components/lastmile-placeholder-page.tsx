"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"

type Props = {
  breadcrumbs: string[]
  title: string
  description: string
}

export function LastmilePlaceholderPage({ breadcrumbs, title, description }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={breadcrumbs.map((label) => ({ label }))}
        searchPlaceholder="Lastmile ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={3}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </section>
      </div>
    </>
  )
}
