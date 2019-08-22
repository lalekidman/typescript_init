import {Schema, Document, model} from 'mongoose'
import {default as BusinessBranches} from '../interfaces/branches'
//import Logs from '../class/logs';
export interface IBusinessBranchesModel extends Document, BusinessBranches {}
const socialLinksSchema = new Schema({
  id: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
}, {_id: false})
export const ModelSchema:Schema = new Schema({
  _id: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  branchName: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  businessNameId: {
    type: String,
    default: null,
    ref: 'business_names'
  },
  businessPartnerId: {
    type: String,
    default: null,
    ref: 'business_partners'
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
  counter: {
    type: Number,
    default: 0
  },
  autoAssignQueue: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    default: ''
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
    default: true
  },
  isWeeklyOpened: {
    type: Boolean,
    default: true
  },
  tvDisplayType: {
    type: String,
    default: 'queue'
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
  operationHours: [
    {
      _id: {
        type: String,
        default: ''
      },
      startValue: {
        type: Number,
        default: 0
      },
      endValue: {
        type: Number,
        default: 0
      },
      enabled: {
        type: Boolean,
        default: false
      },
      day: {
        type: Number,
        default: null
      },
      isWholeDay: {
        type: Boolean,
        default: false
      }
    }
  ],
  gallery: [
    {
      _id: {
        type: String,
        default: ''
      },
      imageUrl: {
        type: String,
        default: ''
      },
      createdAt: {
        type: Number,
        default: Date.now()
      }
    }
  ],
  reservationTimeSlots: {
    availableDays: [
      {
        type: Number,
        default: 0
      }
    ],
    timeLists: [
      {
        capacity: {
          type: Number,
          default: 0
        },
        value: {
          type: Number,
          default: 0
        },
        id: {
          type: String,
          default: ''
        },
        createdAt: {
          type: Number,
          default: Date.now()
        }
      }
    ]
  },
  reservationSettings: {
    cutOffHours: {
      type: Number,
      default: 3
    },
    timeSlots: [
      {
        _id: {
          type: String,
          default: ''
        },
        day: {
          type: Number,
          default: 0
        },
        lists: [
          {
            capacity: {
              type: Number,
              default: 0
            },
            value: {
              type: Number,
              default: 0
            },
            _id: {
              type: String,
              default: ''
            },
            createdAt: {
              type: Number,
              default: Date.now()
            }
          }
        ]
      }
    ]
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
  modules: [
    {
      type: String
    }
  ],
  socialLinks: [
    socialLinksSchema
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
  printingDetails: {
    status: {
      type: Boolean,
      default: false
    },
    qrDesc: {
      type: String,
      default: ''
    },
    qrLink: {
      type: String,
      default: ''
    }
  },
  smsSettings: {
    status: {
      type: Boolean,
      default: true
    },
    notifyNo: {
      type: Number,
      default: 3
    },
    costValue: {
      type: Number,
      default: 0.40
    }
  },
  smsConfig: {
    number: {
      type: Number,
      default: 0
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  smsCredit: {
    consumed: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  seatsCapacity: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    }
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
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
  }
})
//new Logs(ModelSchema, 'branches')
export default model<IBusinessBranchesModel>("branches", ModelSchema);