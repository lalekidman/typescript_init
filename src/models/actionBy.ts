import {Schema, Document, model} from 'mongoose'
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
