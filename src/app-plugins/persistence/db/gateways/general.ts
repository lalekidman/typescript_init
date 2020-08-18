import {
  Document, Model
} from '../index'
import * as uuid from 'uuid/v4'
export interface IPaginationParameters {
  limitTo?: number
  startAt?: number
  searchText?: number
}
import {IAggregatePagination, IPaginationQueryParams} from '../../../../domain'
export default abstract class GeneralDBCommands<T, K> {
  // db instance
  protected collectionModel: any
  /**
   * 
   * @param DB 
   */
  constructor (DB: Model<T & Document>) {
    this.collectionModel = DB
  }
  /**
   * find all data
   * @param queryParams 
   */
  public findAll (queryParams: IPaginationParameters) {
    const {limitTo = 10, searchText = '', startAt = 0} = queryParams
    return <T[]> this.collectionModel.find({})
    .skip(startAt)
    .limit(limitTo)
  }
  /**
   * by data by id
   * @param id 
   */
  public findById (id: string): Promise<T> {
    return  this.collectionModel.findById(id)
  }
  /**
   * insert data by id
   * @param data 
   */
  public insertOne (data: K) {
    return (this.initialize(data)).save()
  }
  /**
   * initialize object
   * @param data 
   */
  public initialize (data: K) {
    return new this.collectionModel({
      _id: uuid(),
      createdAt: Date.now(),
      updatedat: 0,
      ...data
    })
  }
  /**
   * 
   * @param id 
   * @param data 
   */
  public updateById (id: string, data: K) {
    return this.collectionModel.update({
      _id: id.toString().trim()
    }, {
      $set: data
    })
  }
  /**
   * 
   * @param query 
   * @param data 
   */
  public updateMany(query: Record<keyof K, any>, data: K) {
    return this.collectionModel.update(query, {
      $set: data
    })
  }
  public removeById (id: string) {
    return this.collectionModel.remove({
      _id: id.toString()
    })
  }
  /**
   * 
   * @param pipeline a pipeline query for aggregation on mongodb
   * @param queryParams for filtering, like limitTo, startAt, sortby etc..
   * @param searchFields2 array of fields that needed to be search or to filter,
   * a function that return a pagination data.
   */
  public aggregateWithPagination (pipeline: any[], queryParams: IPaginationQueryParams<K>) {
    let {limitTo = 0, startAt = 0, sortBy = null, searchFields = [], searchText = ''} = <any> queryParams || {}
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
    const q = (searchFields.length >= 1 ? searchFields : []).map((field: string) => ({[field]: {
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
          data: firstPipeline,
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
    return this.collectionModel.aggregate(paginationQuery)
      .then((response: any) => {
        const paginationResponse = <IAggregatePagination>{data: [], total: 0, pages: 0}
        if (response.length >= 1) {
          paginationResponse.data = response[0].data
          paginationResponse.pages = endPage >= 1 ? Math.ceil((response[0].counts / endPage)) : 1
          paginationResponse.total = response[0].counts
        }
        return paginationResponse
      })
  }
}