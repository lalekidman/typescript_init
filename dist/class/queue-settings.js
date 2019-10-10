"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_settings_1 = require("../models/queue-settings");
const branches_1 = require("../models/branches");
const RC = require("../utils/response-codes");
const app_error_1 = require("../utils/app-error");
const queries_1 = require("../utils/queries");
class QueueSettings {
    constructor() {
        this.Queries = new queries_1.default(queue_settings_1.default);
    }
    /**
     * get queue settings by branch id
     */
    getQueueSettingsByBranchId(branchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                queue_settings_1.default.findOne({ branchId })
                    .then((queueSettings) => {
                    if (!queueSettings) {
                        return reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS));
                    }
                    resolve(queueSettings);
                })
                    .catch((error) => {
                    console.log(error);
                    reject(error);
                });
            });
        });
    }
    /**
     * update branch Queue Settings
     */
    updateBranchQueueSettings(branchId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                queue_settings_1.default.findOneAndUpdate({ branchId }, data, { new: true })
                    .then((updatedQueueSettings) => __awaiter(this, void 0, void 0, function* () {
                    if (!updatedQueueSettings) {
                        // check if branch exists
                        let checkBranch = yield branches_1.default.findOne({ _id: branchId });
                        if (checkBranch) {
                            const newQueueSettings = yield this.Queries.initilize(Object.assign({}, data, { branchId }));
                            newQueueSettings.save();
                            return resolve(newQueueSettings);
                        }
                        return reject(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'branch not found'));
                    }
                    resolve(updatedQueueSettings);
                }))
                    .catch((error) => {
                    console.log(error);
                    reject(error);
                });
            });
        });
    }
    /**
     * search queue tags
     */
    searchQueueTags(branchId, searchText, order) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                queue_settings_1.default.findOne({ branchId }).sort({ createdAt: order })
                    .then((queueSettings) => {
                    if (!queueSettings) {
                        return reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS, 'empty list'));
                    }
                    let tags = [];
                    let settings = queueSettings.toObject();
                    let match = new RegExp(searchText, 'i');
                    console.log('QQTTTT', settings.queueTags.length);
                    for (let i in settings.queueTags) {
                        let check = match.test(settings.queueTags[i].tagName);
                        if (check) {
                            tags.push(settings.queueTags[i]);
                        }
                    }
                    resolve({
                        branchId,
                        queueTags: tags
                    });
                })
                    .catch((error) => {
                    reject(error);
                });
            });
        });
    }
}
exports.default = QueueSettings;
