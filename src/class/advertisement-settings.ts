import SettingsModel, { IBranchSettingsModel } from '../models/settings'
import ISetting, {Gallery} from '../interfaces/settings'
import * as RC from '../utils/response-codes'
import AppError from '../utils/app-error'
import * as uuid from 'uuid'
import { IUpdateBranchAdvertisementSettings } from '../utils/interfaces'
import Queries from '../utils/queries'
import Aws from '../utils/aws'



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
          resolve(adSettings)
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
  public updateBranchAdvertisementSettings(branchId: string, data: IUpdateBranchAdvertisementSettings) {
    return new Promise((resolve, reject) => {
      SettingsModel.findOne({branchId})
      .then(async (settings: any) => {
        settings.updatedAt = Date.now()
        settings.enableCustomQr = data.enableCustomeQr
        settings.customQrLink = data.customQrLink
        settings.imagePreviewDuration = data.imagePreviewDuration
        if (data.advertisements.length > 0) {
          for (let i in settings.advertisements) {
            let adsAsset = data.advertisements.find((asset: any) => asset._id === settings.advertisements[i]._id)
            if (adsAsset) {
              settings.advertisements[i].isActive = adsAsset.isActive
            }
          }
        }
        for (let i in data.adsToDelete) {
          // @ts-ignore
          await this.deleteMedia(branchId, data.adsToDelete[i], 'advertisements')
        }
        settings.save()
        .then(async (updatedSettings: any) => {
          const adSettings = await this.getBranchAdvertisementSettings(branchId)
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
        {
          branchId,
          "advertisements.s3Path": {$ne: s3Path}
        }
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
          return resolve({
            branchId,
            data: {fieldName: field, media: updatedSettings[field]}
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
      .then((settings: any) => {
        if (!settings) {
          reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS))
        }
        let filtered = settings[field].filter((asset: Gallery) => {
          if (asset._id !== mediaId) {
            return asset
          }
        })
        let deleted: Gallery = settings[field].find((element: Gallery) => element._id === mediaId)
        if (!deleted) {
          reject(new AppError(RC.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS))
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
