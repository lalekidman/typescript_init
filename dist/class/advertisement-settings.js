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
const settings_1 = require("../models/settings");
const RC = require("../utils/response-codes");
const app_error_1 = require("../utils/app-error");
const uuid = require("uuid");
const queries_1 = require("../utils/queries");
const aws_1 = require("../utils/aws");
const _ = require('lodash');
class QueueSettings {
    constructor() {
        this.Queries = new queries_1.default(settings_1.default);
        this.Aws = new aws_1.default();
    }
    /**
     * get ad settings of a specific branch
     */
    getBranchAdvertisementSettings(branchId) {
        return new Promise((resolve, reject) => {
            settings_1.default.findOne({ branchId })
                .then((adSettings) => {
                if (!adSettings) {
                    reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS));
                }
                // @ts-ignore
                let settings = adSettings.toObject();
                settings.gallery = _.orderBy(settings.gallery, ["sortIndex", "createdAt"], ["asc", "desc"]);
                settings.advertisements = _.orderBy(settings.advertisements, ["sortIndex", "createdAt"], ["asc", "desc"]);
                resolve(settings);
            })
                .catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    /**
     * update branch advertisement settings
     */
    updateBranchAdvertisementSettings(branchId, data) {
        return new Promise((resolve, reject) => {
            settings_1.default.findOne({ branchId })
                .then((settings) => __awaiter(this, void 0, void 0, function* () {
                settings.updatedAt = Date.now();
                settings.enableCustomQr = data.enableCustomQr;
                settings.customQrLink = data.customQrLink;
                settings.imagePreviewDuration = data.imagePreviewDuration;
                if (data.advertisements.length > 0) {
                    for (let i in settings.advertisements) {
                        let adsAsset = data.advertisements.find((asset) => asset._id === settings.advertisements[i]._id);
                        if (adsAsset) {
                            settings.advertisements[i].isActive = adsAsset.isActive;
                            settings.advertisements[i].sortIndex = adsAsset.sortIndex;
                        }
                    }
                }
                if (data.adsToDelete && data.adsToDelete.length >= 1) {
                    for (let i in data.adsToDelete) {
                        // @ts-ignore
                        yield this.deleteMedia(branchId, data.adsToDelete[i], 'advertisements');
                    }
                }
                settings.save()
                    .then((updatedSettings) => __awaiter(this, void 0, void 0, function* () {
                    const adSettings = yield this.getBranchAdvertisementSettings(branchId);
                    resolve(adSettings);
                }))
                    .catch((error) => {
                    console.log(error);
                    reject(error);
                });
            }))
                .catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    /**
     * upload Image
    //  */
    uploadImage(branchId, file, fileSize, field) {
        return new Promise((resolve, reject) => {
            const s3FolderPath = `branch/${branchId}/${field}`;
            const s3Path = `${s3FolderPath}/${file.name}`;
            settings_1.default.findOne(Object.assign({ branchId }, field === 'advertisement' ? { "advertisements.s3Path": { $ne: s3Path } } : {}, field === 'gallery' ? { "gallery.s3Path": { $ne: s3Path } } : {}))
                .then((settings) => __awaiter(this, void 0, void 0, function* () {
                if (!settings) {
                    return reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS, 'settings not found or you are trying to upload a file that already exists in same directory'));
                }
                if ((fileSize + settings.storageUsedInMb) > settings.storageLimitInMb) {
                    return reject({
                        errorMsg: "exceeds maximum storage Limit",
                        storageUsed: settings.storageUsedInMb,
                        storageLimit: settings.storageLimitInMb
                    });
                }
                const fileUpload = yield this.Queries.upload(s3FolderPath, file);
                let mediaLink = fileUpload.imageUrl;
                const newGalleryAsset = {
                    _id: uuid(),
                    imageUrl: mediaLink,
                    isActive: false,
                    fileName: fileUpload.fileName,
                    //@ts-ignore
                    fileType: fileUpload.fileName.split(".")[fileUpload.fileName.split(".").length - 1],
                    s3Path,
                    fileSizeInMb: fileSize,
                    createdAt: Date.now()
                };
                settings.storageUsedInMb += fileSize;
                settings[field].push(newGalleryAsset);
                settings.save()
                    .then((updatedSettings) => {
                    let media = _.orderBy(updatedSettings[field], ["createdAt", "sortIndex"], ["desc", "asc"]);
                    return resolve({
                        branchId,
                        data: { fieldName: field, media }
                    });
                })
                    .catch((error) => {
                    console.log(error);
                    reject(error);
                });
            }))
                .catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    /**
     * delete image from gallery
     */
    deleteMedia(branchId, mediaId, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                settings_1.default.findOne({ branchId })
                    .then((settings) => {
                    if (!settings) {
                        reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS));
                    }
                    let filtered = settings[field].filter((asset) => {
                        if (asset._id !== mediaId) {
                            return asset;
                        }
                    });
                    let deleted = settings[field].find((element) => element._id === mediaId);
                    if (!deleted) {
                        reject(new app_error_1.default(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS));
                    }
                    this.Aws.deleteFile(deleted.s3Path);
                    settings.storageUsedInMb -= deleted.fileSizeInMb;
                    settings[field] = filtered;
                    settings.save()
                        .then((updatedSettings) => {
                        return resolve({
                            branchId,
                            data: { field, media: updatedSettings[field] }
                        });
                    })
                        .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
                })
                    .catch((error) => {
                    console.log(error);
                    reject(error);
                });
            });
        });
    }
}
exports.default = QueueSettings;
