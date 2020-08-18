import GeneralDBCommand from './general'
import {IMainEntityData, IMainGateway} from '../../../../domain'
import {Model, IMainCollection} from '../index'
export default (db: Model<IMainCollection>) => (class MainEntityDb extends GeneralDBCommand<IMainCollection, IMainEntityData> implements IMainGateway {
  constructor () {
    super(db)
  }
})