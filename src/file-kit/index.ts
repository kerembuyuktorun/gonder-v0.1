export { FileUploader } from './components/FileUploader'
export { RHFFileUploader } from './components/RHFFileUploader'
export { toFormData } from './utils/form-data'

export type {
  FileUploadStatus,
  FileUploaderProps,
  RHFFileUploaderProps,
  UploadStrategy,
} from './context/types'
export type { FormDataSerializable } from './utils/form-data'

export const FILE_KIT_VERSION = '1.1.0'
