import uuid from 'uuid/v4'
import Main, {IMainEntityData} from './entity/main'
import {IMainRepositoryGateway} from './entity/gateway.interfaces'
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
   * @domain_entity
   */
  MainEntity,
}