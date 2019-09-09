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
const branches_1 = require("../class/branches");
const settings_1 = require("../models/settings");
const branches_2 = require("../models/branches");
const settings_2 = require("./settings");
const HttpStatus = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
class AccountRoute {
    constructor() {
        /**
         * add branch route
         */
        this.add = (req, res, next) => {
            const { partnerId = '' } = req.params;
            const { avatar } = req.files;
            new branches_1.default()
                .save(partnerId, Object.assign({}, req.body, { avatar }))
                .then((response) => {
                res.status(HttpStatus.OK).send({
                    success: true,
                    data: response
                });
            })
                .catch(err => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.ADD_BRANCH_FAILED, err.message));
                }
            });
        };
        /**
         * get branch data by branchId
         */
        this.findByBranchId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { branchId = '' } = req.query;
            return branches_2.default
                .findOne({
                branchId: branchId.toString().trim()
            })
                .then((branch) => __awaiter(this, void 0, void 0, function* () {
                if (!branch) {
                    throw new Error('No branch found.');
                }
                const settings = yield settings_1.default.findOne({
                    branchId: branch._id
                });
                res.status(HttpStatus.OK).send(Object.assign({}, JSON.parse(JSON.stringify(branch)), { settings: settings }));
            }))
                .catch(err => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.ADD_BRANCH_FAILED, err.message));
                }
            });
        });
        /**
         * get branch data by id
         */
        this.findOne = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { branchId = '' } = req.params;
            try {
                const branch = yield new branches_1.default().findOne({
                    _id: branchId
                });
                const settings = yield settings_1.default.findOne({
                    branchId: branchId
                });
                res.status(HttpStatus.OK).send(Object.assign({}, JSON.parse(JSON.stringify(branch)), { settings: settings }));
            }
            catch (err) {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.ADD_BRANCH_FAILED, err.message));
                }
            }
        });
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    initializeRoutes() {
        this.app.get('/branchId', this.findByBranchId);
        this.app.post('/:partnerId', multiPartMiddleWare, this.add);
        this.app.get('/:branchId', this.findOne);
        this.app.patch('/:branchId/settings', new settings_2.default().initializeRoutes());
        return this.app;
    }
}
exports.default = AccountRoute;
