"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const socialLinksSchema = new mongoose_1.Schema({
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
}, { _id: false });
exports.ModelSchema = new mongoose_1.Schema({
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
});
//new Logs(ModelSchema, 'branches')
exports.default = mongoose_1.model("branches", exports.ModelSchema);
