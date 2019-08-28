import Queries from '../utils/queries'
import {IOperationHours} from '../interfaces/settings'
import BranchSettingModel from '../models/settings'
import { FORM_DATA_TYPES, BRANCH_MODULES } from '../utils/constants';
import { formDataValidator } from '../utils/helper';
import * as uuid from 'uuid/v4'
const DefaultOperationHours = [
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 0,
    isWholeDay: false,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 1,
    isWholeDay: false,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 2,
    isWholeDay: false,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 3,
    isWholeDay: false,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 4,
    isWholeDay: false,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: false,
    day: 5,
    isWholeDay: true,
  },
  {
    startValue: 3600000,
    endValue: 36000000,
    enabled: true,
    day: 6,
    isWholeDay: false,
  }
]
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
}