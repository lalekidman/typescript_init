import Queries from '../utils/queries'
import {IOperationHours} from '../interfaces/settings'
import BranchModel from '../models/branches'
import BranchSettingModel, { IBranchSettingsModel } from '../models/settings'
import { FORM_DATA_TYPES, BRANCH_MODULES } from '../utils/constants';
import { formDataValidator } from '../utils/helper';
import * as uuid from 'uuid/v4'
const DefaultOperationHours = [
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 0,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 1,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 2,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 3,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 4,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 5,
    isWholeDay: false,
  },
  {
    openingTime: 3600000,
    closingTime: 36000000,
    enabled: true,
    day: 6,
    isWholeDay: false,
  }
]
interface IOphData {
  operationHours: IOperationHours[]
  isWeeklyOpened: boolean
}
export default class BranchSettings extends Queries {
  private branchId: string
  constructor (branchId: string) {
    super(BranchSettingModel)
    if (!branchId) {
      throw new Error('branchId is required to initiate the branch settings')
    }
    this.branchId = branchId
  }
  private formDataValidator = (data: any) => {
    const {branchId, operationHours = [], modules = [], socialLinks = []} = data
    return formDataValidator([
      {
        fieldName: 'branchId',
        type: FORM_DATA_TYPES.STRING,
        value: branchId
      },
      {
        fieldName: 'modules',
        type: FORM_DATA_TYPES.ARRAY,
        value: modules
      },
      {
        fieldName: 'operationHours',
        type: FORM_DATA_TYPES.ARRAY,
        value: operationHours
      },
      {
        fieldName: 'socialLinks',
        type: FORM_DATA_TYPES.ARRAY,
        value: socialLinks
      },
    ])
  }
  /**
   * save the settings of the branch
   * @param branchId 
   * @param data 
   */
  //@ts-ignore
  public save (data: any) {
    return this.formDataValidator(data)
      .then(() => {
        const {modules = [BRANCH_MODULES.QUEUE, BRANCH_MODULES.RESERVATION], operationHours = [], socialLinks = []} = data
        const opHours = (operationHours.length === 0 || operationHours.length <=6) ? DefaultOperationHours : operationHours
        const newBranchSetting = this.initilize({
          ...data,
          branchId: this.branchId.toString().trim(),
          modules,
          operationHours: opHours.map((oph: any) => (Object.assign(oph, {_id: uuid()})) ),
          socialLinks: socialLinks.map((social:any) => Object.assign(social, !social.id ? {id: uuid()} : {}))
        })
        return newBranchSetting.save()
      })
  }
  public findOne (query: any, project: any = {}) {
    return BranchSettingModel
      .findOne(query, project)
  }
  /**
   * update total queue group created
   * @param branchId 
   */
  public updateQueueGroupCounter () {
    return BranchSettingModel
      .findOneAndUpdate(
        {
          branchId: this.branchId
        },
        {
          $inc: {
            totalQueueGroup: 1
          }
        },
        {
          new: true
        }
      )
      .then((setting) => {
        if (!setting) {
          throw new Error('No branch data found.')
        }
        return setting
      })
  }
  /**
   * update operationHours
   * @param branchId 
   */
  public updateOperationHours ({isWeeklyOpened = false, operationHours = []}: IOphData) {
    return this.findOne({
      branchId: this.branchId
    })
    .then((branchSettings) => {
      if (!branchSettings) {
        throw new Error('No branch settings found.')
      }
      if (isWeeklyOpened) {
        return branchSettings
          .set({isWeeklyOpened: true})
          .save()
      }
      const opHours = ((operationHours.length === 0 || operationHours.length <=6) ? DefaultOperationHours : operationHours)
        .map((oph: any, index) => {
          if (!oph._id) {
            oph._id = uuid()
          }
          return {
            _id: oph._id,
            openingTime: parseInt(oph.openingTime),
            closingTime: parseInt(oph.closingTime),
            day: parseInt(oph.day) <= 6 && parseInt(oph.day) >= 0 ? parseInt(oph.day) : index,
            isWholeDay: typeof(oph.isWholeDay) === 'boolean' ? oph.isWholeDay : false,
            enabled: typeof(oph.enabled) === 'boolean' ? oph.enabled : false,
          }
        })
      return branchSettings.set({
        isWeeklyOpened: false,
        operationHours: opHours
      })
      .save()
    })
  }
  /**
   * 
   * @param location array of number/float
   *  first element should be the long and the second one is for lat
   */ 
  public updateGeoLocation (location: Number[]) {
    return this.findOne({
      branchId: this.branchId
    })
    .then((branchSettings) => {
      if (!branchSettings) {
        throw new Error('No branch settings found.')
      }
      if (location.length <= 1) {
        throw new Error('Location must be array with a 2 element, 0 is for long and 1 is for lng.')
      }
      return branchSettings.set({
        'location.coordinates': location.splice(0, 2)
      })
      .save()
    })
  }
  /**
   * suspend branch
   * allow only outside operation hours
   */
  public suspend() {
    return new Promise(async (resolve, reject) => {
      try {
        const settings = await BranchSettingModel.findOne({branchId: this.branchId})
        if (!settings) {
          throw new Error('No branch settings found.')
        }
        const currDT = new Date()
        // UTC Hour and minute converted to milliseconds
        const UTCHM = (currDT.getUTCHours() + (currDT.getUTCMinutes() / 60)) * 60 * 60 * 1000
        const todaySettings = settings.operationHours.find((elem) => {
          return elem.day === currDT.getDay()
        })
        if (todaySettings) {
          if (todaySettings.openingTime <= UTCHM && todaySettings.closingTime >= UTCHM) {
            throw new Error('Branch is currently operating')
          }
        }
        const suspendedBranch = await BranchModel.findOneAndUpdate(
          {_id: this.branchId},
          {isSuspended: true},
          {new: true}
        )
        resolve(suspendedBranch)
      }
      catch (error) {
        console.log('suspendBranch Error:', error)
        reject(error)
      }
    })
  }
  /**
   * unsuspend branch
   */
  public unsuspend() {
    return BranchModel.findOneAndUpdate(
      {_id: this.branchId},
      {isSuspended: false},
      {new: true}
    )
  }
}