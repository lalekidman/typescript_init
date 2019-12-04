import Queries from '../utils/queries'
import {IOperationHours, IFeaturedAccess, ISocialLinks} from '../interfaces/settings'
import BranchSettingModel from '../models/settings'
import { FORM_DATA_TYPES, BRANCH_MODULES } from '../utils/constants';
import { formDataValidator } from '../utils/helper';
import * as uuid from 'uuid/v4'
import { ILocation } from '../interfaces/branches';
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
interface IBranchSettings {
  isWeeklyOpened: boolean
  operationHours?: IOperationHours[]
  featuredAccess: IFeaturedAccess
  coordinates: number[]
  modules?: number[]
  socialLinks: ISocialLinks[]
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
  public save (data: IBranchSettings) {
    return this.formDataValidator(data)
      .then(async () => {
        const {modules = [BRANCH_MODULES.QUEUE, BRANCH_MODULES.RESERVATION], operationHours = [], socialLinks = [], featuredAccess, coordinates, isWeeklyOpened} = data
        // check the variable type if string and check if its equal to true,
        // also check if the variable type is boolean,
        // otherwise set value to false
        const isAlwaysOpen = (typeof(isWeeklyOpened) === 'string' && isWeeklyOpened === 'true') ? true : (typeof(isWeeklyOpened) === 'boolean') ? isWeeklyOpened : false
        const newBranchSetting = this.initilize({
          branchId: this.branchId.toString().trim()
        })
        await newBranchSetting.save()
        await this.updateFeaturedAccess(featuredAccess)
        if (coordinates.length === 2) {
          await this.updateGeoLocation(coordinates.map((coor: any) => parseFloat(coor)))
        }
        await this.updateOperationHours({isWeeklyOpened: isAlwaysOpen, operationHours})
        return newBranchSetting
      })
  }
  public async updateSettings (data: IBranchSettings) {
    try {
      const {modules = [BRANCH_MODULES.QUEUE, BRANCH_MODULES.RESERVATION], operationHours = [], socialLinks = [], featuredAccess, coordinates, isWeeklyOpened} = data
      // check the variable type if string and check if its equal to true,
      // also check if the variable type is boolean,
      // otherwise set value to false
      const isAlwaysOpen = (typeof(isWeeklyOpened) === 'string' && isWeeklyOpened === 'true') ? true : (typeof(isWeeklyOpened) === 'boolean') ? isWeeklyOpened : false
      await this.updateFeaturedAccess(featuredAccess)
      if (coordinates.length === 2) {
        console.log('###############################################HERE RIGHT')
        await this.updateGeoLocation(coordinates.map((coor: any) => parseFloat(coor)))
      }
      const branchSettings = await this.updateOperationHours({isWeeklyOpened: isAlwaysOpen, operationHours})
      return branchSettings
    } catch (err) {
      console.log('#################### Error on updating branch settings: ', err.message)      
    }
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
      const opHours = (operationHours && (operationHours.length === 0 || operationHours.length <=6) ? DefaultOperationHours : operationHours)
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
        console.log('e: ', opHours)
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
  public updateGeoLocation (coordinates: Number[]) {
    return this.findOne({
      branchId: this.branchId
    })
    .then((branchSettings) => {
      console.log('l###################################ocatixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxon : ', coordinates)
      if (!branchSettings) {
        throw new Error('No branch settings found.')
      }
      if (coordinates.length <= 1) {
        throw new Error('coordinates must be array with a 2 element, 0 is for long and 1 is for lng.')
      }
      return branchSettings.set({
        'location.coordinates': coordinates.splice(0, 2)
      })
      .save()
    })
  }
  /**
 * update featured access
 * @param featured 
 */
 public async updateFeaturedAccess (featured: IFeaturedAccess) {
  const {queueGroup, smsModule, account} = featured
  if (!featured) {
    return;
  }
  if (queueGroup.max <= 0) {
    throw new Error('queue group max value must be greater than 0')
  } else if (account.max <= 0) {
    throw new Error('account max value must be greater than 0')
  }
  return BranchSettingModel.findOneAndUpdate({
    branchId: this.branchId, 
    },
    {
      featuredAccess: featured
    },
    {
      new: true
    }
  )
  .then((branch: any) => {
    if (!branch) {
      throw new Error('No Branch data found.')
    }
    return branch
  })
 }
 public async updateSocialLinks (socialLinks: ISocialLinks[]) {
  return BranchSettingModel.findOneAndUpdate({
    _id: this.branchId, 
    },
    {
      socialLinks: socialLinks.map((link) => {
        if (!link.id) {
          link.id = uuid()
        }
        if (link.type === "facebook" || link.type === "instagram") {
          let disected = link.url.split(/\//g)
          link.url = disected[disected.length - 1]
        }
      })
    },
    {
      new: true
    }
  )
  .then((branch: any) => {
    if (!branch) {
      throw new Error('No Branch data found.')
    }
    return branch
  })
 }
}