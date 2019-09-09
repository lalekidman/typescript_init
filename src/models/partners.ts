'use strict'
import {Schema, model, Model, Document} from 'mongoose'
import IPartners from '../interfaces/partners'
// import Logs from '../class/logs';
export interface IPartnersModel extends IPartners, Document {}
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
  avatarUrl: {
    type: String,
    default: ''
  },
  industryId: {
    type: String,
    default: '',
    ref: 'industries'
  },
  categoryId: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Number,
    default: Date.now()
  },
  updatedAt: {
    type: Number,
    default: Date.now()
  },
})
ModelSchema.index({
  name: 1,
  createdAt: -1
})
// new Logs(ModelSchema, 'business-partners')
export default model<IPartnersModel>('partners', ModelSchema)