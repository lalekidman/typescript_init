import * as uuid from 'uuid/v4'
import {Document, Schema, Model, model, ModelPopulateOptions} from 'mongoose'
import Aws from './aws'
import {UploadedImage} from './interfaces'
import AppError from './app-error';
const s3 = new Aws('kyoo-v2-dev')
interface PaginationData {
  limitTo: number
  startAt: number
  searchFields: Array<string>
  searchText: string
  sortBy: SortBy
}
interface SortBy {
  fieldName: string
  status: number
}
interface Pagination {
  totalPages: number
  data: [any]
}
interface IAggregateWithPagination {
  data: any[]
  totalPages: number
  totalCount: number
}
interface IAppError {
  statusCode: number
  error: string
  source: string
}
class Queries {
  public ModelSchema: any
  public ModelInterface: any
  private errorMsg: string | IAppError = ''
  constructor (mod: any, Model?: any) {
    if (!mod) throw new Error('model is required.')
    this.ModelSchema = mod
    this.ModelInterface = Model
  }
  public save (data: object) {
    const collection = this.initilize(data)
    return collection.save()
  }
  public initilize (data: any) {
    const id = uuid()
    return new this.ModelSchema(Object.assign(data, {id, _id: id, branchId: id ,createdAt: Date.now(), updatedAt: Date.now()}))
  }
  public setErrorMsg (error: string | IAppError) {
    return this.errorMsg = error
  }
  update (id: string, data: object) {
    return this.ModelSchema.update({
      id: id
    }, {
      $set: data
    })
  }
  public findOne (query = {}, projection = {}) {
    return this.ModelSchema.findOne(query, projection).sort({_id: 1}).then((data: Document) => {
      if (data) {
        return data
      } else {
        if (typeof(this.errorMsg) === 'string') {
          throw new Error('No data found.')
        } else {
          throw new AppError(this.errorMsg);
        }
      }
    })
  }
  public upload (filepath: string, file: any): Promise<UploadedImage> {
    // @ts-ignore
    return Promise.resolve( file ? s3.upload(filepath, file) : {imageUrl: ''})
  }
  public uploadMany (filepath: string, files: Array<any>) {
    return Promise.all(files.map((file: any) => this.upload(filepath, file)))
  }
  /**
   * 
   * @param pipeline a pipeline query for aggregation on mongodb
   * @param data for filtering, like limitTo, startAt, sortby etc..
   * @param searchFields2 array of fields that needed to be search or to filter,
   * a function that return a pagination data.
   */
  public aggregateWithPagination (pipeline: any[], data?: PaginationData, searchFields2: string[]= []): Promise<IAggregateWithPagination> {
    let {limitTo = 0, startAt = 0, sortBy = null, searchFields = [], searchText = ''} = <any> data || {}
    //@ts-ignore
    const endPage = parseInt(limitTo) > 0 ? parseInt(limitTo) : 20
    //@ts-ignore
    const startPage = parseInt(startAt) > 0 ? parseInt(startAt) : 0
    //@ts-ignore
    const sortTo = sortBy ? {[sortBy.fieldName]: parseInt(sortBy.status)} : {_id: 1}
    const q = (searchFields.length >= 1 ? searchFields : searchFields2).map((field: string) => ({[field]: {
      $regex: new RegExp(searchText, 'gi')
    }}))
    const paginationQuery = pipeline.concat([
      {
        $match: Object.assign(q.length >= 1 ? {
          $or: q
        } : {})
      },
      {
        $facet: {
          data: [
            {
              $sort: sortTo
            },
            {
              $skip: startPage
            },
            {
              $limit: endPage
            }
          ],
          totalPages: [
            {
              $group: {
                _id: null,
                counts: {
                  $sum: 1
                }
              }
            }
          ]
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: false,
          path: '$totalPages'
        }
      },
      {
        $project: {
          _id: 0,
          data: 1,
          counts: '$totalPages.counts'
        }
    }])
    return this.ModelSchema.aggregate(paginationQuery).then((response: any) => {
      return <Pagination> (response.length >= 1 ? {
        data: response[0].data,
        totalPages: Math.ceil((response[0].counts / endPage)),
        totalCounts: response[0].counts
      }: {data: [], totalPages: 0, totalCounts: 0})
    })
  }
  public setSuspendStatus (id: string) {
    return this.findOne({_id: id}, {isSuspended: 1}).then((mod: any) => {
      if (mod.isSuspended === undefined) {
        throw new Error('this model is not supported of suspend/unsuspend function.')
      }
      return mod.set({isSuspended: !mod.isSuspended}).save()
    })
  }
  public suspendAccount (id: string, status?: number) {
    return this.findOne({_id: id}).then((data: any) => {
      if (!data.email.status && !data.isVerified) {
        throw new Error('account must be verified before suspending account.')
      }
      return data.set({status: !data.status}).save()
    })
  }
  public get query () {
    return this.ModelSchema
  }
}
export default Queries
