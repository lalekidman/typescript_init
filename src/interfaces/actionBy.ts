import {_init} from '../utils/interfaces'
export default interface IAddedBy extends _init {
  _id: any
  firstName: string
  lastName: string
  roleLevel: number
  avatarUrl: string
}