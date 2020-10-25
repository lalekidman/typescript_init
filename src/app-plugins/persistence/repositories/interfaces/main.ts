import {ICollectionDefaultProperty} from './general'
import {Document} from 'mongoose'
import {IMainEntityData} from '../../../../domain'
export interface IMainEntityBody extends IMainEntityData, ICollectionDefaultProperty {
  _id: any // override the data type.
}
export default interface IMainEntity extends IMainEntityBody, Document {}