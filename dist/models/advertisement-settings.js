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
    enableCustomQr: {
        type: Boolean,
        default: false
    },
    customQrLink: {
        type: String,
        default: ''
    },
    imagePreviewDuration: {
        type: Number,
        default: 3
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
exports.default = mongoose_1.model('advertisement_settings', schema);
