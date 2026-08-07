import { Suspense } from "react"
import KargoSorgulaPage from "./page-content"

export default function TrackPage() {
  return (
    <Suspense>
      <KargoSorgulaPage />
    </Suspense>
  )
}
