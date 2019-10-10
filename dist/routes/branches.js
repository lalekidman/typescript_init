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
const partner_1 = require("../class/partner");
const settings_1 = require("../models/settings");
const branches_2 = require("../models/branches");
const settings_2 = require("./settings");
const HttpStatus = require("http-status-codes");
const appConstants = require("../utils/constants");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
const regExp = require("../utils/regularExpressions");
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
                const partner = yield new partner_1.default().findOne(branch.partnerId);
                const settings = yield settings_1.default.findOne({
                    branchId: branchId
                });
                res.status(HttpStatus.OK).send(Object.assign({}, JSON.parse(JSON.stringify(branch)), { partnerName: partner.name, partnerAvatarUrl: partner.avatarUrl, settings: settings }));
            }))
                .catch(err => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.FETCH_BRANCH_DETAILS_FAILED, err.message));
                }
            });
        });
        /**
         * get branch lists
         */
        this.branchList = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { branchId = '' } = req.query;
            return branches_2.default
                .find({})
                .then((branches) => __awaiter(this, void 0, void 0, function* () {
                // if (!branch) {
                //   throw new Error('No branch found.')
                // }
                // const settings = await BranchSettingModel.findOne({
                //   branchId: branch._id
                // })
                // res.status(HttpStatus.OK).send({
                //   ...JSON.parse(JSON.stringify(branch)),
                //   // settings: settings
                // })
                res.status(HttpStatus.OK).send(branches);
            }))
                .catch(err => {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.FETCH_BRANCH_LIST_FAILED, err.message));
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
                const partner = yield new partner_1.default().findOne(branch.partnerId);
                const settings = yield settings_1.default.findOne({
                    branchId: branchId
                });
                res.status(HttpStatus.OK).send(Object.assign({}, JSON.parse(JSON.stringify(branch)), { partnerName: partner.name, partnerAvatarUrl: partner.avatarUrl, settings: settings }));
            }
            catch (err) {
                if (err.statusCode) {
                    res.status(HttpStatus.BAD_REQUEST).send(err);
                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).send(new app_error_1.default(RC.FETCH_BRANCH_DETAILS_FAILED, err.message));
                }
            }
        });
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    /**
     * ** MIDDLEWARE ** update branch data validation
     */
    validateOnUpdateAddress(req, res, next) {
        let { street, province, city, zipcode } = req.body;
        const validationError = new app_error_1.default(RC.UPDATE_BRANCH_FAILED, '** @request body: {street:string, province:string, city:string, zipcode:number(length=4)}');
        // validate request body
        if (typeof (street) !== 'string' || typeof (province) !== 'string' || typeof (city) !== 'string' || typeof (zipcode) !== 'number') {
            return res.status(HttpStatus.BAD_REQUEST).json(validationError);
        }
        if (!street || !province || !city || zipcode.toString().length !== 4) {
            return res.status(HttpStatus.BAD_REQUEST).json(validationError);
        }
        return next();
    }
    /**
     * update branch address
     */
    updateAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchId } = req.params;
            // extract data from request body
            let { street, province, city, zipcode } = req.body;
            // update branch address
            branches_2.default.findOneAndUpdate({ _id: branchId }, {
                address: {
                    street,
                    province,
                    city,
                    zipcode
                }
            }, { new: true })
                .then((updatedBranch) => {
                res.status(HttpStatus.OK).json({ _id: updatedBranch._id, address: updatedBranch.address });
            })
                .catch((error) => {
                console.log(error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
            });
        });
    }
    /**
     * validate update branch details
     */
    validateOnUpdateBranch(req, res, next) {
        let { categoryId, about, branchEmail, contactNumbers = [], socialLinks = [] } = req.body;
        // validate req body
        if (typeof (categoryId) !== 'string' || categoryId === '' ||
            typeof (about) !== 'string' || about === '' ||
            typeof (branchEmail) !== 'string' || !Array.isArray(contactNumbers) || !Array.isArray(socialLinks)) {
            return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, '**@request body: {categoryId:string, about:string, branchEmail:string, contactNumbers:array, socialLinks:array}'));
        }
        // validate if email is valid
        let validateEmail = regExp.validEmail.test(branchEmail);
        if (!validateEmail) {
            return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'invalid branchEmail format'));
        }
        // validate contactNumbers
        for (let i in contactNumbers) {
            if (typeof contactNumbers[i].isPrimary !== 'boolean' || typeof contactNumbers[i].number !== 'string'
                || appConstants.CONTACT_NUMBER_TYPES.indexOf(contactNumbers[i].type) === -1) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, '@request body: contactNumbers: [{id?:string, isPrimary:boolean, number:validNumber, type:landline|mobile}]'));
            }
            // validate mobile number
            if (contactNumbers[i].type === 'mobile') {
                if (!regExp.validNumber.test(contactNumbers[i].number)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'invalid mobile number'));
                }
            }
            if (contactNumbers[i].type === 'landline') {
                if (!regExp.validLandline.test(contactNumbers[i].number)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'invalid landline'));
                }
            }
        }
        // validate Links
        for (let i in socialLinks) {
            if (typeof socialLinks[i].url !== 'string' || appConstants.LINK_TYPES.indexOf(socialLinks[i].type) === -1) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, '@request body: socialLinks: [{id?:string, url:string, type:facebook|instagram|company}]'));
            }
            if (socialLinks[i].type === 'facebook') {
                if (!regExp.validFbLink.test(socialLinks[i].url)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'Invalid Fb Link'));
                }
            }
            if (socialLinks[i].type === 'instagram') {
                if (!regExp.validInstagramLink.test(socialLinks[i].url)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'Invalid Instagram Link'));
                }
            }
            if (socialLinks[i].type === 'company') {
                if (!regExp.validUrl.test(socialLinks[i].url)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.UPDATE_BRANCH_FAILED, 'Invalid Company Website'));
                }
            }
        }
        next();
    }
    /**
     * update branch details
     */
    updateBranch(req, res) {
        const { branchId } = req.params;
        let { categoryId, about, branchEmail, contactNumbers = [], socialLinks = [] } = req.body;
        new branches_1.default().updateBranch(branchId, categoryId, about, branchEmail, contactNumbers, socialLinks)
            .then((updatedBranch) => {
            res.status(HttpStatus.OK).json(updatedBranch);
        })
            .catch((error) => {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        });
    }
    initializeRoutes() {
        this.app.use('/:branchId/settings', new settings_2.default().initializeRoutes());
        this.app.get('/', this.branchList);
        this.app.get('/branchId', this.findByBranchId);
        this.app.get('/:branchId', this.findOne);
        this.app.patch('/:branchId', this.validateOnUpdateBranch, this.updateBranch);
        this.app.patch('/:branchId/address', this.validateOnUpdateAddress, this.updateAddress);
        this.app.post('/:partnerId', multiPartMiddleWare, this.add);
        return this.app;
    }
}
exports.default = AccountRoute;
