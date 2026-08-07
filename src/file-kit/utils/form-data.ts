export type FormDataSerializable =
  | string
  | number
  | boolean
  | Date
  | File
  | null
  | undefined
  | FormDataSerializable[]
  | { [key: string]: FormDataSerializable }

function appendValue(formData: FormData, key: string, value: FormDataSerializable): void {
  if (value === null || value === undefined) {
    return
  }

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  if (value instanceof Date) {
    formData.append(key, value.toISOString())
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendValue(formData, `${key}[${index}]`, item)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendValue(formData, `${key}[${nestedKey}]`, nestedValue)
    })
    return
  }

  formData.append(key, String(value))
}

export function toFormData(values: Record<string, FormDataSerializable>): FormData {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    appendValue(formData, key, value)
  })

  return formData
}