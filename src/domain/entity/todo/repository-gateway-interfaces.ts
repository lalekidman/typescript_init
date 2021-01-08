import { IGeneralRepositoryGateway } from '../../interfaces/general-repository-gateway'
import {
  ITodoEntity
} from './interfaces'
export interface ITodoRepositoryGateway extends IGeneralRepositoryGateway<ITodoEntity> {
  getList(): Promise<ITodoEntity>
}