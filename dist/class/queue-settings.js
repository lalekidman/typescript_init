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
                queue_settings_1.default.findOneAndUpdate({ branchId }, Object.assign({}, data, { updatedAt: Date.now() }), { new: true })
                    .then((updatedSettings) => {
                    resolve(updatedSettings);
                })
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
                queue_settings_1.default.findOne({ branchId })
                    .then((queueSettings) => {
                    if (!queueSettings) {
                        return reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS, 'empty list'));
                    }
                    let tags = [];
                    let match = new RegExp(searchText, 'i');
                    for (let i in queueSettings.queueTags) {
                        let check = match.test(queueSettings.queueTags[i].tagName);
                        if (check) {
                            tags.push(queueSettings.queueTags[i]);
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
