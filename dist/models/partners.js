'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
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
    avatarUrl: {
        type: String,
        default: ''
    },
    industryId: {
        type: String,
        default: '',
        ref: 'industries'
    },
    categoryId: {
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
    },
});
exports.ModelSchema.index({
    name: 1,
    createdAt: -1
});
// new Logs(ModelSchema, 'business-partners')
exports.default = mongoose_1.model('partners', exports.ModelSchema);
