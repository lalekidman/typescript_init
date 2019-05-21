import {Request} from 'express'
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
export interface IRequest extends Request {
  files?: any
  payload?: any
}