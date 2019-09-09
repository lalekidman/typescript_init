'use strict'
import {_init} from '../utils/interfaces'
export interface ICategoryList {
  _id?: string
  name: string
  counts: number
  createdAt: number
}
export interface IRecommended {
  _id?: string
  businessPartnerId: string
  createdAt: number
}
export interface Industry extends _init {
  name: string
  subName: string
  shortName: string
  iconUrl: string
  totalBusiness: number
  recommended: Array<IRecommended>
  category: string
  categoryList: Array<ICategoryList>
}