import {MainEntity, IGeneralInteractorEntityDenpendencies, IMainEntityData, IMainRepositoryGateway} from '../../domain'
import {IRequestMain} from '../boundaries/request/IMain'
import { IResponseMain } from '../boundaries/response/IMain'
import {IPaginationQueryParams} from '../../domain'
export interface IMainEntityInteractorDependencies extends IGeneralInteractorEntityDenpendencies<IMainRepositoryGateway> {
  
}
export default class MainEntityInteractor {
  private entityGateway: IMainRepositoryGateway
  // private responseBoundary: IResponseMain
  constructor (mainEntityGateway: IMainRepositoryGateway) {
    this.entityGateway = mainEntityGateway
    // this.responseBoundary = responseBoundary
  }
  public mapEntityObject (data: IMainEntityData) {
    const mainEntityData = new MainEntity(data)
    return <IMainEntityData>{
      _id: mainEntityData.id,
      name: mainEntityData.name,
      isSuspended: mainEntityData.isSuspended,
      createdAt: mainEntityData.createdAt,
      updatedAt: mainEntityData.updatedAt,
    }
  }
  public async saveMain (data: IMainEntityData) {
    const newMainEntity = this.entityGateway.insertOne(this.mapEntityObject(data))
    // this.responseBoundary.presentMain(newMainEntity)
    return newMainEntity
  }
  /**
   * get main list
   * @param queryParams 
   */
  public async findAllMain (queryParams: Omit<IPaginationQueryParams, 'searchFields'>) {
    const {limitTo, searchText, startAt} = queryParams
    // return this.entityGateway.aggregateWithPagination([], {
    //   ...queryParams,
    //   searchFields: ['name']
    // })
  }
  public async updateMainById (id: string, data: IMainEntityData) {
    const {name} = await this.entityGateway.insertOne(this.mapEntityObject(data))
    return this.entityGateway.updateById(id, {name})
  }
}