import {
  Document, Model
} from './index'
import uuid from 'uuid/v4'
import {IAggregatePagination, IPaginationQueryParams, IPaginationParameters} from '../../../domain/interfaces/general-repository-gateway'
export default abstract class GeneralDBCommands<T, K> {
  // db instance
  protected collectionModel: Model<Document & T>
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
  public async findAll (query?: Record<keyof K, any>, queryParams: IPaginationParameters = <any>{}) {
    try {
      const {limitTo = 10, startAt = 0} = queryParams
      const coll = this.collectionModel.find(query)
      if (startAt >= 0) {
        coll.skip(startAt)
      }
      if (limitTo >= 1) {
        coll.limit(startAt)
      }
      const documents = await coll
      return documents
    } catch (error) {
      throw error
    }
  }
  /**
   * by data by id
   * @param id 
   */
  public async findById (id: string) {
    try {
      const document = await this.collectionModel.findById(id)
      if (!document) {
        throw new Error('No document found.')
      }
      return document
    } catch (error) {
      throw error
    }
  }
  /**
   * by data by id
   * @param id 
   */
  public findOne = async (query: K, options?: any, toObject: boolean = true) => {
    try {
      const {projection, sort} = options || {}
      const documentQuery = this.collectionModel.findOne(query, projection)
      if (sort) {
        documentQuery.sort(sort)
      }
      const data = await documentQuery.exec()
      if (!data) {
        throw new Error('No data found.')
      }
      return toObject ? <T>data.toObject() : <Document & T>data
    } catch (error) {
      throw error
    }
  }
  /**
   * insert data 
   * @param data 
   */
  public async insertOne (data: K) {
    const newDocument = await (this.initialize(data)).save()
    return newDocument.toObject()
  }
  /**
   * insert bulk/mutiple data 
   * @param data 
   */
  public insertMany (data: K[]) {
    return Promise.all(data.map((elem) => this.insertOne(elem)))
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
  public async updateById (id: string, data: Partial<K>) {
    try {
      //@ts-expect-error
      delete data._id
      //@ts-expect-error
      delete data.id
      //@ts-expect-error
      delete data.createdAt
      const document = await this.findById(id)
      // if (document) {
        document.set(data)
        document.save()
      // }
      // return document
      return document.toObject()
    } catch (err) {
      throw err
    }
  }
  /**
   * update multiple/many documents
   * @param query 
   * @param data 
   */
  public updateMany(query: Record<keyof K, any>, data: K) {
    return this.collectionModel.update(query, {
      $set: data
    })
    .then((result) => {
      return <T[]>result
    })
  }
  /**
   * update single document
   * @param query 
   * @param data 
   */
  public async updateOne(query: Record<keyof K, any>, data: K) {
    try {
      const document = <Document & T> await this.findOne(query, undefined, false)
      document.set(data)
      await document.save()
      return <T> document.toObject()
    } catch (error) {
      throw error
    }
  }
  public removeById (id: string) {
    return this.findById(id)
      .then((document) => {
        if (document) {
          document.remove()
        }
        return document.toObject()
      })
  }
  public removeOne (query: Record<keyof K, any>) {
    return this.collectionModel.findOne(query)
      .then((document) => {
        if (document) {
          document.remove()
          return document.toObject()
        }
        return null
      })
  }
  /**
   * 
   * @param pipeline a pipeline query for aggregation on mongodb
   * @param queryParams for filtering, like limitTo, startAt, sortby etc..
   * @param searchFields2 array of fields that needed to be search or to filter,
   * a function that return a pagination data.
   */
  public aggregateWithPagination (pipeline: any[], queryParams: IPaginationQueryParams): Promise<IAggregatePagination<K>> {
    let {limitTo, startAt = 0, sortBy = null, searchFields = [], searchText = ''} = <any> queryParams || {}
    //@ts-ignore
    const endPage = parseInt(limitTo) >= 0 ? parseInt(limitTo) : 15
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
    console.log('firstPipeline :>> ', endPage);
    console.log('firstPipeline :>> ', firstPipeline);
    // if limitTO is equal to = 0, will remove the $limit on the pipeline
    if (endPage === 0) {
      const ind = firstPipeline.findIndex((stage) => Object.keys(stage)[0] === '$limit')
      if (ind >= 0) {
        // remove ethe $limit on the pipeline.
        firstPipeline.splice(ind, 1)
      }
    }
    console.log('firstPipeline :>> ', firstPipeline);
    const q = (searchFields.length >= 1 ? searchFields : []).map((field: string) => ({[field]: {
      $regex: new RegExp(searchText.replace(/^(\+639|639|09)/, '9'), 'gi')
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
        const paginationResponse = {data: [], total: 0, pages: 0, totalCounts: 0, totalPages: 0}
        if (response.length >= 1) {
          paginationResponse.data = response[0].data
          paginationResponse.pages = endPage >= 1 ? Math.ceil((response[0].counts / endPage)) : 1
          paginationResponse.total = response[0].counts
          //@ts-ignore
          paginationResponse.totalCounts = paginationResponse.total
          //@ts-ignore
          paginationResponse.totalPages = paginationResponse.pages
        }
        return paginationResponse
      })
  }
}