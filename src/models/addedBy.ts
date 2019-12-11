import {Schema, Document, model} from 'mongoose'
import IAddedBy from '../interfaces/addedBy'
export interface IAddedByModel extends Document, IAddedBy {}
export default  <Schema> new Schema(
  {
    _id: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    roleLevel: {
      type: String,
      default: ''
    }
  }
)
