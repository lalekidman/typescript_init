import * as uuid from 'uuid/v4'
import Main, {IMainEntityData} from './entity/main'
import {IMainRepositoryGateway} from './entity/gateway.interfaces'
import {IGeneralInteractorEntityDenpendencies} from './interfaces/index'
import {IPaginationQueryParams, IAggregatePagination, IPaginationParameters}  from './interfaces/general-repository-gateway'
import { validateHumanName } from '../delivery/helpers'
const MainEntity = Main({
  generateId: uuid,
  validateHumanName: validateHumanName
})
export {
  /**
   * @entity_interfaces
   */
  IMainEntityData,
  /**
   * @entity_gateway_interfaces
   */
  IMainRepositoryGateway,
  /**
   * @general_repository_interfaces
   */
  IPaginationParameters,
  IPaginationQueryParams,
  IAggregatePagination,
  /**
   * entity_dependencies
   */
  IGeneralInteractorEntityDenpendencies,
  /**
   * @domain_entity
   */
  MainEntity,
}