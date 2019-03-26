export interface uploadFiles {
  fieldName: string
  originalFilename: string
  path: string
  headers: object
  type: string
  fileName?: string
  size: number
}
export interface UploadedImage {
  avatarUrl?: string
  fileName?: string
  imageUrl?: string
}