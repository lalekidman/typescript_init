'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.CategoryList = new mongoose_1.Schema({
    _id: {
        type: String,
        default: ''
    },
    counts: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
});
exports.Recommended = new mongoose_1.Schema({
    _id: {
        type: String,
        default: ''
    },
    businessPartnerId: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
});
exports.ModelSchema = new mongoose_1.Schema({
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
    subName: {
        type: String,
        default: ''
    },
    totalBusiness: {
        type: Number,
        default: 0
    },
    shortName: {
        type: String,
        default: ''
    },
    iconUrl: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    recommended: [
        exports.Recommended
    ],
    categoryList: [
        exports.CategoryList
    ],
    createdAt: {
        type: Number,
        default: Date.now()
    },
    updatedAt: {
        type: Number,
        default: Date.now()
    },
});
// new Logs(ModelSchema, 'industries')
exports.default = mongoose_1.model('industries', exports.ModelSchema);
