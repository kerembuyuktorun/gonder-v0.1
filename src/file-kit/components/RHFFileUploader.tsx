'use client'

import { Controller } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'
import { FileUploader } from './FileUploader'
import type { RHFFileUploaderProps } from '../context/types'

export function RHFFileUploader<TValues extends FieldValues = FieldValues>({
  control,
  name,
  ...props
}: RHFFileUploaderProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FileUploader
          {...props}
          value={Array.isArray(field.value) ? field.value : []}
          onChange={field.onChange}
        />
      )}
    />
  )
}
