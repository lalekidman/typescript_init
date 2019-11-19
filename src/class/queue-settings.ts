import QueueSettingsModel, {IQueueSettingsModel} from '../models/queue-settings'
import BranchModel from '../models/branches'
import * as RC from '../utils/response-codes'
import AppError from '../utils/app-error'
import * as uuid from 'uuid'
import Queries from '../utils/queries'
import {IUpdateBranchQueueSettings} from '../utils/interfaces'

export default class QueueSettings {
  Queries: Queries

  constructor() {
    this.Queries = new Queries(QueueSettingsModel)
  }

  /**
   * get queue settings by branch id
   */
  public async getQueueSettingsByBranchId(branchId: string) {
    return new Promise((resolve, reject) => {
      QueueSettingsModel.findOne({branchId})
      .then((queueSettings) => {
        if (!queueSettings) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS))
        }
        resolve(queueSettings)
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  }

  /**
   * update branch Queue Settings
   */
  public async updateBranchQueueSettings(branchId: string, data: IUpdateBranchQueueSettings) {
    return new Promise((resolve, reject) => {
      QueueSettingsModel.findOneAndUpdate(
        {branchId},
        data,
        {new: true}
      )
      .then(async (updatedQueueSettings) => {
        if (!updatedQueueSettings) {
          // check if branch exists
          let checkBranch = await BranchModel.findOne({_id: branchId})
          if (checkBranch) {
            const newQueueSettings = <IQueueSettingsModel> await this.Queries.initilize({...data, branchId})
            newQueueSettings.save()
            return resolve(newQueueSettings)
          }
          return reject(new AppError(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'branch not found'))
        }
        resolve(updatedQueueSettings)
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  }

  /**
   * search queue tags
   */
  public async searchQueueTags(branchId: string, searchText: string, order: number) {
    return new Promise((resolve, reject) => {
      QueueSettingsModel.findOne({branchId}).sort({createdAt: order})
      .then((queueSettings: any) => {
        if (!queueSettings) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS, 'empty list'))
        }
        let tags = []
        let settings = queueSettings.toObject()
        let match = new RegExp(searchText, 'i')
        console.log('QQTTTT', settings.queueTags.length)
        for (let i in settings.queueTags) {
          let check = match.test(settings.queueTags[i].tagName)
          if (check) {
            tags.push(settings.queueTags[i])
          }
        }
        resolve({
          branchId,
          queueTags: tags
        })
      })
      .catch((error) => {
        reject(error)
      })
    })
  }

}