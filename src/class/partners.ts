import PartnerModel, { IPartnersModel } from '../models/partners'
import Queries from '../utils/queries'
import Industry from './industry'
// import {ActivityLogsActions} from '../utils/constants'
import {UploadedImage} from '../utils/interfaces'
import { FORM_DATA_TYPES } from '../utils/constants';
import { formDataValidator } from '../utils/helper';
interface IPartnerBody {
  name: string
  avatar?: any
  industryId: string
  categoryId: string
  categoryListId: string
}
export default class BusinessPartners extends Queries {
  private Indus: Industry
  constructor () {
    super(PartnerModel)
    this.Indus = new Industry()
  }
  private async formDataValidator (data: IPartnerBody) {
    const {name = '', avatar, categoryListId, categoryId, industryId} = data
    return formDataValidator([
      {
        type: FORM_DATA_TYPES.STRING,
        value: name,
        fieldName: 'name'
      },
      {
        type: FORM_DATA_TYPES.STRING,
        value: categoryId,
        fieldName: 'categoryId'
      },
      {
        type: FORM_DATA_TYPES.STRING,
        value: industryId,
        fieldName: 'industryId'
      }
    ])
  }
  //@ts-ignore
  public save (data: IPartnerBody) {
    return this.formDataValidator(data)
      .then(() => {
        const {name = ''} = data
        return PartnerModel
          .findOne({
            name
          })
          .sort({
            _id: 1
          })
          .then(async (isExist) => {
            if (isExist) {
              throw new Error('Business Partner already exist.')
            }
            const newPartner = this.initilize(data)
            const {imageUrl = ''} = await this.upload(`avatars/${newPartner._id}`, data.avatar)
            if (imageUrl) {
              newPartner.avatarUrl = imageUrl
            }
            newPartner.save()
            await this.updateCategoryCounts(data.industryId)
            return newPartner
          })
      })
  }
  public updateOne (id: string, data: any) {
    return this.formDataValidator(data)
      .then(() => {
        const {name, avatar, industryId, categoryId} = data
        return PartnerModel
          .findOne({
            _id: {
              $ne: id.toString().trim()
            },
            name
          })
          .sort({
            _id: 1
          })
          .then(async (isExist) => {
            if (isExist) {
              throw new Error('Business Partner already exist.')
            }
            const partner = <IPartnersModel> await this.findOne({_id: id})
            const uploader = await this.upload(`avatars/${partner._id}`, avatar)
            const oldIndustryId = partner.industryId
            const oldCategoryId = partner.categoryId
            partner.set(Object.assign({name},
              data.industryId ? {industryId: data.industryId} : {},  
              data.categoryId ? {categoryId: data.categoryId} : {},  
              uploader.imageUrl ? {avatarUrl: uploader.imageUrl} : {},  
            ))
            await partner.save()
            // update the counter to industry model
            this.updateCategoryCounts(partner.industryId)
            return partner
          })
      })
  }
  private updateCategoryCounts (industryId: string) {
    return PartnerModel.find({
      industryId: industryId.toString().trim()
    }, {
      industryId: 1,
      categoryId: 1
    })
    .then((partners) => {
      const categoryListCounts = partners.reduce((arr: any[], partner) => {
        const ind = arr.findIndex((a: any) => a.id === partner.categoryId)
        if (ind === -1) {
          arr.push({
            id: partner.categoryId,
            counts: 1
          })
        } else {
          arr[ind].counts += 1
        }
        return arr
      }, [])
      return this.Indus.updateTotalCounters(industryId, {
        totalPartners: partners.length,
        categoryCounts: categoryListCounts
      })
    })
  }
  public viewById (id: string) {
    return PartnerModel.aggregate([
      {
        $match: {
          _id: id
        }
      },
      {
        $sort: {
          name: 1
        }
      },
      {
        $lookup: {
          from: 'industries',
          let: {
            industryId: '$industryId',
            categoryListId: '$categoryListId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$industryId']
                }
              }
            },
            {
              $sort: {
                _id: 1
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                categoryList: {
                  $filter: {
                    input: '$categoryList',
                    as: 'arr',
                    cond: {
                      $eq: ['$$arr._id', '$$categoryListId']
                    }
                  }
                }
              }
            },
            {
              $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$categoryList'
              }
            }
          ],
          as: 'industries'
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$industries'
        }
      }
    ]).then((data: any) => {
      return data.length >= 1 ? data[0] : {}
    })
  }
  public lists (data: any = {}, sort?: any) {
    let {searchText = '', filterBy} = data
    return super.aggregateWithPagination([
      {
        $match: Object.assign({
          name: {
            $regex: new RegExp(searchText, 'gi')
          }
        }, filterBy ? {[filterBy.fieldName]: filterBy.value} : {})
      },
      {
        $sort: {
          name: 1
        }
      },
      {
        $lookup: {
          from: 'industries',
          let: {
            industryId: '$industryId',
            categoryListId: '$categoryListId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$industryId']
                }
              }
            },
            {
              $sort: {
                _id: 1
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                categoryList: {
                  $filter: {
                    input: '$categoryList',
                    as: 'arr',
                    cond: {
                      $eq: ['$$arr._id', '$$categoryListId']
                    }
                  }
                }
              }
            },
            {
              $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$categoryList'
              }
            }
          ],
          as: 'industries'
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$industries'
        }
      },
      {
        $lookup: {
          from: 'business_branches',
          let: {
            businessPartnerId: '$_id'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$businessPartnerId', '$$businessPartnerId']
                }
              }
            },
            {
              $sort: {
                _id: 1
              }
            },
            {
              $group: {
                _id: '$_id'
              }
            }
          ],
          as: 'BusinessBranches'
        }
      },
      {
        $addFields: {
          totalBranches: {
            $size: '$BusinessBranches'
          }
        }
      },
      {
        $project: {
          BusinessBranches: 0
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$$ROOT', {
              industries: {
                id: '$industries._id',
                name: '$industries.name',
                category: '$industries.categoryList',
              }
            }]
          }
        }
      }], data)
  }
}