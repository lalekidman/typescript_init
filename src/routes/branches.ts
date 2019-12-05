import {Request, Response, NextFunction, Router, response} from 'express'
import BranchSettings from '../class/settings'
import Branches from '../class/branches'
import Partner from '../class/partner'
import Industry from '../class/industry'
import BranchSettingModel from '../models/settings'
import QueueSettingModel from '../models/queue-settings'
import BranchModel, { IBranchModel } from '../models/branches'
import BranchSettingsRoute from './settings'
import * as HttpStatus from 'http-status-codes' 
import * as appConstants from '../utils/constants'
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
const multiPartMiddleWare = require('connect-multiparty')()
import * as regExp from '../utils/regularExpressions'
import { request } from 'http';
import notification from '../class/notification';
import { constructActionBy, ValidateMobileNo } from '../utils/helper';

import QueueSettingsRoute from './queue-settings'
import AdvertisementSettingsRoute from './advertisement-settings'

export default class AccountRoute {

  /**
   * 
   * @param client redis client for token auth
   */
  private readonly app: Router
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
  }
  private mapRequestBody = (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.body) {
      return next()
    }
    var {data} = req.body
    try {
      req.body = data ? JSON.parse(data) : req.body
      console.log('FUCKING DATA: ', req.body)
    }
    catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
        '**@request body.data is JSON unparsable'))
    }
    return next()
  }
  /**
   * add branch route
   */
  public add = (req: IRequest, res: Response, next: NextFunction) => {
    const {partnerId = ''} = req.params
    const {avatar, banner, accountAvatar} = req.files
    var data = req.body
    const {account} = data
    const user = req.headers.user ? JSON.parse(<any> req.headers.user) : {account: {}}
    new Branches()
    .save(partnerId, {...data, avatar, banner, account: account ? {...account, avatar: accountAvatar} : {}}, user)
    .then((response) => {
      res.status(HttpStatus.OK).send({
        success: true,
        data: response
      })
    })
    .catch(err => {
      if (err.statusCode) {
        res.status(HttpStatus.BAD_REQUEST).send(err)
      } else {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.ADD_BRANCH_FAILED, err.message))
      }
    })
  }
  /**
   * get branch data by branchId
   */
  public findByBranchId = async (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.query
    return BranchModel
      .findOne({
        branchId: branchId.toString().trim()
      })
      .then(async (branch) => {
        if (!branch) {
          throw new Error('No branch found.')
        }
        const partner = await new Partner().findOne(branch.partnerId)
        const settings = await BranchSettingModel.findOne({
          branchId: branchId
        })
        res.status(HttpStatus.OK).send({
          ...JSON.parse(JSON.stringify(branch)),
          partnerName: partner.name,
          partnerAvatarUrl: partner.avatarUrl,
          settings: settings
        })
      })
      .catch(err => {
        console.log('ERROR: ', err)
        if (err.statusCode) {
          res.status(HttpStatus.BAD_REQUEST).send(err)
        } else {
          res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.FETCH_BRANCH_DETAILS_FAILED, err.message))
        }
      })
  }
  /**
   * get branch lists
   */
  public branchList = async (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = '', partner} = req.query
    return new Branches()
      .getList(req.query)
      .then(async (data) => {
        const {data: branches} = data
        const branchesFullDetails = await Promise.all(branches.map(async (branch) => {
          const partner = await new Partner().findOne(branch.partnerId)
          const responseData = {
            ...JSON.parse(JSON.stringify(branch)),
            partnerName: partner.name,
            partnerAvatarUrl: partner.avatarUrl
          }
          const industry = await new Industry().findById(partner.industryId)
          if (industry) {
            responseData.industryId = industry._id 
            responseData.industryName = industry.name 
            responseData.industry = industry 
            const ind = Array.isArray(industry.categoryList) ? industry.categoryList.findIndex((category: any) => category._id === partner.categoryId) : -1
            responseData.categoryType = ind >= 0 ? industry.categoryList[ind].name : ''
          }
          const settings = await BranchSettingModel.findOne({
            branchId: branchId
          })
          responseData.settings = settings
          return responseData
        }))
        res.status(HttpStatus.OK).send({...data, data: branchesFullDetails})
      })
      .catch(err => {
        if (err.statusCode) {
          res.status(HttpStatus.BAD_REQUEST).send(err)
        } else {
          res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.FETCH_BRANCH_LIST_FAILED, err.message))
        }
      })
  }
  /**
   * get branch data by id
   */
  public findOne = async (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.params
    const {fullData, displayAll, withSettings = 0} = req.query
    try {
      const branch = await new Branches().findOne({
        _id: branchId
      })
      const partner = await new Partner().findOne(branch.partnerId)
      const responseData = {
        ...JSON.parse(JSON.stringify(branch)),
        partnerName: partner.name,
        partnerAvatarUrl: partner.avatarUrl
      }
      const industry = await new Industry().findById(partner.industryId)
      if (industry) {
        responseData.industryId = industry._id 
        responseData.industryName = industry.name 
        responseData.industry = industry 
        const ind = Array.isArray(industry.categoryList) ? industry.categoryList.findIndex((category: any) => category._id === partner.categoryId) : -1
        responseData.categoryType = ind >= 0 ? industry.categoryList[ind].name : ''
      }
      // if (withSettings) {
        const settings = await BranchSettingModel.findOne({
          branchId: branchId
        })
        // const queueSettings = await QueueSettingModel.findOne({
        //   branchId: branchId
        // })
        responseData.settings = settings
        // responseData.queueSettings = queueSettings
      // }
      res.status(HttpStatus.OK).send(responseData)
    } catch (err) {
      console.log('ERR: ', err)
      if (err.statusCode) {
        res.status(HttpStatus.BAD_REQUEST).send(err)
      } else {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.FETCH_BRANCH_DETAILS_FAILED, err.message))
      }
    }
  }
  /**
   * validate update branch details
   */
  private validateOnUpdateBranch(req: IRequest, res: Response, next: NextFunction) {
    // validate if files are images
    let avatar, banner
    if (req.files) {
      avatar = req.files.avatar
      banner = req.files.banner
    }
    if (avatar) {
      if (!regExp.validImages.test(avatar.type)) {
        return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
          'avatar requires a valid image'))
      }
    }
    if (banner) {
      if (!regExp.validImages.test(banner.type)) {
        return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
          'banner requires a valid image'))
      }
    }
    
    let {about, email, contactNumbers=[], socialLinks=[]} = req.body
    // validate req body
    console.log('ereq.bodyreq.bodyreq.body: ', req.body)
    if (
    typeof(about) !== 'string' || about === '' || 
    typeof(email) !== 'string' || !Array.isArray(contactNumbers) || !Array.isArray(socialLinks)) {
      return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
        '**@request body.data: {categoryId:string, about:string, branchEmail:string, contactNumbers:array, socialLinks:array}'))
    }
    // validate if email is valid
    let validateEmail = regExp.validEmail.test(email)
    if (!validateEmail) {
      return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'invalid branchEmail format'))
    }
    // validate contactNumbers
    for (let i in contactNumbers) {
      if (typeof contactNumbers[i].isPrimary === 'string' && (contactNumbers[i].isPrimary === 'true' || contactNumbers[i].isPrimary === 'false')) {
        contactNumbers[i].isPrimary = contactNumbers[i].isPrimary === 'true'
      }
      contactNumbers[i].number = ValidateMobileNo(contactNumbers[i].number)
      if ((typeof contactNumbers[i].isPrimary !== 'boolean') || typeof (contactNumbers[i].number) !== 'string'
      || appConstants.CONTACT_NUMBER_TYPES.indexOf(contactNumbers[i].type) === -1) {
        return res.status(HttpStatus.BAD_REQUEST)
        .json(new AppError(RC.UPDATE_BRANCH_FAILED,
          '@request body.data: contactNumbers: [{id?:string, isPrimary:boolean, number:validNumber, type:landline|mobile}]'))
      }
      // validate mobile number
      if (contactNumbers[i].type === 'mobile') {
        if (!regExp.validNumber.test(contactNumbers[i].number)) {
          return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'invalid mobile number'))
        }
      }
      if (contactNumbers[i].type === 'landline') {
        if (!regExp.validLandline.test(contactNumbers[i].number)) {
          return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'invalid landline'))
        }
      }
    }
    // validate Links
    for (let i in socialLinks) {
      if (typeof socialLinks[i].url !== 'string' || appConstants.LINK_TYPES.indexOf(socialLinks[i].type) === -1) {
        return res.status(HttpStatus.BAD_REQUEST)
        .json(new AppError(RC.UPDATE_BRANCH_FAILED,
          '@request body.data: socialLinks: [{id?:string, url:string, type:facebook|instagram|company}]'))
      }
      if (socialLinks[i].type === 'facebook') {
        if (!regExp.validFbLink.test(socialLinks[i].url)) {
          return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'Invalid Fb Link'))
        }
      }
      if (socialLinks[i].type === 'instagram') {
        if (!regExp.validInstagramLink.test(socialLinks[i].url)) {
          return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'Invalid Instagram Link'))
        }
      }
      if (socialLinks[i].type === 'company') {
        if (!regExp.validUrl.test(socialLinks[i].url)) {
          return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, 'Invalid Company Website'))
        }
      }
    }
    next()
  }
  /**
   * update branch details
   */
  private updateBranch(req: IRequest, res: Response) {
    const {branchId} = req.params
    const {avatar = null, banner = null} = <any> req.files || {}
    let accountData = req.headers.user ? JSON.parse(<any>req.headers.user) : {}
    let {data} = req.body
    // if data is empty, it should be all on req.body
    let {
      categoryId,
      about,
      branchEmail,
      contactNumbers=[],
      socialLinks=[],
      assignedDevices,
      subscription,
      isWeeklyOpened,
      featuredAccess,
      coordinates,
      operationHours,
      address
    } = data ? JSON.parse(data) : req.body
    new Branches().updateBranch(branchId, {
      categoryId,
      about,
      email: branchEmail,
      contactNumbers,
      socialLinks,
      avatar,
      banner,
      assignedDevices,
      subscription,
      isWeeklyOpened,
      featuredAccess,
      coordinates,
      operationHours,
      address
    })
    .then((updatedBranch: any) => {
      // publish to redis subscribers
      req.app.get('redisPublisher').publish('UPDATE_BRANCH', JSON.stringify({data: updatedBranch, branchId}))
      // notify business for changes that happened
      // for (let i in updatedBranch.updates) {
      //   notification.invokeNotif(
      //     branchId,
      //     {actionBy: `${accountData.account.firstName} ${accountData.account.lastName}`},
      //     updatedBranch.updates[i]
      //   )
      // }
      res.status(HttpStatus.OK).json(updatedBranch)
    })
    .catch((error) => {
      console.log('NO ERROR? : ', error)
      res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, error.message))
    })
  }
  public initializeRoutes () {
    this.app.use(multiPartMiddleWare, this.mapRequestBody)
    this.app.use('/:branchId/settings', new BranchSettingsRoute().initializeRoutes())
    this.app.use('/:branchId/advertisement-settings', new AdvertisementSettingsRoute().initializeRoutes())
    this.app.use('/:branchId/queue-settings', new QueueSettingsRoute().initializeRoutes())
    this.app.get('/', this.branchList)
    this.app.get('/branchId', this.findByBranchId)
    this.app.get('/:branchId', this.findOne)
    this.app.patch('/:branchId', multiPartMiddleWare,this.validateOnUpdateBranch, this.updateBranch)
    // this.app.patch('/:branchId/address', this.validateOnUpdateAddress, this.updateAddress)
    this.app.post('/:partnerId', multiPartMiddleWare, this.add)
    return this.app
  }
} 