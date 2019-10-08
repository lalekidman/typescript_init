"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_1 = require("../class/settings");
const HttpStatus = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
class Settings {
    constructor() {
        /**
         * route for updateding or incrementing the total queuegroup created.
         */
        this.updateTotalQueueGroupCreated = (req, res, next) => {
            const { branchId = '' } = req.params;
            new settings_1.default(branchId)
                .updateQueueGroupCounter()
                .then((response) => {
                res.status(HttpStatus.OK).send(response);
            })
                .catch((err) => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, err.message));
                }
            });
        };
        /**
         * route for updating operation hours
         */
        this.updateOperationHours = (req, res, next) => {
            const { branchId = '' } = req.params;
            const { isWeeklyOpened = false, operationHours = [] } = req.body;
            new settings_1.default(branchId)
                .updateOperationHours({ isWeeklyOpened, operationHours })
                .then((response) => {
                res.status(HttpStatus.OK).send({
                    operationHours: response.operationHours,
                    isWeeklyOpened: response.isWeeklyOpened
                });
            })
                .catch((err) => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, err.message));
                }
            });
        };
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    initializeRoutes() {
        this.app.patch('/queue-group-counter', this.updateTotalQueueGroupCreated);
        this.app.patch('/operation-hours', this.updateOperationHours);
        return this.app;
    }
}
exports.default = Settings;
