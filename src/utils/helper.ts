import * as moment from 'moment'
import { IRequest} from './interfaces';
import {Request, Response, NextFunction} from 'express'
import {validationResult} from 'express-validator'
import * as HttpStatus from 'http-status-codes'
import * as RegexValidator from './regex-validator'
import AppError from './app-error';
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
  const newN = contactNo.toString().trim().replace(/ /g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '')
  const txt = newN.toString().match(RegexValidator.ValidateMobileNo)
  return txt ? txt[0].substr(txt[0].length - 10, 10): null
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
export const formValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let result: any = validationResult(req)
  if (result.errors.length !== 0) {
    return res.status(HttpStatus.BAD_REQUEST)
    .json(result)
  }
  next()
}

/**
 * construct actionBy
 */
export const constructActionBy = (accountData: any) => {
  let actionBy = {
    _id: '',
    avatarUrl: '',
    firstName: '',
    lastName: '',
    roleLevel: '',
  }
  try {
    const {_id, avatarUrl, firstName, lastName, roleLevel} = accountData
    actionBy._id = _id
    actionBy.avatarUrl = avatarUrl
    actionBy.firstName = firstName
    actionBy.lastName = lastName
    actionBy.roleLevel =  roleLevel
  }
  catch (error) {
    console.log('CONSTRUCT ACTION BY ERROR', error)
  }
  return actionBy
}
/**
 * generate query string for internal request
 * @param queryString 
 * @param queryData
 * @param fieldName optional, object properties or index of array
 */
export const generateQueryString = (queryString: string, queryData: any, fieldName?: string) => {
  var x = 0
  for (var query in queryData) {
    // check if fieldName is not empty, if not, add query inside of the '[]' eg: filterBy[value] = testValue
    const queryField = fieldName ? `${fieldName}[${query}]` : query
    try {
      // console.log('queryData[query]: ', queryData[query])
      // check if the value is object
      if (typeof(queryData[query]) === 'object') {
        // recursion call
        queryString = generateQueryString(queryString, queryData[query], query)
      } else {
        queryString = queryString.concat(`&${queryField}=${queryData[query]}`)
      }
    } catch (err) {
      queryString = queryString.concat(`&${queryField}=${queryData[query]}`)
    }
  }
  return queryString
}
/**
 * custom error checker
 * @param res 
 * @param AppErrorMessage
 * @param httpStatusCode
 *  - optional, 
 */
export const ErrorResponse = (res: Response, AppErrorMessage: any, httpStatusCode: number = HttpStatus.BAD_REQUEST) => {
  return (err: any) => {
    // check if the error is have a statusCode.
    // ##DEVNOTE: it means the err is AppError
    if (err.statusCode) {
      res.status(httpStatusCode).send(err)
    } else {
      res.status(httpStatusCode).send(new AppError(AppErrorMessage, err.message))
    }
  }
}