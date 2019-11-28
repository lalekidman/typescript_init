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

export default class AccountRoute {

  /**
   * 
   * @param client redis client for token auth
   */
  private readonly app: Router
  private projection: any = {
    branchName: 1,
    avatarUrl: 1,
    partnerId: 1,
    address: 1,
    contacts: 1,
    about: 1,
    location: 1,
    bannerUrl: 1
  }
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
  }
  private async getPartnerData (partnerId: string) {
    const partner = await new Partner().findOne(partnerId)
    const industry = await new Industry().findById(partner.industryId)
    const ind = industry ? industry.categoryList.findIndex((category: any) => category._id === partner.categoryId) : -1
    return {
        _id: partner._id,
        name: partner.name,
        avatarUrl: partner.avatarUrl,
        categoryId: partner.categoryId,
        industryId: partner.industryId,
        industries: {
          _id: industry._id,
          name: industry.name,
          category: industry.categoryList[ind].name
        }
      }
  }
  /**
   * get branch data by branchId
   */
  public branchDetails = (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.params
    console.log('HERE RF')
    return BranchModel
      .findOne({
        _id: branchId.toString().trim()
      }, this.projection)
      .then(async (branch) => {
        if (!branch) {
          throw new Error('No branch found.')
        }
        const settings = await BranchSettingModel.findOne({
          branchId: branchId
        })
        res.status(HttpStatus.OK).send({
          ...JSON.parse(JSON.stringify(branch)),
          partner: await this.getPartnerData(branch.partnerId),
          operationHours: settings ? settings.operationHours : [],
          gallery: settings ? settings.gallery : []
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
    return new Branches()
      .getList(req.query, this.projection)
      .then(async (data) => {
        const {data: branches} = data
        const branchesFullDetails = await Promise.all(branches.map(async (branch) => {
          const settings = await BranchSettingModel.findOne({
            branchId: branch._id
          })
          const responseData = {
            ...JSON.parse(JSON.stringify(branch)),
            partner: await this.getPartnerData(branch.partnerId),
            operationHours: settings ? settings.operationHours : [],
            gallery: settings ? settings.gallery : []
          }
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
  public initializeRoutes () {
    this.app.get('/', this.branchList)
    this.app.get('/:branchId', this.branchDetails)
    return this.app
  }
} 