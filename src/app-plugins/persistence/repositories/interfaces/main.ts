import {ICollectionDefaultProperty} from './general'
import {IMainEntityData} from '../../../../domain'
export interface IMainEntityBody extends IMainEntityData, ICollectionDefaultProperty {
  _id: any // override the data type.
}
export interface IMainEntity extends IMainEntityBody {}