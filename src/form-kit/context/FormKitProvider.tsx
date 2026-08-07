/**
 * FormKit Provider
 * 
 * Optional context provider for global FormKit configuration.
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { FormKitConfig } from './types'

const FormKitContext = createContext<FormKitConfig | undefined>(undefined)

/**
 * FormKit Provider Props
 */
export interface FormKitProviderProps {
  /** Global FormKit configuration */
  config?: FormKitConfig
  /** Child components */
  children: ReactNode
}

/**
 * FormKit Provider
 * 
 * Provides global configuration for all FormKit components.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <FormKitProvider
 *       config={{
 *         defaultFieldSize: 'lg',
 *         defaultLayout: { columns: 2, gap: 'lg' },
 *         defaultSubmitButton: { variant: 'default', fullWidth: true },
 *       }}
 *     >
 *       <MyForms />
 *     </FormKitProvider>
 *   )
 * }
 * ```
 */
export function FormKitProvider({ config, children }: FormKitProviderProps) {
  return (
    <FormKitContext.Provider value={config}>
      {children}
    </FormKitContext.Provider>
  )
}

/**
 * Hook to access FormKit context
 * 
 * @returns FormKit configuration (if provider is used)
 */
export function useFormKit(): FormKitConfig | undefined {
  return useContext(FormKitContext)
}
