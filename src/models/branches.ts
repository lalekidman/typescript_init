import {Schema, Document, model} from 'mongoose'
import IBranch from '../interfaces/branches'
import AddedBySchema from './addedBy'
export interface IBranchModel extends Document, IBranch {}
const AssignedDeviceSchema = new Schema({
  _id: {
    type: String,
    default: ''
  },
  manufactureId:{
    type: String,
    default: ''
  },
  deviceId:{
    type: String,
    default: ''
  },
  createdAt: {
    type: Number,
    default: 0
  }
})
export const ModelSchema:Schema = new Schema({
  _id: {
    type: String,
    default: ''
  },
  branchName: {
    type: String,
    default: null
  },
  branchId: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  partnerId: {
    type: String,
    default: null
  },
  categoryId: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 3,
    enum: [
      1, 2, 3
    ]
  },
  noOfDevices: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFirstSignIn: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  about: {
    type: String,
    default: ''
  },
  notificationCount: {
    type: Number,
    default: 0
  },
  totalActiveQueues: {
    type: Number,
    default: 0
  },
  totalQueues: {
    type: Number,
    default: 0
  },
  totalReservations: {
    type: Number,
    default: 0
  },
  contactNo: {
    type: String,
    default: null
  },
  displayedQueue: {
    bookingId: {
      type: String,
      default: ''
    },
    bookingNo: {
      type: String,
      default: ''
    },
    queueGroupId: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: ''
    }
  },
  
  contacts: [
    {
      _id: {
        type: String,
        default: ''
      },
      isPrimary: {
        type: Boolean,
        default: false
      },
      number: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: ''
      }
    }
  ],
  address: {
    street: {
      type: String,
      default: ''
    },
    province: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    zipcode: {
      type: String,
      default: ''
    },
  },
  assignedDevices: [
    AssignedDeviceSchema
  ],
  subscription: {
    planType: {
      type: String,
      default: ''
    },
    amountRate: {
      type: Number,
      default: 0
    },
    SMSRate: {
      type: Number,
      default: 0
    }
  },
  lastSignIn: {
    type: Number,
    default: Date.now()
  },
  createdAt: {
    type: Number,
    default: Date.now()
  },
  updatedAt: {
    type: Number,
    default: Date.now()
  },
  addedBy: AddedBySchema
})
//new Logs(ModelSchema, 'branches')
export default model<IBranchModel>("branches", ModelSchema);