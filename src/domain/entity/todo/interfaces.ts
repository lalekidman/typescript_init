import {
 IGeneralEntityProperties
} from '../../interfaces'


export interface ITodoParams {
  content: string 
}

export type ITodoEntity = IGeneralEntityProperties & ITodoParams & {
}