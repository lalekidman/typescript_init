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
const express_1 = require("express");
const HttpStatus = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
const queue_settings_1 = require("../class/queue-settings");
const helper_1 = require("../utils/helper");
const appConstants = require("../utils/constants");
const queueSettings = new queue_settings_1.default();
const uuid = require("uuid");
class Route {
    constructor() {
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    /**
     * ** MIDDLEWARE ** validate on update queue settings
     */
    validateOnUpdate(request, response, next) {
        let { features = [], hideCustomerNameField = false, hideMobileNumberField = false, autoSms = true, queuesAway = 3, queueTags = [] } = request.body;
        // validate request body
        if (typeof (hideCustomerNameField) !== 'boolean' ||
            typeof (autoSms) !== 'boolean' ||
            typeof (hideMobileNumberField) !== 'boolean' ||
            typeof (queuesAway) !== 'number') {
            return response.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS));
        }
        // validate features
        let validFeatures = [];
        for (let i in appConstants.FEATURES) {
            validFeatures.push(appConstants.FEATURES[i].key);
        }
        let checkFeatures = helper_1.validateModules(features, appConstants.FEATURES);
        if (!checkFeatures) {
            return response.status(HttpStatus.BAD_REQUEST)
                .json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, `@request body: valid features ${JSON.stringify(appConstants.FEATURES)}`));
        }
        // validate queue Tags
        for (let i in queueTags) {
            if (typeof (queueTags[i]) !== 'string') {
                return response.status(HttpStatus.BAD_REQUEST)
                    .json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'queueTag must be a string'));
            }
        }
        // validate queuesAway
        if (queuesAway < 1) {
            return response.status(HttpStatus.BAD_REQUEST)
                .json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'queues Away must be atleast 1'));
        }
        next();
    }
    /**
     * get branch queue settings
     */
    getBranchQueueSettings(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchId } = request.params;
            queueSettings.getQueueSettingsByBranchId(branchId)
                .then((queueSettings) => {
                response.status(HttpStatus.OK).json(queueSettings);
            })
                .catch((error) => {
                response.status(HttpStatus.NOT_FOUND).json(error);
            });
        });
    }
    /**
     * update queue settings
     */
    updateBranchQueueSettings(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchId } = request.params;
            let { features = [], hideCustomerNameField = false, hideMobileNumberField = false, autoSms = true, queuesAway = 3, queueTags = [] } = request.body;
            // remove duplicated queue tag
            queueTags = [...new Set(queueTags)];
            let processedQueueTags = [];
            for (let i in queueTags) {
                const currentDate = Date.now();
                const tagId = uuid();
                processedQueueTags.push({
                    _id: tagId,
                    id: tagId,
                    tagName: queueTags[i],
                    createdAt: currentDate,
                    updatedAt: currentDate
                });
            }
            let settings = {
                features,
                hideCustomerNameField,
                hideMobileNumberField,
                autoSms,
                queuesAway,
                queueTags: processedQueueTags
            };
            queueSettings.updateBranchQueueSettings(branchId, settings)
                .then((updatedSettings) => {
                response.status(HttpStatus.OK).json(updatedSettings);
            })
                .catch((error) => {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
            });
        });
    }
    /**
     * search queue tags
     */
    searchQueueTags(request, response) {
        const { branchId } = request.params;
        let { searchText = '', offset = "0", limit = "20", order = "1" } = request.query;
        offset = parseInt(offset) ? Math.floor(parseInt(offset)) : 0;
        limit = parseInt(limit) ? Math.floor(parseInt(limit)) : 10;
        order = parseInt(order);
        queueSettings.searchQueueTags(branchId, searchText, order)
            .then((queueTags) => {
            response.status(HttpStatus.OK).json(queueTags);
        })
            .catch((error) => {
            response.status(HttpStatus.NOT_FOUND).json(error);
        });
    }
    initializeRoutes() {
        this.app.get('/', this.getBranchQueueSettings);
        this.app.patch('/', this.validateOnUpdate, this.updateBranchQueueSettings);
        this.app.get('/search-queue-tags', this.searchQueueTags);
        return this.app;
    }
}
exports.default = Route;
