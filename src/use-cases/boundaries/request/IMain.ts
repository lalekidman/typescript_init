import {IMainEntityData} from '../../../domain/index'
import {IGeneralFunc} from './IGeneral'
export interface IRequestMain extends IGeneralFunc<IMainEntityData> {
  saveMain (data: IMainEntityData): Promise<IMainEntityData>
}