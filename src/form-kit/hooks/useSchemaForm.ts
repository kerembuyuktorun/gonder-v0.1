/**
 * useSchemaForm Hook
 * 
 * Custom hook that integrates react-hook-form with Zod validation.
 */

import { useForm, UseFormReturn, DefaultValues, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useCallback } from 'react'
import { kitLogger } from '../../_shared/logger'
import { UseSchemaFormReturn } from '../context/types'

/**
 * Options for useSchemaForm hook
 */
export interface UseSchemaFormOptions<TSchema extends z.ZodType<FieldValues, z.ZodTypeDef, unknown>> {
  /** Zod validation schema */
  schema: TSchema
  /** Default form values */
  defaultValues?: DefaultValues<z.infer<TSchema>>
  /** Form submit handler */
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>
  /** Form error handler */
  onError?: (errors: unknown) => void
  /** Whether to reset form after successful submission */
  resetOnSubmit?: boolean
  /** Form mode (when to validate) */
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all'
}

/**
 * Custom hook for schema-driven forms with Zod validation
 * 
 * Wraps react-hook-form and provides a type-safe API for form management.
 * 
 * @param options - Form configuration options
 * @returns Form state and handlers
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * })
 * 
 * function MyForm() {
 *   const { form, handleSubmit, isSubmitting } = useSchemaForm({
 *     schema,
 *     defaultValues: { email: '', password: '' },
 *     onSubmit: async (data) => {
 *       await api.login(data)
 *     },
 *   })
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input {...form.register('email')} />
 *       <input {...form.register('password')} />
 *       <button type="submit" disabled={isSubmitting}>Submit</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useSchemaForm<TSchema extends z.ZodType<FieldValues, z.ZodTypeDef, unknown>>(
  options: UseSchemaFormOptions<TSchema>
): UseSchemaFormReturn<z.infer<TSchema>> {
  const {
    schema,
    defaultValues,
    onSubmit,
    onError,
    resetOnSubmit = false,
    mode = 'onSubmit',
  } = options

  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wrapped submit handler
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      await form.handleSubmit(
        async (data) => {
          try {
            setIsSubmitting(true)
            await onSubmit(data)
            
            if (resetOnSubmit) {
              form.reset()
            }
          } catch (error) {
            kitLogger.error('Form submission error:', error)
            
            if (onError) {
              onError(error)
            }
          } finally {
            setIsSubmitting(false)
          }
        },
        (errors) => {
          kitLogger.error('Form validation errors:', errors)
          
          if (onError) {
            onError(errors)
          }
        }
      )(e)
    },
    [form, onSubmit, onError, resetOnSubmit]
  )

  // Reset form to default values
  const reset = useCallback(() => {
    form.reset(defaultValues)
  }, [form, defaultValues])

  // Set field error
  const setError = useCallback(
    (name: string, error: { type: string; message: string }) => {
      form.setError(name as never, error)
    },
    [form]
  )

  return {
    form: form as UseFormReturn<z.infer<TSchema>>,
    isSubmitting,
    isValid: form.formState.isValid,
    handleSubmit,
    reset,
    setError,
  }
}
