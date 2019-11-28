import SettingsModel, { IBranchSettingsModel } from '../models/settings'
import ISetting, {Gallery} from '../interfaces/settings'
import * as RC from '../utils/response-codes'
import AppError from '../utils/app-error'
import * as uuid from 'uuid'
import { IUpdateBranchAdvertisementSettings } from '../utils/interfaces'
import Queries from '../utils/queries'
import Aws from '../utils/aws'
import actionLogs from './actionLogs'
import { GENERAL_LOGS_ACTION_TYPE, COLLECTION_NAMES } from '../utils/constants';
const _ = require('lodash')



export default class QueueSettings {
  private Queries: Queries
  private Aws: Aws

  constructor() {
    this.Queries = new Queries(SettingsModel)
    this.Aws = new Aws()
  }
  /**
   * get ad settings of a specific branch
   */
  public getBranchAdvertisementSettings(branchId: string) {
    return new Promise((resolve, reject) => {
      SettingsModel.findOne({branchId})
        .then((adSettings) => {
          if (!adSettings) {
            reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS))
          }
          // @ts-ignore
          let settings = adSettings.toObject()
          settings.gallery = _.orderBy(settings.gallery, ["sortIndex", "createdAt"], ["asc", "desc"])
          settings.advertisements = _.orderBy(settings.advertisements, ["sortIndex", "createdAt"], ["asc", "desc"])
          resolve(settings)
        })
        .catch((error) => {
          console.log(error)
          reject(error)
        })
    })
  }
  /**
   * update branch advertisement settings
   */
  public updateBranchAdvertisementSettings(branchId: string, data: IUpdateBranchAdvertisementSettings, oldData: IBranchSettingsModel, source: string = '', actionBy: any = {}) {
    return new Promise((resolve, reject) => {
      SettingsModel.findOne({branchId})
      .then(async (settings: any) => {
        settings.updatedAt = Date.now()
        settings.enableCustomQr = data.enableCustomQr
        settings.customQrLink = data.customQrLink
        settings.imagePreviewDuration = data.imagePreviewDuration
        if (data.advertisements.length > 0) {
          for (let i in settings.advertisements) {
            let adsAsset = data.advertisements.find((asset: any) => asset._id === settings.advertisements[i]._id)
            if (adsAsset) {
              settings.advertisements[i].isActive = adsAsset.isActive
              settings.advertisements[i].sortIndex = adsAsset.sortIndex
            }
          }
        }
        settings.save()
        .then(async (updatedSettings: any) => {
          if (data.adsToDelete && data.adsToDelete.length >= 1) {
            for (let i in data.adsToDelete) {
              // @ts-ignore
              try {
                await this.deleteMedia(branchId, data.adsToDelete[i], 'advertisements')
              }
              catch (error) {
                return reject(error)
              }
            }
          }
          const adSettings = await this.getBranchAdvertisementSettings(branchId)
          // log action
          actionLogs.save({
            actionBy,
            actionType: GENERAL_LOGS_ACTION_TYPE.EDIT,
            branchId: branchId,
            collectionName: COLLECTION_NAMES.BRANCH,
            eventSummary: `Advertisement Settings of branch ${branchId} has been modified`,
            module: 'Branch Settings - Advertisement Settings',
            oldData,
            newData: adSettings,
            platform: source
          })
          resolve(adSettings)
        })
        .catch((error: any) => {
          console.log(error)
          reject(error)
        })
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  }
  /**
   * upload Image
  //  */
  public uploadImage(branchId: string, file: any, fileSize: number, field: string) {
    return new Promise((resolve, reject) => {
      const s3FolderPath = `branch/${branchId}/${field}`
      const s3Path = `${s3FolderPath}/${file.name}`
      SettingsModel.findOne(
        Object.assign(
          {branchId},
          field === 'advertisement' ? {"advertisements.s3Path": {$ne: s3Path}} : {},
          field === 'gallery' ? {"gallery.s3Path": {$ne: s3Path}} : {},
        )
      )
      .then(async (settings: any) => {
        if (!settings) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS,
            'settings not found or you are trying to upload a file that already exists in same directory'))
        }
        if ((fileSize + settings.storageUsedInMb) > settings.storageLimitInMb) {
          return reject({
            errorMsg: "exceeds maximum storage Limit",
            storageUsed: settings.storageUsedInMb,
            storageLimit: settings.storageLimitInMb
          })
        }
        const fileUpload = await this.Queries.upload(s3FolderPath, file)
        let mediaLink = fileUpload.imageUrl
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
        }
        settings.storageUsedInMb += fileSize
        settings[field].push(newGalleryAsset)
        settings.save()
        .then((updatedSettings: any) => {
          let media = _.orderBy(updatedSettings[field], ["createdAt", "sortIndex"], ["desc", "asc"])
          return resolve({
            branchId,
            data: {fieldName: field, media}
          })
        })
        .catch((error: Error) => {
          console.log(error)
          reject(error)
        })
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  }

  /**
   * delete image from gallery
   */
  public async deleteMedia(branchId: string, mediaId: string, field: string) {
    return new Promise((resolve, reject) => {
      SettingsModel.findOne({branchId})
      .then(async (settings: any) => {
        if (!settings) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS))
        }
        let filtered = settings[field].filter((asset: Gallery) => {
          if (asset._id !== mediaId) {
            return asset
          }
        })
        let deleted: Gallery = await settings[field].find((element: Gallery) => element._id === mediaId)
        console.log('DELETED', deleted)
        if (!deleted) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS, 'delete error. media does not exist'))
        }
        this.Aws.deleteFile(deleted.s3Path)
        settings.storageUsedInMb -= deleted.fileSizeInMb
        settings[field] = filtered
        settings.save()
        .then((updatedSettings: any) => {
          return resolve({
            branchId,
            data: {field, media: updatedSettings[field]}
          })
        })
        .catch((error: Error) => {
          console.log(error)
          reject(error)
        })
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  }
}
