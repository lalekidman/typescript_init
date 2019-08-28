

import {_init} from '../utils/interfaces'
export interface TimeLists {
  capacity: number
  id: string
  time: number
}
export interface RerservationTimeSlots {
  availableDays: number[]
  timeLists: TimeLists[]
}

export interface Gallery {
  _id: string
  imageUrl: string
  createdAt: string
}
export interface SocialLinks {
  id: string
  url: string
  type: string
}
export interface IOperationHours {
  _id?: string
  startValue: number
  endValue: number
  enabled: boolean
  day: number
  isWholeDay: boolean
  [key: number]: number
}
export interface TimeSlotLists {
  value: number
  createdAt: number
  capacity: number
  _id: string
}
export interface SmsSettings {
  status: boolean
  costValue: number
  notifyNo: number
}
export interface TimeSlots {
  day: number
  lists: TimeSlotLists[]
}
export interface ReservationSettings {
  cutOffHours: number
  timeSlots: TimeSlots[]
}
export interface SeatsCapacity {
  min: number
  max: number
}
export interface ISmsConfig {
  status: boolean
  'number': number
}
export interface SmsCredit {
  consumed: number
  total: number
}
export interface IPrintingDetails {
  status: boolean
  qrDesc: string
  qrLink: string
}
export default interface ISetting extends _init {
  isWeeklyOpened: boolean
  counter: number
  totalQueueGroup: number
  tvDisplayType: string
  branchId: string
  socialLinks: Array<SocialLinks>
  modules: Array<string>
  operationHours: Array<IOperationHours>
  gallery: Array<Gallery>
  reservationTimeSlots: RerservationTimeSlots
  printingDetails: IPrintingDetails
  smsConfig: ISmsConfig
  smsCredit: SmsCredit
  smsSettings: SmsSettings
  seatsCapacity: SeatsCapacity
}