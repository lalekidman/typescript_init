import * as uuid from '../app-plugins/persistence/repositories/gateways/node_modules/uuid/v4'
import MainEntity, {IMainEntityData} from './entity/main'
import {IMainGateway} from './interfaces/IMain'
import {IPaginationQueryParams, IAggregatePagination}  from './interfaces/general-repository-gateway'
import { validateHumanName } from '../delivery/helpers'
export {
  IMainEntityData,
  IMainGateway,
  
  //general interfaces
  IPaginationQueryParams,
  IAggregatePagination
}
export default MainEntity({
  generateId: uuid,
  validateHumanName: validateHumanName
})