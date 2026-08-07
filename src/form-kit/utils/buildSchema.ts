/**
 * Build Schema Utility
 * 
 * Generate Zod schemas from field configurations.
 */

import { z } from 'zod'
import {
  FieldConfig,
  TextFieldConfig,
  NumberFieldConfig,
  TextareaFieldConfig,
  SelectFieldConfig,
  ComboboxFieldConfig,
  CheckboxFieldConfig,
  RadioFieldConfig,
  DateFieldConfig,
  FileFieldConfig,
  ArrayFieldConfig,
} from '../context/types'

export interface FormKitSchemaMessages {
  invalidEmail: string
  minCharacters: (count: number) => string
  maxCharacters: (count: number) => string
  invalidFormat: string
  fieldRequired: (label: string) => string
  invalidNumber: string
  minNumber: (value: number) => string
  maxNumber: (value: number) => string
  minSelection: (count: number) => string
  invalidSelection: string
  acceptedRequired: (label: string) => string
  selectionRequired: string
  invalidDate: string
  minDate: (date: Date) => string
  maxDate: (date: Date) => string
  minFiles: (count: number) => string
  maxFiles: (count: number) => string
  fileRequired: string
  minItems: (count: number) => string
  maxItems: (count: number) => string
}

export const DEFAULT_FORM_KIT_SCHEMA_MESSAGES: FormKitSchemaMessages = {
  invalidEmail: 'Please enter a valid email address',
  minCharacters: (count) => `Must be at least ${count} characters`,
  maxCharacters: (count) => `Must be at most ${count} characters`,
  invalidFormat: 'Invalid format',
  fieldRequired: (label) => `${label} is required`,
  invalidNumber: 'Please enter a valid number',
  minNumber: (value) => `Must be at least ${value}`,
  maxNumber: (value) => `Must be at most ${value}`,
  minSelection: (count) => `Select at least ${count} option${count > 1 ? 's' : ''}`,
  invalidSelection: 'Please select a valid option',
  acceptedRequired: (label) => `${label} must be accepted`,
  selectionRequired: 'Please select an option',
  invalidDate: 'Please enter a valid date',
  minDate: (date) => `Cannot be before ${date.toLocaleDateString()}`,
  maxDate: (date) => `Cannot be after ${date.toLocaleDateString()}`,
  minFiles: (count) => `Select at least ${count} file${count > 1 ? 's' : ''}`,
  maxFiles: (count) => `You can select up to ${count} file${count > 1 ? 's' : ''}`,
  fileRequired: 'Please select a file',
  minItems: (count) => `At least ${count} item${count > 1 ? 's are' : ' is'} required`,
  maxItems: (count) => `At most ${count} item${count > 1 ? 's are' : ' is'} allowed`,
}

function resolveSchemaMessages(
  messages?: Partial<FormKitSchemaMessages>
): FormKitSchemaMessages {
  return {
    ...DEFAULT_FORM_KIT_SCHEMA_MESSAGES,
    ...messages,
  }
}

/**
 * Build a Zod schema field from a field configuration
 */
export function buildField(
  config: FieldConfig,
  messages?: Partial<FormKitSchemaMessages>
): z.ZodTypeAny {
  const resolvedMessages = resolveSchemaMessages(messages)

  switch (config.type) {
    case 'text':
    case 'email':
    case 'password':
      return buildTextField(config as TextFieldConfig, resolvedMessages)
    
    case 'number':
      return buildNumberField(config as NumberFieldConfig, resolvedMessages)
    
    case 'textarea':
      return buildTextareaField(config as TextareaFieldConfig, resolvedMessages)
    
    case 'select':
      return buildSelectField(config as SelectFieldConfig, resolvedMessages)
    
    case 'combobox':
      return buildComboboxField(config as ComboboxFieldConfig, resolvedMessages)
    
    case 'checkbox':
      return buildCheckboxField(config as CheckboxFieldConfig, resolvedMessages)
    
    case 'radio':
      return buildRadioField(config as RadioFieldConfig, resolvedMessages)
    
    case 'date':
      return buildDateField(config as DateFieldConfig, resolvedMessages)
    
    case 'file':
      return buildFileField(config as FileFieldConfig, resolvedMessages)

    case 'array':
      return buildArrayField(config as ArrayFieldConfig, resolvedMessages)
    
    case 'custom':
      // For custom fields, return a generic unknown schema
      // Users should provide their own validation
      return z.unknown()
    
    default:
      return z.string()
  }
}

/**
 * Build schema for text-based fields
 */
function buildTextField(config: TextFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  let schema = z.string()

  // Email validation
  if (config.type === 'email') {
    schema = schema.email(messages.invalidEmail)
  }

  // Min length
  if (config.minLength !== undefined) {
    schema = schema.min(config.minLength, messages.minCharacters(config.minLength))
  }

  // Max length
  if (config.maxLength !== undefined) {
    schema = schema.max(config.maxLength, messages.maxCharacters(config.maxLength))
  }

  // Pattern validation
  if (config.pattern) {
    schema = schema.regex(new RegExp(config.pattern), messages.invalidFormat)
  }

  // Required validation - MUST BE LAST
  if (config.required) {
    schema = schema.min(1, messages.fieldRequired(config.label))
  } else {
    return schema.optional()
  }

  return schema
}

/**
 * Build schema for number fields
 */
function buildNumberField(config: NumberFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  let schema = z.number({
    invalid_type_error: messages.invalidNumber,
    required_error: messages.fieldRequired(config.label),
  })

  // Min value
  if (config.min !== undefined) {
    schema = schema.min(config.min, messages.minNumber(config.min))
  }

  // Max value
  if (config.max !== undefined) {
    schema = schema.max(config.max, messages.maxNumber(config.max))
  }

  // Required validation - MUST BE LAST
  if (!config.required) {
    return schema.optional()
  }

  return schema
}

/**
 * Build schema for textarea fields
 */
function buildTextareaField(config: TextareaFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  let schema = z.string()

  // Max length
  if (config.maxLength !== undefined) {
    schema = schema.max(config.maxLength, messages.maxCharacters(config.maxLength))
  }

  // Required validation - MUST BE LAST
  if (config.required) {
    schema = schema.min(1, messages.fieldRequired(config.label))
  } else {
    return schema.optional()
  }

  return schema
}

/**
 * Build schema for select fields
 */
function buildSelectField(config: SelectFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  const validValues = config.options.map(opt => opt.value)

  if (config.multiple) {
    const schema = z.array(z.union([z.string(), z.number()]))
    
    if (config.required) {
      return schema.min(1, messages.minSelection(1))
    }
    
    return schema.optional()
  } else {
    const schema = z.union([z.string(), z.number()])
    
    if (config.required) {
      return schema.refine(val => validValues.includes(val), {
        message: messages.invalidSelection,
      })
    }
    
    return schema.optional()
  }
}

/**
 * Build schema for combobox fields (searchable single select)
 */
function buildComboboxField(config: ComboboxFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  const validValues = config.options.map(opt => opt.value)
  const schema = z.union([z.string(), z.number()])
  
  if (config.required) {
    return schema.refine(val => validValues.includes(val), {
      message: messages.invalidSelection,
    })
  }
  
  return schema.optional()
}

/**
 * Build schema for checkbox fields
 */
function buildCheckboxField(config: CheckboxFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  const schema = z.boolean()

  if (config.required) {
    return schema.refine(val => val === true, {
      message: messages.acceptedRequired(config.label),
    })
  }

  return schema.optional()
}

/**
 * Build schema for radio fields
 */
function buildRadioField(config: RadioFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  const validValues = config.options.map(opt => opt.value)
  const schema = z.union([z.string(), z.number()])

  if (config.required) {
    return schema.refine(val => validValues.includes(val), {
      message: messages.selectionRequired,
    })
  }

  return schema.optional()
}

/**
 * Build schema for date fields
 */
function buildDateField(config: DateFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  let schema = z.date({
    invalid_type_error: messages.invalidDate,
    required_error: messages.fieldRequired(config.label),
  })

  // Min date
  if (config.minDate) {
    schema = schema.min(config.minDate, messages.minDate(config.minDate))
  }

  // Max date
  if (config.maxDate) {
    schema = schema.max(config.maxDate, messages.maxDate(config.maxDate))
  }

  // Required validation - MUST BE LAST
  if (!config.required) {
    return schema.optional()
  }

  return schema
}

/**
 * Build schema for file upload fields
 */
function buildFileField(config: FileFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  if (config.multiple) {
    let schema = z.array(z.instanceof(File))
    
    if (config.required) {
      schema = schema.min(1, messages.minFiles(1))
    }
    
    // Max files validation
    if (config.maxFiles !== undefined) {
      schema = schema.max(config.maxFiles, messages.maxFiles(config.maxFiles))
    }
    
    return config.required ? schema : schema.optional()
  } else {
    const schema = z.instanceof(File)
    
    if (config.required) {
      return schema.refine(val => val !== undefined, {
        message: messages.fileRequired,
      })
    }
    
    return schema.optional()
  }
}

/**
 * Build schema for array fields
 */
function buildArrayField(config: ArrayFieldConfig, messages: FormKitSchemaMessages): z.ZodTypeAny {
  const itemShape: Record<string, z.ZodTypeAny> = {}

  for (const field of config.fields) {
    itemShape[field.name] = buildField(field, messages)
  }

  let schema = z.array(z.object(itemShape))

  if (config.minItems !== undefined) {
    schema = schema.min(config.minItems, messages.minItems(config.minItems))
  }

  if (config.maxItems !== undefined) {
    schema = schema.max(config.maxItems, messages.maxItems(config.maxItems))
  }

  if (!config.required) {
    return schema.optional()
  }

  return schema
}

/**
 * Build a complete Zod object schema from field configurations
 * 
 * @param fields - Array of field configurations
 * @returns Zod object schema
 * 
 * @example
 * ```ts
 * const fields: FieldConfig[] = [
 *   { name: 'email', type: 'email', label: 'Email', required: true },
 *   { name: 'password', type: 'password', label: 'Password', required: true, minLength: 8 },
 * ]
 * 
 * const schema = buildSchema(fields)
 * // Returns: z.object({ email: z.string().email(), password: z.string().min(8) })
 * ```
 */
export function buildSchema<T extends FieldConfig[]>(
  fields: T,
  messages?: Partial<FormKitSchemaMessages>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    shape[field.name] = buildField(field, messages)
  }

  return z.object(shape)
}

/**
 * Add custom refinements to a schema
 * 
 * @param schema - Base Zod schema
 * @param refinements - Array of refinement functions
 * @returns Enhanced schema with refinements
 * 
 * @example
 * ```ts
 * const schema = buildSchema(fields)
 * const enhancedSchema = addRefinements(schema, [
 *   (data) => data.password === data.confirmPassword,
 *   { message: 'Şifreler eşleşmiyor', path: ['confirmPassword'] }
 * ])
 * ```
 */
export function addRefinements<T extends z.ZodObject<Record<string, z.ZodTypeAny>>>(
  schema: T,
  refinements: Array<{
    validate: (data: Record<string, unknown>) => boolean
    message: string
    path?: string[]
  }>
): z.ZodTypeAny {
  let enhancedSchema: z.ZodTypeAny = schema

  for (const refinement of refinements) {
    enhancedSchema = enhancedSchema.refine(refinement.validate, {
      message: refinement.message,
      path: refinement.path,
    })
  }

  return enhancedSchema
}
