/**
 * Form Kit Type Definitions
 * 
 * Type-safe configuration for schema-driven forms with Zod validation.
 */

import { z } from 'zod'
import { Control, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { ReactNode } from 'react'

/**
 * Supported field types for automatic rendering
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'combobox'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'array'
  | 'custom'

/**
 * Field size variants
 */
export type FieldSize = 'sm' | 'default' | 'lg'

/**
 * Field layout configuration
 */
export interface FieldLayout {
  /** Number of columns this field should span (1-12) */
  span?: number
  /** Vertical spacing (margin-bottom) */
  spacing?: 'none' | 'sm' | 'default' | 'lg'
  /** Horizontal alignment */
  align?: 'left' | 'center' | 'right'
}

/**
 * Select/Radio option configuration
 */
export interface FieldOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: ReactNode
}

/**
 * Base field configuration (common to all field types)
 */
export interface BaseFieldConfig {
  /** Unique field name (matches Zod schema key) */
  name: string
  /** Field label */
  label: string
  /** Field type */
  type: FieldType
  /** Placeholder text */
  placeholder?: string
  /** Help text displayed below the field */
  description?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is required (for UI indication) */
  required?: boolean
  /** Field size variant */
  size?: FieldSize
  /** Layout configuration */
  layout?: FieldLayout
  /** Custom CSS classes */
  className?: string
  /** Field dependencies used for reactive UI updates */
  dependencies?: string[]
  /** Declarative visibility condition based on watched values */
  condition?: (values: Record<string, unknown>) => boolean
  /** Dynamic required state based on watched values */
  requiredWhen?: (values: Record<string, unknown>) => boolean
}

/**
 * Text-based field configuration (text, email, password)
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'password'
  /** Maximum character length */
  maxLength?: number
  /** Minimum character length */
  minLength?: number
  /** Input pattern (regex) */
  pattern?: string
  /** Auto-complete hint */
  autoComplete?: string
}

/**
 * Number field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
}

/**
 * Textarea field configuration
 */
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  /** Number of visible text rows */
  rows?: number
  /** Maximum character length */
  maxLength?: number
  /** Whether to auto-resize height */
  autoResize?: boolean
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  /** Available options */
  options: FieldOption[]
  /** Whether multiple selection is allowed */
  multiple?: boolean
  /** Whether the select is searchable */
  searchable?: boolean
  /** Empty state text */
  emptyText?: string
}

/**
 * Combobox field configuration (searchable select with Command)
 */
export interface ComboboxFieldConfig extends BaseFieldConfig {
  type: 'combobox'
  /** Available options */
  options: FieldOption[]
  /** Empty state text when no results */
  emptyText?: string
  /** Placeholder for search input */
  searchPlaceholder?: string
}

/**
 * Checkbox field configuration
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox'
  /** Checkbox label (displayed next to checkbox) */
  checkboxLabel?: string
}

/**
 * Radio field configuration
 */
export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio'
  /** Available options */
  options: FieldOption[]
  /** Radio group display direction */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Date field configuration
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date'
  /** Minimum allowed date */
  minDate?: Date
  /** Maximum allowed date */
  maxDate?: Date
  /** Date format for display */
  format?: string
}

/**
 * File upload field configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file'
  /** Accepted file types (MIME types or extensions) */
  accept?: string
  /** Whether multiple files can be selected */
  multiple?: boolean
  /** Maximum file size in bytes */
  maxSize?: number
  /** Maximum number of files */
  maxFiles?: number
}

/**
 * Array field configuration for dynamic field lists
 */
export interface ArrayFieldConfig extends BaseFieldConfig {
  type: 'array'
  /** Child field configuration for each array item */
  fields: FieldConfig[]
  /** Default object used for new items */
  defaultItem?: Record<string, unknown>
  /** Button label for appending new item */
  addButtonLabel?: string
  /** Button label for removing an item */
  removeButtonLabel?: string
  /** Minimum item count */
  minItems?: number
  /** Maximum item count */
  maxItems?: number
  /** Visual title for every item row */
  itemLabel?: string
}

/**
 * Custom field configuration (for custom renderers)
 */
export interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom'
  /** Custom render function */
  render: (props: CustomFieldRenderProps) => React.ReactElement
}

/**
 * Props passed to custom field renderers
 */
export interface CustomFieldRenderProps {
  /** Field name */
  name: string
  /** Field value */
  value: unknown
  /** Change handler */
  onChange: (value: unknown) => void
  /** Blur handler */
  onBlur: () => void
  /** Field error message (if present) */
  error?: string
  /** Whether the field is disabled */
  disabled?: boolean
}

/**
 * Union type of all field configurations
 */
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | ComboboxFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | DateFieldConfig
  | FileFieldConfig
  | ArrayFieldConfig
  | CustomFieldConfig

/**
 * Form layout configuration
 */
export interface FormLayout {
  /** Number of columns in the form grid (1-12) */
  columns?: number
  /** Gap between fields */
  gap?: 'none' | 'sm' | 'default' | 'lg'
  /** Maximum form width */
  maxWidth?: string
}

/**
 * Form submit button configuration
 */
export interface SubmitButtonConfig {
  /** Button label */
  label?: string
  /** Whether to show loading state during submission */
  loading?: boolean
  /** Loading text */
  loadingText?: string
  /** Whether the button is disabled */
  disabled?: boolean
  /** Button size */
  size?: FieldSize
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Full width button */
  fullWidth?: boolean
  /** Custom CSS classes */
  className?: string
}

/**
 * Complete form configuration
 */
export interface FormConfig<TSchema extends z.ZodType<unknown, z.ZodTypeDef, unknown>> {
  /** Zod validation schema */
  schema: TSchema
  /** Field configurations */
  fields: FieldConfig[]
  /** Form layout */
  layout?: FormLayout
  /** Submit button configuration */
  submitButton?: SubmitButtonConfig
  /** Default form values */
  defaultValues?: DefaultValues<z.infer<TSchema>>
  /** Form submit handler */
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>
  /** Form error handler */
  onError?: (errors: unknown) => void
  /** Custom form class name */
  className?: string
}

/**
 * Hook return type for useSchemaForm
 */
export interface UseSchemaFormReturn<TFieldValues extends FieldValues = FieldValues> {
  /** react-hook-form instance */
  form: UseFormReturn<TFieldValues>
  /** Whether the form is currently submitting */
  isSubmitting: boolean
  /** Whether the form is valid */
  isValid: boolean
  /** Submit handler */
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  /** Reset form to default values */
  reset: () => void
  /** Set form error */
  setError: (name: string, error: { type: string; message: string }) => void
}

/**
 * FormKit Provider configuration
 */
export interface FormKitConfig {
  /** Default field size */
  defaultFieldSize?: FieldSize
  /** Default form layout */
  defaultLayout?: FormLayout
  /** Default submit button config */
  defaultSubmitButton?: Partial<SubmitButtonConfig>
  /** Custom field renderers */
  customRenderers?: Record<string, (props: CustomFieldRenderProps) => ReactNode>
}

/**
 * Props for SchemaForm component
 */
export interface SchemaFormProps<TSchema extends z.ZodType<FieldValues, z.ZodTypeDef, unknown>> {
  /** Form configuration */
  config: FormConfig<TSchema>
  /** Whether to show field descriptions */
  showDescriptions?: boolean
  /** Whether to show required indicators */
  showRequired?: boolean
}

/**
 * Props for FieldRenderer component
 */
export interface FieldRendererProps<TFieldValues extends FieldValues = FieldValues> {
  /** Field configuration */
  config: FieldConfig
  /** react-hook-form control */
  control: Control<TFieldValues>
  /** Latest watched form values for conditional rendering */
  watchValues?: Record<string, unknown>
  /** Whether to show field description */
  showDescription?: boolean
  /** Whether to show required indicator */
  showRequired?: boolean
}

/**
 * Wizard step configuration
 */
export interface WizardStepConfig {
  id: string
  title: string
  description?: string
  schema: z.ZodType<unknown, z.ZodTypeDef, unknown>
  fields: FieldConfig[]
}

/**
 * Wizard form configuration
 */
export interface WizardFormConfig<TValues extends FieldValues = FieldValues> {
  steps: WizardStepConfig[]
  defaultValues?: DefaultValues<TValues>
  onSubmit: (data: TValues) => void | Promise<void>
  onStepChange?: (stepIndex: number) => void
  className?: string
  nextLabel?: string
  prevLabel?: string
  submitLabel?: string
}

/**
 * Wizard form component props
 */
export interface WizardFormProps<TValues extends FieldValues = FieldValues> {
  config: WizardFormConfig<TValues>
  showDescriptions?: boolean
  showRequired?: boolean
}

/**
 * Auto save mode
 */
export type AutoSaveMode = 'debounce' | 'onBlur'

export interface AutoSaveDraft<TValues extends FieldValues = FieldValues> {
  values: TValues
  savedAt: number
  version?: string
}

export type AutoSaveConflictResolution = 'draft' | 'current'

export interface AutoSaveConflictContext<TValues extends FieldValues = FieldValues> {
  draft: AutoSaveDraft<TValues>
  currentValues: TValues
}

/**
 * Auto save hook options
 */
export interface UseAutoSaveOptions<TValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TValues>
  storageKey: string
  mode?: AutoSaveMode
  debounceMs?: number
  enabled?: boolean
  restoreOnMount?: boolean
  draftVersion?: string
  onAutoSave?: (values: TValues) => void | Promise<void>
  onRestoreConflict?: (
    context: AutoSaveConflictContext<TValues>
  ) => AutoSaveConflictResolution | Promise<AutoSaveConflictResolution>
}

/**
 * Auto save hook return
 */
export interface UseAutoSaveReturn {
  saveNow: () => Promise<void>
  onFieldBlur: () => Promise<void>
  clearDraft: () => void
  hasDraft: boolean
}
