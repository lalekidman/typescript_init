import * as moment from 'moment'
import { IRequest} from './interfaces';
import { FORM_DATA_TYPES } from './constants';
import AppError from './app-error';
import * as RC from './response-codes'
export interface IGeoInfo {
  range: number[]
  counter: string
  region: string
  eu: string
  timezone: string
  city: string
  ll: number[]
  metro: number
  area: number
}
interface IRequest2 extends IRequest{
  geoInfo: IGeoInfo
  clientIp: string
}
export const TrimMobileNo = (contactNo: string|number): string => contactNo.toString().replace(/[^+\d]+/g, "")
export const ValidateMobileNo = (contactNo: string|number): string|null => {
  const newN = contactNo.toString().replace(/ /g, '').replace(/-/g, '')
  const patt = /^(\+639|09|9)\d{9}$/g
  const txt = newN.toString().match(patt)
  return txt ? txt[0]: null
}
export const ValidateEmail = (email: string): boolean => {
  const pattern = /^\S+@\S+$/
  return pattern.test(email)
}
/**
 * 
 * @param dateFrom startDate
 * @param dateTo endDate
 */
export const getDateRange = (dateFrom?: number, dateTo?: number) => ({
  dFrom: (new Date(moment(dateFrom || Date.now()).format('YYYY-MM-DD 00:00:00'))).getTime(),
  dTo: (new Date(moment(dateTo || Date.now()).format('YYYY-MM-DD 23:59:59'))).getTime()
})
/**
 * 
 * @param searchFields array of fieldName that needed to be search, eg: name, email
 * @param searchText value that needed to be search
 */
export const generateSearchFields = (searchFields: string[], searchText: string) => (searchFields.map((field: string) => ({[field]: {
  $regex: new RegExp(searchText, 'gi')
}})))

export const getClientInfo = (req: IRequest2) => {
  return {
    geoInfo: <IGeoInfo> req.geoInfo || {},
    ip: req.clientIp || '0.0.0.0',
    userId: req.user ? req.user._id : "b7a8823f-41df-4845-ba54-cbb168bfcb28"
  }
}
interface IFormDataValidator {
  fieldName: string
  type: number
  value: any
}
const FormDataVariableTypes = [
  {
    formType: FORM_DATA_TYPES.STRING,
    value: 'string',
  },
  {
    formType: FORM_DATA_TYPES.NUMBER,
    value: 'number',
  },
  {
    formType: FORM_DATA_TYPES.BOOLEAN,
    value: 'boolean',
  },
  {
    formType: FORM_DATA_TYPES.ARRAY,
    value: 'array',
  },
]
export const formDataValidator = async (formdata: IFormDataValidator[]) => {
  for (let x = 0; x < formdata.length; x++) {
    FormDataVariableTypes.forEach(v => {
      const dataType = typeof(formdata[x].value)
      if (Array.isArray(formdata[x].value)) {
        if (formdata[x].type !== FORM_DATA_TYPES.ARRAY) {
          throw new AppError(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a ${v.value}. Detect: array.`)
        }
      } else {
        if (formdata[x].type === FORM_DATA_TYPES.ARRAY) {
          throw new AppError(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a array. Detect: ${dataType}.`)
        } else if (formdata[x].type === FORM_DATA_TYPES.NUMBER) {
          if (isNaN(formdata[x].value)) {
            throw new AppError(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a number. Detect: ${dataType}.`)
          }
        } else if (formdata[x].type === v.formType && dataType !== v.value) {
          throw new AppError(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a ${v.value}. Detect: ${dataType}.`)
        }
      }
    })
  }
}