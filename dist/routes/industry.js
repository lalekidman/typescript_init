"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HttpStatus = require("http-status-codes");
const industry_1 = require("../class/industry");
const multiPartMiddleWare = require('connect-multiparty')();
class AccountRoute {
    constructor() {
        this.add = (req, res, next) => {
            console.log('req: ', req.body);
            const { icon } = req.files;
            this.industry
                .save(Object.assign({}, req.body, { icon }))
                .then((industry) => {
                res.status(HttpStatus.CREATED).send({
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
        this.update = (req, res, next) => {
            const { icon } = req.files;
            const { industryId } = req.params;
            this.industry
                .updateOne(industryId, Object.assign({}, req.body, { icon }))
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
            this.industry
                .lists()
                .then((industryList) => {
                res.status(HttpStatus.OK).send({
                    success: true,
                    data: industryList
                });
            })
                .catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send({ error: err.message });
                // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
            });
        };
        this.findOne = (req, res, next) => {
            const { industryId = '' } = req.params;
            this.industry
                .viewById(industryId)
                .then((industryList) => {
                res.status(HttpStatus.OK).send({
                    success: true,
                    data: industryList
                });
            })
                .catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send({ error: err.message });
                // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
            });
        };
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
        this.industry = new industry_1.default();
    }
    initializeRoutes() {
        this.app.get('/:industryId', this.findOne);
        this.app.post('/', multiPartMiddleWare, this.add);
        this.app.patch('/:industryId', multiPartMiddleWare, this.update);
        this.app.get('/', this.list);
        return this.app;
    }
}
exports.default = AccountRoute;
