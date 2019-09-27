"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
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
});
exports.default = mongoose_1.model('queue_settings', schema);
