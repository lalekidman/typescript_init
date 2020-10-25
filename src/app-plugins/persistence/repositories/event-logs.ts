// import {Document, Schema, model} from 'mongoose'
// import {GeneralCommand, ICollectionDefaultProperty} from '../index'
// export interface IEventLogs {
//   event: string
//   newData: any
//   previousData?: any
// }
// export interface IEventLogsModel extends IEventLogs, ICollectionDefaultProperty, Document {}

// export const EventLogsObject = {
//   _id: {
//     type: String,
//     default: '',
//     required: true
//   },
//   event: {
//     type: String,
//     default: '',
//     required: true
//   },
//   newData: {
//     type: Schema.Types.Mixed,
//     default: {}
//   },
//   previousData: {
//     type: Schema.Types.Mixed,
//     default: {}
//   },
//   createdAt: {
//     type: Number,
//     default: 0
//   }
// }
// const EventLogsModel = model<IEventLogsModel>('event_logs', new Schema(EventLogsObject))
// EventLogsModel.ensureIndexes({
//   event: 1,
//   createdAt: -1
// })
// // export default EventLogs
// class EventLogs extends GeneralCommand<IEventLogsModel, IEventLogs> {
//   /**
//    * @class
//    */
//   constructor () {
//     super(EventLogsModel)
//   }

//   public async addLogs (logsData: IEventLogs) {
//     try {
//       const {event, previousData, newData } = logsData
//       const newLogs = this.initialize({event, previousData, newData})
//       await newLogs.save()
//       return newLogs
//     } catch (err) {
//       throw err
//     }
//   }
// }
// export default EventLogs