import {Request, Response, NextFunction, Router, response} from 'express'
import BranchSettingsRoute from './settings'
import * as HttpStatus from 'http-status-codes' 
import * as appConstants from '../utils/constants'
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
const multiPartMiddleWare = require('connect-multiparty')()
import * as regExp from '../utils/regularExpressions'
import { ValidateMobileNo } from '../utils/helper';
import BranchRoute from './branches'
import notification from '../class/notification';
import Branches from '../class/branches'
import AdvertisementSettingsRoute from './advertisement-settings'
import QueueSettingsRoute from './queue-settings'
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
  /**
   * ** MIDDLEWARE ** update branch data validation
   */
  private validateOnUpdateAddress(req: IRequest, res: Response, next: NextFunction) {
    let {street, province, city, zipcode} = req.body
    const validationError = new AppError(
      RC.UPDATE_BRANCH_FAILED,
      '** @request body: {street:string, province:string, city:string, zipcode:number(length=4)}'
    )
    // validate request body
    if (typeof(street) !== 'string' || typeof(province) !== 'string' || typeof(city) !== 'string' || typeof(zipcode) !== 'number') {
      return res.status(HttpStatus.BAD_REQUEST).json(validationError)
    }
    if (!street || !province || !city || zipcode.toString().length !== 4) {
      return res.status(HttpStatus.BAD_REQUEST).json(validationError)
    }
    return next()
  }
  /**
   * update branch address
   */
  private async updateAddress(req: IRequest, res: Response) {
    const {branchId} = req.params
    // @ts-ignore
    let accountData = JSON.parse(req.headers.user)
    // extract data from request body
    const {street, province, city, zipcode} = req.body
    // update branch address
    new Branches()
      .updateAddress(branchId, {street, province, city, zipcode})
      .then((updatedBranch: any) => {
        res.status(HttpStatus.OK).json({_id: updatedBranch._id, address: updatedBranch.address})
      })
      .catch((error) => {
        console.log(error)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
      })
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
    let {data} = req.body
    try {
      data = data ? JSON.parse(data) : req.body
    }
    catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
        '**@request body.data is JSON unparsable'))
    }
    console.log('E:datadatadata ', data)
    let {categoryId, about, branchEmail, contactNumbers=[], socialLinks=[]} = data
    // validate req body
    if (typeof(categoryId) !== 'string' || categoryId === '' ||
    typeof(about) !== 'string' || about === '' || 
    typeof(branchEmail) !== 'string' || !Array.isArray(contactNumbers) || !Array.isArray(socialLinks)) {
      return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED,
        '**@request body.data: {categoryId:string, about:string, branchEmail:string, contactNumbers:array, socialLinks:array}'))
    }
    console.log('Are you jere right?')
    // validate if email is valid
    let validateEmail = regExp.validEmail.test(branchEmail)
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
      address
    })
    .then((updatedBranch: any) => {
      // publish to redis subscribers
      req.app.get('redisPublisher').publish('UPDATE_BRANCH', JSON.stringify({data: updatedBranch, branchId}))
      // notify business for changes that happened
      for (let i in updatedBranch.updates) {
        notification.invokeNotif(
          branchId,
          {actionBy: `${accountData.account.firstName} ${accountData.account.lastName}`},
          updatedBranch.updates[i]
        )
      }
      res.status(HttpStatus.OK).json(updatedBranch)
    })
    .catch((error) => {
      console.log('NO ERROR? : ', error)
      res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, error.message))
    })
  }
  public initializeRoutes () {
    const Branch = new BranchRoute()
    this.app.use('/:branchId/settings', new BranchSettingsRoute().initializeRoutes())
    this.app.use('/:branchId/queue-settings', new QueueSettingsRoute().initializeRoutes())
    this.app.use('/:branchId/advertisement-settings', new AdvertisementSettingsRoute().initializeRoutes())
    this.app.get('/branchId', Branch.findByBranchId)
    this.app.get('/:branchId', Branch.findOne)
    this.app.patch('/:branchId', multiPartMiddleWare,this.validateOnUpdateBranch, this.updateBranch)
    this.app.patch('/:branchId/address', this.validateOnUpdateAddress, this.updateAddress)
    return this.app
  }
} 