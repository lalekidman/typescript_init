import {Document, Schema, model} from 'mongoose'
import Queries from '../utils/queries'
export interface IEventLogs {
  event: string
  newData: any
  previousData?: any
}
interface ICollectionDefault {
  _id: any
  createdAt: number
  updatedAt: number
}
export interface IEventLogsModel extends IEventLogs, ICollectionDefault, Document {}

export const EventLogsObject = {
  _id: {
    type: String,
    default: '',
    required: true
  },
  event: {
    type: String,
    default: '',
    required: true
  },
  newData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  previousData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Number,
    default: 0
  }
}
const EventLogsModel = model<IEventLogsModel>('event_logs', new Schema(EventLogsObject))
EventLogsModel.ensureIndexes({
  event: 1,
  createdAt: -1
})
// export default EventLogs
class EventLogs extends Queries<IEventLogsModel> {
  /**
   * @class
   */
  constructor () {
    super(EventLogsModel)
  }

  public async addLogs (logsData: IEventLogs) {
    try {
      const {event, previousData, newData } = logsData
      const newLogs = this.initilize({event, previousData, newData})
      await newLogs.save()
      return newLogs
    } catch (err) {
      throw err
    }
  }
}
export default EventLogs