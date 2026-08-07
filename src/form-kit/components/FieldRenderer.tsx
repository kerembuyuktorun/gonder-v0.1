/**
 * FieldRenderer Component
 * 
 * Automatically renders the appropriate field component based on field configuration.
 */

import { useState } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import type { ArrayPath, FieldValues, Path } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { kitLogger } from '../../_shared/logger'
import {
  FieldRendererProps,
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
  CustomFieldConfig,
} from '../context/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { CalendarIcon, Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'

/**
 * Format a date for display
 */
function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Render a text-based field (text, email, password)
 */
function TextField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as TextFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            {...field}
            id={fieldConfig.name}
            type={fieldConfig.type}
            placeholder={fieldConfig.placeholder}
            disabled={fieldConfig.disabled}
            maxLength={fieldConfig.maxLength}
            autoComplete={fieldConfig.autoComplete}
            className={cn(
              fieldState.error && 'border-destructive focus-visible:ring-destructive',
              fieldConfig.className
            )}
          />
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a number field
 */
function NumberField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as NumberFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            {...field}
            id={fieldConfig.name}
            type="number"
            placeholder={fieldConfig.placeholder}
            disabled={fieldConfig.disabled}
            min={fieldConfig.min}
            max={fieldConfig.max}
            step={fieldConfig.step}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.valueAsNumber)}
            className={cn(
              fieldState.error && 'border-destructive focus-visible:ring-destructive',
              fieldConfig.className
            )}
          />
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a textarea field
 */
function TextareaField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as TextareaFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            {...field}
            id={fieldConfig.name}
            placeholder={fieldConfig.placeholder}
            disabled={fieldConfig.disabled}
            rows={fieldConfig.rows}
            maxLength={fieldConfig.maxLength}
            className={cn(
              fieldState.error && 'border-destructive focus-visible:ring-destructive',
              fieldConfig.className
            )}
          />
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a select field
 */
function SelectField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as SelectFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={field.value?.toString()}
            onValueChange={(value: string) => {
              // Try to parse as number if the original option value was a number
              const option = fieldConfig.options.find(opt => opt.value.toString() === value)
              field.onChange(option ? option.value : value)
            }}
            disabled={fieldConfig.disabled}
          >
            <SelectTrigger
              id={fieldConfig.name}
              className={cn(
                fieldState.error && 'border-destructive focus-visible:ring-destructive',
                fieldConfig.className
              )}
            >
              <SelectValue placeholder={fieldConfig.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a combobox field (searchable select with Command)
 */
function ComboboxField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as ComboboxFieldConfig
  const [open, setOpen] = useState(false)
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption = fieldConfig.options.find(opt => opt.value === field.value)
        
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldConfig.name}>
              {fieldConfig.label}
              {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={fieldConfig.disabled}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                    fieldState.error && "border-destructive",
                    fieldConfig.className
                  )}
                >
                  {selectedOption ? (
                    <>
                      {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
                      {selectedOption.label}
                    </>
                  ) : (
                    fieldConfig.placeholder || "Select..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder={fieldConfig.searchPlaceholder || "Search..."} 
                  />
                  <CommandList>
                    <CommandEmpty>{fieldConfig.emptyText || "No results found."}</CommandEmpty>
                    <CommandGroup>
                      {fieldConfig.options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => {
                            field.onChange(option.value)
                            setOpen(false)
                          }}
                          disabled={option.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.icon && <span className="mr-2">{option.icon}</span>}
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {showDescription && fieldConfig.description && (
              <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
            )}
            {fieldState.error && (
              <p className="text-sm text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        )
      }}
    />
  )
}

/**
 * Render a checkbox field
 */
function CheckboxField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as CheckboxFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={fieldConfig.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={fieldConfig.disabled}
              className={cn(
                fieldState.error && 'border-destructive',
                fieldConfig.className
              )}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={fieldConfig.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {fieldConfig.checkboxLabel || fieldConfig.label}
                {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {showDescription && fieldConfig.description && (
                <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
              )}
            </div>
          </div>
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a radio group field
 */
function RadioField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as RadioFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <RadioGroup
            value={field.value?.toString()}
            onValueChange={(value: string) => {
              // Try to parse as number if the original option value was a number
              const option = fieldConfig.options.find(opt => opt.value.toString() === value)
              field.onChange(option ? option.value : value)
            }}
            disabled={fieldConfig.disabled}
            className={cn(
              fieldConfig.orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2',
              fieldConfig.className
            )}
          >
            {fieldConfig.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={`${fieldConfig.name}-${option.value}`} />
                <Label htmlFor={`${fieldConfig.name}-${option.value}`} className="font-normal">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a date field with Calendar picker
 */
function DateField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as DateFieldConfig
  const [open, setOpen] = useState(false)
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={fieldConfig.disabled}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                  fieldState.error && "border-destructive",
                  fieldConfig.className
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? formatDate(field.value as Date) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value as Date}
                onSelect={(date: Date | undefined) => {
                  field.onChange(date)
                  setOpen(false)
                }}
                disabled={(date: Date) => {
                  if (fieldConfig.minDate && date < fieldConfig.minDate) return true
                  if (fieldConfig.maxDate && date > fieldConfig.maxDate) return true
                  return false
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render a file upload field
 */
function FileField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as FileFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field: { value: _value, onChange, ...field }, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={fieldConfig.name}>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            {...field}
            id={fieldConfig.name}
            type="file"
            accept={fieldConfig.accept}
            multiple={fieldConfig.multiple}
            disabled={fieldConfig.disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files
              if (files) {
                onChange(fieldConfig.multiple ? Array.from(files) : files[0])
              }
            }}
            className={cn(
              fieldState.error && 'border-destructive focus-visible:ring-destructive',
              fieldConfig.className
            )}
          />
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground">{fieldConfig.description}</p>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Render an array field (dynamic item list)
 */
function ArrayField<TFieldValues extends FieldValues>({ config, control, showDescription, showRequired, watchValues }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as ArrayFieldConfig

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldConfig.name as ArrayPath<TFieldValues>,
  })

  const addLabel = fieldConfig.addButtonLabel || 'Add new'
  const removeLabel = fieldConfig.removeButtonLabel || 'Remove'
  const canAdd = !fieldConfig.maxItems || fields.length < fieldConfig.maxItems
  const defaultItem = (fieldConfig.defaultItem || {}) as Parameters<typeof append>[0]

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>
            {fieldConfig.label}
            {showRequired && fieldConfig.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {showDescription && fieldConfig.description && (
            <p className="text-sm text-muted-foreground mt-1">{fieldConfig.description}</p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={fieldConfig.disabled || !canAdd}
          onClick={() => append(defaultItem)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No items added yet.</p>
      )}

      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="space-y-3 rounded-md border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {(fieldConfig.itemLabel || 'Item')} #{index + 1}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={fieldConfig.disabled || (fieldConfig.minItems ? fields.length <= fieldConfig.minItems : false)}
                onClick={() => remove(index)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {removeLabel}
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {fieldConfig.fields.map((subField) => (
                <FieldRenderer
                  key={`${item.id}-${subField.name}`}
                  config={{
                    ...subField,
                    name: `${fieldConfig.name}.${index}.${subField.name}`,
                  }}
                  control={control}
                  watchValues={watchValues}
                  showDescription={showDescription}
                  showRequired={showRequired}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Render a custom field
 */
function CustomField<TFieldValues extends FieldValues>({ config, control }: FieldRendererProps<TFieldValues>) {
  const fieldConfig = config as CustomFieldConfig
  
  return (
    <Controller
      name={fieldConfig.name as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) =>
        fieldConfig.render({
          name: field.name,
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
          disabled: fieldConfig.disabled,
        })
      }
    />
  )
}

/**
 * Main FieldRenderer component
 * 
 * Automatically renders the appropriate field component based on field type.
 */
export function FieldRenderer<TFieldValues extends FieldValues>(props: FieldRendererProps<TFieldValues>) {
  const { config, watchValues } = props

  if (config.condition && !config.condition(watchValues || {})) {
    return null
  }

  const resolvedRequired = config.required || (config.requiredWhen ? config.requiredWhen(watchValues || {}) : false)
  const resolvedConfig = resolvedRequired === config.required ? config : { ...config, required: resolvedRequired }
  
  const fieldType = resolvedConfig.type
  const nextProps = { ...props, config: resolvedConfig }
  
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'password':
      return <TextField {...nextProps} />
    
    case 'number':
      return <NumberField {...nextProps} />
    
    case 'textarea':
      return <TextareaField {...nextProps} />
    
    case 'select':
      return <SelectField {...nextProps} />
    
    case 'combobox':
      return <ComboboxField {...nextProps} />
    
    case 'checkbox':
      return <CheckboxField {...nextProps} />
    
    case 'radio':
      return <RadioField {...nextProps} />
    
    case 'date':
      return <DateField {...nextProps} />
    
    case 'file':
      return <FileField {...nextProps} />

    case 'array':
      return <ArrayField {...nextProps} />
    
    case 'custom':
      return <CustomField {...nextProps} />
    
    default:
      kitLogger.warn(`Unknown field type: ${fieldType}`)
      return null
  }
}
