import {default as model, IndustryModel} from '../models/industry'
import {default as BusinessPartner} from '../models/partners'
import Queries from '../utils/queries'
// import ActivityLogs from './activity-logs'
import {Industry, ICategoryList} from '../interfaces/industry'
export {Industry, IndustryModel}
import * as uuid from 'uuid/v4'
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { formDataValidator } from '../utils/helper';
import { FORM_DATA_TYPES } from '../utils/constants';
const filePath = 'avatars/industry/'
interface IIndustryBody {
  name: string
  shortName: string
  icon: any
  category: string
  categoryList: ICategoryList[]
}
interface ICategoryCounts {
  id: string
  counts: number
}
interface ITotalCountsBody {
  totalPartners: number
  categoryCounts: ICategoryCounts[]
}
export default class Industries extends Queries {
  private BPM: Queries
  // private ALM: ActivityLogs
  constructor () {
    super(model)
    this.BPM = new Queries(BusinessPartner)
    // this.ALM = new ActivityLogs('industries')
  }
  private async formDataValidator (data: IIndustryBody) {
    const {name = '', shortName = '', icon = '', category = '', categoryList = []} = data
    return formDataValidator([
      {
        type: FORM_DATA_TYPES.STRING,
        value: name,
        fieldName: 'name'
      },
      {
        type: FORM_DATA_TYPES.STRING,
        value: shortName,
        fieldName: 'shortName'
      },
      {
        type: FORM_DATA_TYPES.STRING,
        value: category,
        fieldName: 'category'
      },
      {
        type: FORM_DATA_TYPES.ARRAY,
        value: categoryList,
        fieldName: 'categoryList'
      }
    ])
  }
  /**
   * add new category
   * @param data 
   */
  public async save (data: IIndustryBody) {
    const {name = '', shortName = '', icon, category = '', categoryList = []} = data
    return this.formDataValidator(data)
    .then(() => {
      const newIndustry = <IndustryModel> super.initilize({name, shortName, category, categoryList: this.generateCategoryList(categoryList)})
      return super.upload(filePath.concat(newIndustry._id), icon)
        .then(({imageUrl}: any) => {
          newIndustry.iconUrl = imageUrl
          return newIndustry.save()
        })
    })
  }
  /**
   * update category
   * @param industryId 
   * @param data 
   */
  public updateOne (industryId: string, data: IIndustryBody) {
    const {name, shortName, icon, category, categoryList} = data
    return this.formDataValidator(data)
      .then(() => {
        return super.findOne({_id: industryId}).then((industry: IndustryModel) => {
          industry.set({name, shortName, category, categoryList: this.generateCategoryList(categoryList)})
          return super.upload(filePath.concat(industry._id), icon).then(({imageUrl}) => {
            imageUrl ? industry.iconUrl = imageUrl : ''
            return industry.save()
          })
        })
      })
  }
  /**
   * generate category list schema, check if the cat is on update mode or have an existing _id, else create one
   * @param category 
   */
  public generateCategoryList (category: any[]) {
    return category.map((cat: any) => (!cat._id ? {_id: uuid(), name: cat, totalBusiness: 0, createdAt: Date.now()} : cat))
  }
  /**
   * update industry counts
   * @param industryId 
   * @param data 
   */
  public updateTotalCounters (industryId: string, data: ITotalCountsBody) {
    return this.findOne({
      _id: industryId
    })
    .then((industry: IndustryModel) => {
      return industry.set({
        totalBusiness: data.totalPartners,
        categoryList: industry.categoryList.map((category) => {
          const ind = data.categoryCounts.findIndex((a) => a.id === category._id)
          return {
            ...JSON.parse(JSON.stringify(category)),
            counts: ind >= 0 ? data.categoryCounts[ind].counts : 0
          }
        })
      }).save()
    })
  }
  public viewById (industryId: string) {
    return model.findOne({
      _id: industryId
    })
    .sort({
      name: 1
    })
  }
  public lists (data: any) {
    return this.aggregateWithPagination([
      {
        $sort: {
          createdAt: 1
        }
      }
    ], data, ['name'])
  }
  /**
   * 
   * @param industryId 
   * Get lists of the business partners that assigned to be on recommendation/must try.
   */
  public getRecommendedBusinessPartners (industryId: string, data?:any) {
    return this.findOne({_id: industryId}, {recommended: 1}).then((data: any) => {
      return this.BPM.aggregateWithPagination([
        {
          $match: {
            _id: {$in: data.recommended.map((recomm: any) => recomm.businessPartnerId)}
          }
        }
      ], Object.assign(data, {searchFields: ['name']}))
    })
  }
  /**
   * 
   * @param industryId 
   * get the lists of the 
   */
  public getBusinessPartners (industryId: string, data: any) {
    return this.BPM.aggregateWithPagination([
      {
        $match: {
          industryId
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ], Object.assign(data, {searchFields: ['name']}))
  }
}