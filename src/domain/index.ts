import * as uuid from 'uuid/v4'
import MainEntity, {IMainEntityData} from './entity/main'
import {IMainGateway} from './interface-gateways/IMain'
import {IPaginationQueryParams, IAggregatePagination} from './interface-gateways/IGeneral'
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