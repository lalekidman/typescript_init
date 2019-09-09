'use strict'
import {_init} from '../utils/interfaces'
export default interface IBusinessPartner extends _init {
    name: string
    avatarUrl?: string
    industryId: string
    categoryId: string
}