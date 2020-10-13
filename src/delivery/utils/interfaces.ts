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
  fingerprint?: IFingerprint
}
export interface IFingerprint {
  hash: string
  // components: any
}
export interface _init {
  _id: any
  id?: any
  createdAt: number
  updatedAt: number
}
export interface RequestToken extends Request {
  accessToken?: string,
  authPayload?: any
  payload?: any
  photo?: (uploadFiles | Array<uploadFiles>)
  images?: (uploadFiles | Array<uploadFiles>)
}