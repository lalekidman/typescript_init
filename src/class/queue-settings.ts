import QueueSettingsModel, {IQueueSettingsModel} from '../models/queue-settings'
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
        {
          ...data,
          ...{updatedAt: Date.now()}
        },
        {new: true}
      )
      .then((updatedSettings) =>{
        resolve(updatedSettings)
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
      QueueSettingsModel.findOne({branchId})
      .then((queueSettings: any) => {
        if (!queueSettings) {
          return reject(new AppError(RC.NOT_FOUND_BRANCH_QUEUE_SETTINGS, 'empty list'))
        }
        let tags = []
        let match = new RegExp(searchText, 'i')
        for (let i in queueSettings.queueTags) {
          let check = match.test(queueSettings.queueTags[i].tagName)
          if (check) {
            tags.push(queueSettings.queueTags[i])
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