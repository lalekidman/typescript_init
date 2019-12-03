import {_init} from '../utils/interfaces'

export interface IQueueTags extends _init {
  tagName: string
}

export default interface IQueueSettings extends _init {
  branchId: string
  features: Array<number>
  hideCustomerNameField: boolean
  hideMobileNumberField: boolean
  autoSms: boolean
  autoSmsQueuesAwayNotification: number
  queueTags: Array<IQueueTags>
}