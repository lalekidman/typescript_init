import uuid from 'uuid/v4'
import Main, {IMainEntityData} from './entity/main'
import Todo from './entity/todo'
import {IMainRepositoryGateway} from './entity/gateway.interfaces'
import { validateHumanName } from '../delivery/helpers'

export const MainEntity = Main({
  generateId: uuid,
  validateHumanName: validateHumanName
})
export const TodoEntity = Todo({
  generateId: uuid
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
}