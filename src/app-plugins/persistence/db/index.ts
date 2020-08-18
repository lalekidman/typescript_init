import MainDBP from './gateways/main'
import GeneralCommand from './gateways/general'
import MainEntityCollection from './models/main'
import IMainCollection  from './interfaces/main'
import {ICollectionDefaultProperty} from './interfaces/general'
import {Document, Model} from 'mongoose'
import DB from './db'
export {
// interfaces
  ICollectionDefaultProperty,
  Document,
  Model,
  IMainCollection,
// classes
  GeneralCommand
// methods
}
export const MainDB = MainDBP(MainEntityCollection)
export default DB