"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HttpStatus = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const RC = require("../utils/response-codes");
const multiPartMiddleWare = require('connect-multiparty')();
const helper_1 = require("../utils/helper");
const advertisement_settings_1 = require("../class/advertisement-settings");
const regExp = require("../utils/regularExpressions");
const advertisementSettings = new advertisement_settings_1.default();
class Route {
    constructor() {
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    /**
     * ** MIDDLEWARE ** on update advertisement settings
     */
    onUpdateAdvertisementSettings(req, res, next) {
        const { enableCustomQr = false, customQrLink = '', imagePreviewDuration = 3, advertisements = [], adsToDelete = [] } = req.body;
        // verify request.body
        if (typeof (enableCustomQr) !== 'boolean' ||
            typeof (customQrLink) !== 'string' ||
            typeof (imagePreviewDuration) !== 'number' ||
            !Array.isArray(advertisements)) {
            return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS));
        }
        for (let i in advertisements) {
            if (typeof advertisements[i]._id === 'undefined' || typeof advertisements[i].isActive !== 'boolean') {
                return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS, 'gallery must be like: [{_id: "someIdHere", isActive:boolean}]'));
            }
        }
        if (imagePreviewDuration < 3) {
            return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS, 'imagePreviewDuration minimum value is 3'));
        }
        if (!regExp.validUrl.test(customQrLink)) {
            return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS, 'invalid Link'));
        }
        for (let i in adsToDelete) {
            if (typeof (adsToDelete[i]) !== 'string') {
                return res.status(HttpStatus.BAD_REQUEST).json(new app_error_1.default(RC.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS, '** request body: adsToDelete:Array<string>'));
            }
        }
        next();
    }
    /**
     * validate if file exists
     */
    fileExists(req, res, next) {
        if (typeof (req.files) === 'undefined') {
            return res.status(HttpStatus.BAD_REQUEST)
                .json(new app_error_1.default(RC.INALID_VALUE, '@requestBody(required): {media:file}'));
        }
        next();
    }
    /**
     * get branch Advertisement Settings
     */
    getBranchAdvertisementSettings(req, res) {
        const { branchId } = req.params;
        advertisementSettings.getBranchAdvertisementSettings(branchId)
            .then((adSettings) => {
            res.status(HttpStatus.OK).json(adSettings);
        })
            .catch((error) => {
            res.status(HttpStatus.NOT_FOUND).json(error);
        });
    }
    /**
     * update branch Advertisement Settings
     */
    updateBranchAdvertisementSettings(req, res) {
        const { enableCustomQr = false, customQrLink = '', imagePreviewDuration = 3, advertisements = [], adsToDelete = [] } = req.body;
        const data = {
            //@ts-ignore
            enableCustomQr,
            customQrLink,
            imagePreviewDuration,
            advertisements,
            adsToDelete
        };
        const { branchId } = req.params;
        advertisementSettings.updateBranchAdvertisementSettings(branchId, data)
            .then((updatedSettings) => {
            res.status(HttpStatus.OK).json(updatedSettings);
        })
            .catch((error) => {
            res.status(HttpStatus.NOT_FOUND).json(error);
        });
    }
    /**
     * upload to gallery
     */
    uploadToGallery(req, res) {
        const { branchId } = req.params;
        const { media } = req.files;
        const fileSize = helper_1.getFileSize(media.path);
        advertisementSettings.uploadImage(branchId, media, fileSize, 'gallery')
            .then((updatedSettings) => {
            res.status(HttpStatus.OK).json(updatedSettings);
        })
            .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
        });
    }
    /**
     * upload media
     */
    uploadToAds(req, res) {
        const { branchId } = req.params;
        const { media } = req.files;
        const fileSize = helper_1.getFileSize(media.path);
        advertisementSettings.uploadImage(branchId, media, fileSize, 'advertisements')
            .then((updatedSettings) => {
            res.status(HttpStatus.OK).json(updatedSettings);
        })
            .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
        });
    }
    /**
     * delete media from gallery
     */
    deleteMedia(req, res) {
        const { branchId } = req.params;
        const { mediaId } = req.body;
        advertisementSettings.deleteMedia(branchId, mediaId, 'gallery')
            .then((updatedSettings) => {
            res.status(HttpStatus.OK).json(updatedSettings);
        })
            .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
        });
    }
    initializeRoutes() {
        this.app.get('/', this.getBranchAdvertisementSettings);
        this.app.patch('/', this.onUpdateAdvertisementSettings, this.updateBranchAdvertisementSettings);
        this.app.post('/upload-to-gallery', multiPartMiddleWare, this.fileExists, this.uploadToGallery);
        this.app.post('/upload-to-ads-collection', multiPartMiddleWare, this.fileExists, this.uploadToAds);
        this.app.delete('/delete-in-gallery', this.deleteMedia);
        return this.app;
    }
}
exports.default = Route;
