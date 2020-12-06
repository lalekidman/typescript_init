// import {SchemaTypeOpts, Schema, Document, model} from '../index'
// import {IMainEntity} from '../interfaces/main'
// export interface IMainEntityCollectionModel extends IMainEntity, Document {}
// const MainEntityObject:Record<keyof IMainEntity, SchemaTypeOpts<any>> ={
//   _id: {
//     type: String,
//     default: ''
//   },
//   isSuspended: {
//     type: Boolean,
//     default: false
//   },
//   name: {
//     type: String,
//     default: ''
//   },
//   updatedAt: {
//     type: Number,
//     default: 0
//   },
//   createdAt: {
//     type: Number,
//     default: 0
//   },
// }
// const ModelSchema = new Schema(MainEntityObject)
// ModelSchema.index({
//   isSuspended: 1
// })
// ModelSchema.index({
//   createdAt: -1
// })
// // sample
// const MainEntityModel = model<IMainEntityCollectionModel>("mains", ModelSchema)
// export default MainEntityModel