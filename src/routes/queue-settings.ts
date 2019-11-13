import {Request, Response, NextFunction, Router} from 'express'
import BranchSettings from '../class/settings'
import * as HttpStatus from 'http-status-codes' 
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
const multiPartMiddleWare = require('connect-multiparty')()
import QueueSettings from '../class/queue-settings'
import {validateModules} from '../utils/helper'
import * as appConstants from '../utils/constants'
const queueSettings: QueueSettings = new QueueSettings()
import {IUpdateBranchQueueSettings} from '../utils/interfaces'
import uuid = require('uuid');
export default class Route {
  /**
   * 
   * @param client redis client for token auth
   */
  private readonly app: Router

  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
  }

  /**
   * ** MIDDLEWARE ** validate on update queue settings
   */
  private validateOnUpdate(request: IRequest, response: Response, next: NextFunction) {
    let {features=[], hideCustomerNameField=false, hideMobileNumberField=false, autoSms=true, queuesAway=3, queueTags=[]} = request.body
    // validate request body
    if (typeof(hideCustomerNameField) !== 'boolean' ||
    typeof(autoSms) !== 'boolean' ||
    typeof(hideMobileNumberField) !== 'boolean' ||
    typeof(queuesAway) !== 'number') {
      return response.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS))
    }
    // validate features
    let validFeatures = []
    for (let i in appConstants.FEATURES) {
      validFeatures.push(appConstants.FEATURES[i].key)
    }
    let checkFeatures = validateModules(features, appConstants.FEATURES)
    if (!checkFeatures) {
      return response.status(HttpStatus.BAD_REQUEST)
      .json(new AppError(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, `@request body: valid features ${JSON.stringify(appConstants.FEATURES)}`))
    }
    // validate queue Tags
    for (let i in queueTags) {
      if (typeof(queueTags[i]) !== 'string') {
        return response.status(HttpStatus.BAD_REQUEST)
        .json(new AppError(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'queueTag must be a string'))
      }
    }
    // validate queuesAway
    if (queuesAway < 1) {
      return response.status(HttpStatus.BAD_REQUEST)
      .json(new AppError(RC.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS, 'queues Away must be atleast 1'))
    }
    next()
  }

  /**
   * get branch queue settings
   */
  private async getBranchQueueSettings(request: IRequest, response: Response) {
    const {branchId} = request.params
    queueSettings.getQueueSettingsByBranchId(branchId)
    .then((queueSettings) => {
      response.status(HttpStatus.OK).json(queueSettings)
    })
    .catch((error) => {
      response.status(HttpStatus.NOT_FOUND).json(error)

    })
  }

  /**
   * update queue settings
   */
  private async updateBranchQueueSettings(request: IRequest, response: Response) {
   const {branchId} = request.params
   let {features=[], hideCustomerNameField=false, hideMobileNumberField=false, autoSms=true, queuesAway=3, queueTags=[]} = request.body  
    // remove duplicated queue tag
    queueTags = [...new Set(queueTags)]
    let processedQueueTags = []
    for (let i in queueTags) {
      const currentDate = Date.now()
      const tagId = uuid()
      processedQueueTags.push({
        _id: tagId,
        id: tagId,
        tagName: queueTags[i],
        createdAt: currentDate,
        updatedAt: currentDate
      })
    }
    let settings: IUpdateBranchQueueSettings = {
      features,
      hideCustomerNameField,
      hideMobileNumberField,
      autoSms,
      autoSmsQueuesAwayNotification: queuesAway,
      queueTags: processedQueueTags
    }
    queueSettings.updateBranchQueueSettings(branchId, settings)
    .then((updatedSettings) => {
      // publish to redis subscribers
      request.app.get('redisPublisher').publish('UPDATE_QUEUE_SETTINGS', JSON.stringify({data: updatedSettings, branchId}))
      response.status(HttpStatus.OK).json(updatedSettings)
    })
    .catch((error) => {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
    })
  }
  
  /**
   * search queue tags
   */
  private searchQueueTags(request: IRequest, response: Response) {
    const {branchId} = request.params
    let {searchText='', offset="0", limit="20", order="1"} = request.query
    offset = parseInt(offset) ? Math.floor(parseInt(offset)) : 0
    limit = parseInt(limit) ? Math.floor(parseInt(limit)) : 10
    order = parseInt(order)
    queueSettings.searchQueueTags(branchId, searchText, order)
    .then((queueTags) => {
      response.status(HttpStatus.OK).json(queueTags)
    })
    .catch((error) => {
      response.status(HttpStatus.NOT_FOUND).json(error)
    })
  }

  public initializeRoutes () {
    this.app.get('/', this.getBranchQueueSettings)
    this.app.patch('/', this.validateOnUpdate, this.updateBranchQueueSettings)
    this.app.get('/search-queue-tags', this.searchQueueTags)
    return this.app
  }
}