import * as uuid from 'uuid/v4'
import {Document, Schema, Model, model, ModelPopulateOptions, Collection, Query, } from 'mongoose'
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
interface IStateChangeData {
  newData: any
  previousData?: any
  localStreamId?: string
}
interface IStateDidChangedListener {
  (event: string|number, data: IStateChangeData, key?: string) : void 
}
interface IStateDidChangedLocalStreamerCallback {
  (data: IStateChangeData) : void 
}
interface IStateDidChangedLocalStreamer {
  streamId: string
  data: ILocalStreamData[]
  [key: number]: any
}
interface ILocalStreamData {
  state: string|number
  callback: IStateDidChangedLocalStreamerCallback
}
interface ILocalStreams {
  // events: string[]|number[]
  streamId: string
  metadata?: any
  message: any
  failedEvents: string[]|number[]
  successEvents: string[]|number[]
}
interface IEventStreams {
  event: string
  isChecked: boolean
}
interface ILSD {
  // events: string[]|number[]
  streamId: string
  metadata?: any
  failedEvents: any[]
  messages: any[]
  successEvents: IEventStreams[]
}
interface IStateWillChangeListener extends IStateDidChangedListener {}
/**
 *  Collection model interface
 */
class Queries <T, K> {
  private colelctionModel: any
  // global
  private static stateDidChangedCallback: IStateDidChangedListener[] = []
  // local callback
  private static stateStreamerCallback: IStateDidChangedLocalStreamer[] = []
  private static stateWillChangeCallback: IStateWillChangeListener[] = []
  private static localStreams = <ILSD[]>[]
  private localStreamId: string = <any>null

  private resultData: any = null
  /**
   * collection model that needed to be extends
   * @param collectionModel
   */
  
  constructor(collectionModel: Model<Document & T>) {
    if (!collectionModel) throw new Error('collectionModel is required.')
    this.colelctionModel = collectionModel
  }
  /**
   * save model with default properties {
   * - id: uuid/v4
   * - createdAt: currentDate(milis)
   * - updatedAt: currentDate(milis)
   * }
   * @param data
   */
  protected save(data: K) {
    const collection = this.initialize(data)
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
  protected initialize(data: K) {
    const id = uuid()
    //override the _id id createdAt and updatedAt when the data object already have it.
    return <T> new this.colelctionModel(Object.assign({_id: id, createdAt: Date.now(), updatedAt: Date.now()}, data))
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
    return this.colelctionModel.aggregate(paginationQuery).then((response: any) => {
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
   * @param key optional 
   */
  protected stateDidChanged <T>(state: string|number, data: T & IStateChangeData) {
    for (let index in Queries.stateDidChangedCallback) {
      Queries.stateDidChangedCallback[index](state, <any>data)
      this.resultData = data
    }
    for (let index in Queries.stateStreamerCallback) {
      const {data: streamData, streamId = ''} = Queries.stateStreamerCallback[index]
      if (data?.localStreamId === streamId) {
        for (let streamIndex in streamData) {
          const {state: _state, callback} = streamData[streamIndex]
          if (_state === state) {
            callback(<any>data)
          }
        }
        // just add an delay to make sure that all callbacks are performed.
        this.removeFromTheStateStearmerCallback(parseInt(index))
      }
    }
  }
  /**
   * use this to call the state callback
   * @param state state/event
   * @param data 
   */
  protected stateWillChange <T>(state: string|number, data: T & IStateChangeData) {
    for (let index in Queries.stateWillChangeCallback) {
      Queries.stateWillChangeCallback[index](state, data)
    }
  }
  /**
   * set a callback for post action of state
   * @param callback 
   */
  public static stateDidChangedListener (callback: IStateDidChangedListener) {
    Queries.stateDidChangedCallback.push(callback)
  }
  /**
   * set a callback for pre action of state
   * @param callback
   */
  public static stateWillChangeListener (callback: IStateDidChangedListener) {
    Queries.stateWillChangeCallback.push(callback)
  }

  public transactionStreamer (data: {state: string|number, streamId: string, callback: IStateDidChangedLocalStreamerCallback}) {
    const {callback, state, streamId} = data
    if (typeof callback === 'function') {
      const index = Queries.stateStreamerCallback.findIndex((s) => s.streamId === streamId)
      if (index === -1) {
        Queries.stateStreamerCallback.push({
          data: [{
            callback,
            state
          }],
          streamId
        })
      } else {
        
        Queries.stateStreamerCallback[index].data.push({
          callback,
          state
        })
      }
    }
  }
  /**
   * generate localStreamId for the new event/state 
   */
  protected generateLocalStreamId () {
    return this.localStreamId = uuid()
  }
  /**
   * to get the localStreamId
   */
  public getLocalStreamId () {
    return this.localStreamId
  }
  /**
   * get the last result data.
   */
  public getResultData () {
    return this.resultData
  }
  /**
   * 
   * @param index index on the array.
   * @param delay 
   */
  private removeFromTheStateStearmerCallback (index: number, delay: number = 100) {
    if (index <= -1 || Queries.stateStreamerCallback.length < index) {
      throw new Error('Invalid local streamer callback index.')
    }
    setTimeout(() => {
      Queries.stateStreamerCallback.splice(parseInt(<any>index), 1)
    }, 100)
  }
  /**
   * 
   * @param data 
   * @param states 
   * @param timeoutMilis milis -> set value if you want to increase or decrease the delay of response. Default: 1000 milis
   */
  protected waitTransactionResponse (data: any, states: string[]|number[], timeoutMilis: number = 1000) {
    return new Promise((resolve) => {
      for (let index in states) {
        this.transactionStreamer({
          state: states[index],
          streamId: this.getLocalStreamId(),
          callback: resolve
        })
      }
      setTimeout(() => {
        resolve({newData: data})
      }, timeoutMilis)
    })
    .then(({newData}: any) => newData)
  }
  /**
   * check if the localStreamId is still exist
   * @param localStreamId 
   */
  public isStreamerIdStillExists (localStreamId: string) {
    return Queries.stateStreamerCallback.findIndex((s) => s.streamId === localStreamId)
  }

  public connectTransactionStream (data: ILocalStreams) {
    const {failedEvents = [], metadata, streamId, successEvents = [], message} = data
    const generateWatchEvents = (arr: Array<string|number>) => {
      return <IEventStreams[]>arr.map((a) => ({event: a, isChecked: false}))
    }
    if (Queries.localStreams.findIndex((s) => s.streamId === streamId) === -1) {
      Queries.localStreams.push({
        streamId,
        messages: [message],
        failedEvents: failedEvents,
        successEvents: generateWatchEvents(successEvents),
      })
    }
  }
  /**
   * update the event stream
   * @param streamId 
   * @param event 
   */
  public watchTransactionStream (streamId: string, message: any) {
    return Promise.resolve()
      .then(() => {
        const ind = Queries.localStreams.findIndex((l) => l.streamId === streamId)
        if (ind >= 0) {
          Queries.localStreams[ind].messages.push(message)
          const streamData = Queries.localStreams[ind]
          if (streamData.failedEvents.indexOf(message.topic) >= 0) {
            return {
              status: false,
              messages: streamData.messages,
              completed: true
            }
          } else {
            streamData.successEvents = streamData.successEvents.map((e) => {
              if (e.event === message.topic) {
                e.isChecked = true
              }
              return e
            })
            const allSuccessEventsDone = (streamData.successEvents.findIndex((e) => e.isChecked === false) === -1)
            // if still false, it means there's a event or event that needed to be wait.
            return {
              status: true,
              messages: streamData.messages,
              completed: allSuccessEventsDone
            }
          }
        }
        return false 
      })
  }
}
export default Queries
