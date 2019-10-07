import {Schema, Document, model} from 'mongoose'
import IQueueSettings from '../interfaces/queue-settings'
export interface IQueueSettingsModel extends Document, IQueueSettings {}

const schema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    branchId: {
      type: String,
      required: true
    },
    features: {
      type: Array,
      default: []
    },
    hideCustomerNameField: {
      type: Boolean,
      default: false
    },
    hideMobileNumberField: {
      type: Boolean,
      default: false
    },
    autoSms: {
      type: Boolean,
      default: true
    },
    autoSmsQueuesAwayNotification: {
      type: Number,
      default: 3
    },
    queueTags: [
      {
        _id: {
          type: String,
          default: ''
        },
        id: {
          type: String,
          default: ''
        },
        tagName: {
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
        }
      }
    ],
    createdAt: {
      type: Number,
      default: Date.now()
    },
    updatedAt: {
      type: Number,
      default: Date.now()
    }
  }
)

export default model<IQueueSettingsModel>('queue_settings', schema)
