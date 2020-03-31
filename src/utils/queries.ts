import * as uuid from 'uuid/v4'
import {Document, Schema, Model, model, ModelPopulateOptions} from 'mongoose'
import Aws from './aws'
import {UploadedImage} from './interfaces'
import AppError from './app-error';
const s3 = new Aws('kyoo-bucket')
export interface IPaginationData {
  limitTo: number
  startAt: number
  searchFields: Array<string>
  searchText: string
  sortBy: ISortBy | ISortBy[]
  filterBy: IFilterBy
}
interface ISortBy {
  fieldName: string
  status: number
}
interface IFilterBy {
  fieldName: string
  value: string
}
interface IAggregateWithPagination {
  data: any[]
  totalPages: number
  totalCounts: number
}
interface IAppError {
  statusCode: number
  error: string
  source: string
}
class Queries<T> {
  public ModelSchema: any
  public ModelInterface: any
  private errorMsg: string | IAppError = ''
  constructor (mod: T) {
    if (!mod) throw new Error('model is required.')
    this.ModelSchema = mod
  }
  public save (data: object) {
    const collection = this.initilize(data)
    return <T>collection.save()
  }
  public initilize (data: any) {
    const id = uuid()
    //override the _id id createdAt and updatedAt when the data object already have it.
    return new this.ModelSchema(Object.assign({id, _id: id, createdAt: Date.now(), updatedAt: Date.now()}, data))
  }
  /**
   * 
   * @param id id or document of the collection
   * check if the id is string or collection, if string will perform a query else, return the document.
   */
  public findById <T> (id: string | (T | Document)): Promise<T> {
    return Promise.resolve(<any> (typeof(id) === 'string' ? this.ModelSchema.findOne({_id: id}) : id))
  }
  public upload (filepath: string, file: any): Promise<UploadedImage> {
    //@ts-ignore
    return Promise.resolve(file ? s3.upload(filepath, file) : {imageUrl: ''})
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
  public aggregateWithPagination (pipeline: any[], data?: IPaginationData, searchFields2: string[]= []): Promise<IAggregateWithPagination> {
    let {limitTo = 0, startAt = 0, sortBy = null, searchFields = [], searchText = ''} = <any> data || {}
    //@ts-ignore
    const endPage = parseInt(limitTo) >= 0 ? parseInt(limitTo) : 20
    //@ts-ignore
    const startPage = parseInt(startAt) > 0 ? parseInt(startAt) : 0
    //@ts-ignore
    var sortTo = {createdAt: -1}
    if (sortBy) {
      sortTo = Array.isArray(sortBy) ? sortBy.reduce((obj, s) => {
        obj[s.fieldName] = parseInt(s.status)
        return obj
      }, {}) : {[sortBy.fieldName]: sortBy.status}
    }
    const firstPipeline = <any[]>[
      {
        $sort: sortTo
      },
      {
        $skip: startPage
      },
      {
        $limit: endPage
      }
    ]
    // if limitTO is equal to = 0, will remove the $limit on the pipeline
    if (endPage === 0) {
      const ind = firstPipeline.findIndex((stage) => Object.keys(stage)[0] === '$limit')
      if (ind >= 0) {
        // remove ethe $limit on the pipeline.
        firstPipeline.splice(ind ,1)
      }
    }
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
          data: ,
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
      return <IAggregateWithPagination> (response.length >= 1 ? {
        data: response[0].data,
        totalPages: endPage >= 1 ? Math.ceil((response[0].counts / endPage)) : 1,
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
