import {SchemaTypeOpts, Schema, model} from 'mongoose'
import {IMainEntityData} from '../../../../domain/index'
import IMainEntity from '../interfaces/main'
type IM = {
  [K in keyof IMainEntityData]: any
}
const MainEntityObject = <IM>{
  _id: {
    type: String,
    default: ''
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Number,
    default: 0
  },
}
const ModelSchema = new Schema(MainEntityObject)
ModelSchema.index({
  isSuspended: 1
})
ModelSchema.index({
  createdAt: -1
})
// sample
const MainEntityModel = model<IMainEntity>("mains", ModelSchema)
export default MainEntityModel