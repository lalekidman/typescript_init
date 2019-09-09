"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HttpStatus = require("http-status-codes");
const partners_1 = require("../class/partners");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
class AccountRoute {
    constructor() {
        this.add = (req, res, next) => {
            const { avatar } = req.files;
            this.partner
                .save(Object.assign({}, req.body, { avatar }))
                .then((partner) => {
                res.status(HttpStatus.CREATED).send({
                    success: true,
                    data: partner
                });
            })
                .catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.ADD_PARTNER_FAILED, err.message));
                // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
            });
        };
        this.update = (req, res, next) => {
            const { avatar } = req.files;
            const { partnerId } = req.params;
            this.partner
                .updateOne(partnerId, Object.assign({}, req.body, { avatar }))
                .then((industry) => {
                res.status(HttpStatus.ACCEPTED).send({
                    success: true,
                    data: industry
                });
            })
                .catch(err => {
                console.log(err);
                res.status(HttpStatus.BAD_REQUEST).send({ error: err.message });
                // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
            });
        };
        this.list = (req, res, next) => {
            this.partner
                .lists()
                .then((response) => {
                res.status(HttpStatus.OK).send(response);
            })
                .catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send({ error: err.message });
                // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
            });
        };
        this.findOne = (req, res, next) => {
            const { partnerId = '' } = req.params;
            this.partner
                .viewById(partnerId)
                .then((response) => {
                if (!response._id) {
                    throw new Error('No business partner found.');
                }
                res.status(HttpStatus.OK).send({
                    success: true,
                    data: response
                });
            })
                .catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.FETCH_PARTNER_DETAILS_FAILED, err.message));
            });
        };
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
        this.partner = new partners_1.default();
    }
    initializeRoutes() {
        this.app.post('/', multiPartMiddleWare, this.add);
        this.app.patch('/:partnerId', multiPartMiddleWare, this.update);
        this.app.get('/:partnerId', this.findOne);
        this.app.get('/', this.list);
        return this.app;
    }
}
exports.default = AccountRoute;
