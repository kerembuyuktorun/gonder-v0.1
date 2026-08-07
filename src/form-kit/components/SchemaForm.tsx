/**
 * SchemaForm Component
 * 
 * Main schema-driven form component that automatically renders fields from configuration.
 */

'use client'

import { cn } from '@/lib/utils'
import { SchemaFormProps } from '../context/types'
import { useSchemaForm } from '../hooks/useSchemaForm'
import { FieldRenderer } from './FieldRenderer'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { FieldValues, useWatch } from 'react-hook-form'

/**
 * Get grid column span class
 */
function getColumnSpanClass(span?: number): string {
  switch (span) {
    case 1: return 'col-span-1'
    case 2: return 'col-span-2'
    case 3: return 'col-span-3'
    case 4: return 'col-span-4'
    case 5: return 'col-span-5'
    case 6: return 'col-span-6'
    case 7: return 'col-span-7'
    case 8: return 'col-span-8'
    case 9: return 'col-span-9'
    case 10: return 'col-span-10'
    case 11: return 'col-span-11'
    case 12: return 'col-span-12'
    default: return 'col-span-full'
  }
}

/**
 * Get spacing class
 */
function getSpacingClass(spacing?: 'none' | 'sm' | 'default' | 'lg'): string {
  switch (spacing) {
    case 'none': return 'mb-0'
    case 'sm': return 'mb-2'
    case 'lg': return 'mb-8'
    default: return 'mb-4'
  }
}

/**
 * Get gap class
 */
function getGapClass(gap?: 'none' | 'sm' | 'default' | 'lg'): string {
  switch (gap) {
    case 'none': return 'gap-0'
    case 'sm': return 'gap-2'
    case 'lg': return 'gap-8'
    default: return 'gap-4'
  }
}

/**
 * SchemaForm component
 * 
 * Automatically generates a form from field configurations with Zod validation.
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   name: z.string().min(1, 'Name is required'),
 *   email: z.string().email('Invalid email'),
 *   age: z.number().min(18, 'Must be 18+'),
 * })
 * 
 * const fields: FieldConfig[] = [
 *   { name: 'name', type: 'text', label: 'Name', required: true },
 *   { name: 'email', type: 'email', label: 'Email', required: true },
 *   { name: 'age', type: 'number', label: 'Age', required: true, min: 18 },
 * ]
 * 
 * function MyForm() {
 *   return (
 *     <SchemaForm
 *       config={{
 *         schema,
 *         fields,
 *         onSubmit: async (data) => {
 *           console.log(data)
 *         },
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function SchemaForm<TSchema extends z.ZodType<FieldValues, z.ZodTypeDef, unknown>>({
  config,
  showDescriptions = true,
  showRequired = true,
}: SchemaFormProps<TSchema>) {
  const {
    schema,
    fields,
    layout = {},
    submitButton = {},
    defaultValues,
    onSubmit,
    onError,
    className,
  } = config

  const { form, isSubmitting, handleSubmit } = useSchemaForm({
    schema,
    defaultValues,
    onSubmit,
    onError,
  })

  const watchedValues = useWatch<z.infer<TSchema>>({ control: form.control }) as Record<string, unknown>
  const visibleFields = fields.filter((field) => !field.condition || field.condition(watchedValues || {}))

  const {
    columns = 1,
    gap = 'default',
    maxWidth,
  } = layout

  const {
    label = 'Submit',
    loadingText = 'Submitting...',
    size = 'default',
    variant = 'default',
    fullWidth = false,
    disabled = false,
    className: buttonClassName,
  } = submitButton

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      style={{ maxWidth }}
    >
      <div
        className={cn(
          'grid',
          getGapClass(gap),
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-3',
          columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          columns === 6 && 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
          columns === 12 && 'grid-cols-12'
        )}
      >
        {visibleFields.map((field) => (
          <div
            key={field.name}
            className={cn(
              getColumnSpanClass(field.layout?.span),
              getSpacingClass(field.layout?.spacing),
              field.layout?.align === 'center' && 'mx-auto',
              field.layout?.align === 'right' && 'ml-auto'
            )}
          >
            <FieldRenderer
              config={field}
              control={form.control}
              watchValues={watchedValues}
              showDescription={showDescriptions}
              showRequired={showRequired}
            />
          </div>
        ))}
      </div>

      <div className={cn(
        'flex',
        fullWidth ? 'w-full' : 'w-auto'
      )}>
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          size={size}
          variant={variant}
          className={cn(fullWidth && 'w-full', buttonClassName)}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? loadingText : label}
        </Button>
      </div>
    </form>
  )
}
