"use client"

import * as React from "react"
import type { AppHeaderProps } from "./types"

const AppHeaderDefaultsContext = React.createContext<Partial<AppHeaderProps>>({})

export function AppHeaderDefaultsProvider({
  value,
  children,
}: {
  value: Partial<AppHeaderProps>
  children: React.ReactNode
}) {
  return (
    <AppHeaderDefaultsContext.Provider value={value}>
      {children}
    </AppHeaderDefaultsContext.Provider>
  )
}

export function useAppHeaderDefaults() {
  return React.useContext(AppHeaderDefaultsContext)
}
