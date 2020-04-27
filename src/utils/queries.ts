import * as uuid from 'uuid/v4'
import {Document, Schema, Model, model, ModelPopulateOptions, Collection} from 'mongoose'
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
interface IStateChangeData {
  newData: any
  previousData?: any
  state?: string|number
}
interface IStateDidChangedListener {
  (event: string|number, data: IStateChangeData) : void 
}
interface IStateWillChangeListener {
  (event: string|number, data: IStateChangeData) : void 
}
/**
 * T - for the Collection model type
 * EM - is for the Event Model logs
 */
class Queries <T> {
  private ModelSchema: T

  private static stateDidChangedCallback: IStateDidChangedListener|null = null
  private static stateWillChangeCallback: IStateWillChangeListener|null = null
  /**
   * 
   * @param collectionModel
   * @param eventLogsModel
   */
  constructor(collectionModel: any,) {
    if (!collectionModel) throw new Error('collectionModel is required.')
    this.ModelSchema = collectionModel
  }
  /**
   * save model with default properties {
   * - id: uuid/v4
   * - createdAt: currentDate(milis)
   * - updatedAt: currentDate(milis)
   * }
   * @param data 
   */
  protected save(data: object) {
    const collection = this.initilize(data)
    //@ts-ignore
    return collection.save()
  }
  /**
   * initialize model schema with default properties {
   * - id: uuid/v4
   * - createdAt: currentDate(milis)
   * - updatedAt: currentDate(milis)
   * }
   * @param data 
   */
  protected initilize(data: any) {
    const id = uuid()
    //override the _id id createdAt and updatedAt when the data object already have it.
    //@ts-ignore
    return <T> new this.ModelSchema(Object.assign({id, _id: id, createdAt: Date.now(), updatedAt: Date.now()}, data))
  }
  /**
   * upload file with aws s3
   * @param filepath 
   * @param file 
   */
  protected upload (filepath: string, file: any): Promise<UploadedImage> {
    //@ts-ignore
    return Promise.resolve(file && file.size >= 1 ? s3.upload(filepath, file) : {imageUrl: ''})
  }
  protected uploadMany (filepath: string, files: Array<any>) {
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
    //@ts-ignore
    return this.ModelSchema.aggregate(paginationQuery).then((response: any) => {
      return <IAggregateWithPagination> (response.length >= 1 ? {
        data: response[0].data,
        totalPages: endPage >= 1 ? Math.ceil((response[0].counts / endPage)) : 1,
        totalCounts: response[0].counts
      }: {data: [], totalPages: 0, totalCounts: 0})
    })
  }
  
  /**
   * use this to call the state callback
   * @param state state/event
   * @param data 
   */
  protected stateDidChanged (state: string|number, data: IStateChangeData) {
    if (Queries.stateDidChangedCallback) {
      Queries.stateDidChangedCallback(state, data)
    }
  }
  /**
   * use this to call the state callback
   * @param state state/event
   * @param data 
   */
  protected stateWillChange (state: string|number, data: IStateChangeData) {
    if (Queries.stateWillChangeCallback) {
      Queries.stateWillChangeCallback(state, data)
    }
  }
  /**
   * set a callback for post action of state
   * @param callback 
   */
  public static stateDidChangedListener (callback: IStateDidChangedListener) {
    Queries.stateDidChangedCallback = callback
  }
  /**
   * set a callback for pre action of state
   * @param callback
   */
  public static stateWillChangeListener (callback: IStateDidChangedListener) {
    Queries.stateWillChangeCallback = callback
  }
  public get query () {
    return this.ModelSchema
  }
}
export default Queries
