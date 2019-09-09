'use strict'
import {Document, model, Model, Schema} from 'mongoose'
import {Industry} from '../interfaces/industry'
export interface IndustryModel extends Industry, Document {}
export const CategoryList = new Schema({
  _id: {
    type: String,
    default: ''
  },
  counts: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Number,
    default: Date.now()
  }
})
export const Recommended = new Schema({
  _id: {
    type: String,
    default: ''
  },
  businessPartnerId: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Number,
    default: Date.now()
  }
})
export const ModelSchema = new Schema({
  _id: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  subName: {
    type: String,
    default: ''
  },
  totalBusiness: {
    type: Number,
    default: 0
  },
  shortName: {
    type: String,
    default: ''
  },
  iconUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  recommended: [
    Recommended
  ],
  categoryList: [
    CategoryList
  ],
  createdAt: {
    type: Number,
    default: Date.now()
  },
  updatedAt: {
    type: Number,
    default: Date.now()
  },
})
// new Logs(ModelSchema, 'industries')
export default model<IndustryModel>('industries', ModelSchema)