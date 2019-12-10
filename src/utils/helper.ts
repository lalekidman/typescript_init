import * as moment from 'moment'
import { IRequest} from './interfaces';
import {Request, Response, NextFunction} from 'express'
import {validationResult} from 'express-validator'
import * as HttpStatus from 'http-status-codes'
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
  const patt = /^((\+639|639|09|9)\d{9})$/g
  const txt = newN.toString().match(patt)
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
/**
 * generate query string for internal request
 * @param queryString 
 * @param queryData
 * @param fieldName optional, if its object or array
 */
export const generateQueryString = (queryString: string, queryData: any, fieldName?: string) => {
  for (var query in queryData) {
    // check if fieldName is not empty, if not, add query inside of the '[]' eg: filterBy[value] = testValue
    const queryField = fieldName ? `${fieldName}[${query}]` : query
    try {
      // check if the value is object
      if (typeof(queryData[query]) === 'object') {
        // recursion call
        queryString = queryString.concat(generateQueryString(queryString, queryData[query], query))
      } else {
        queryString = queryString.concat(`&${queryField}=${queryData[query]}`)
      }
    } catch (err) {
      queryString = queryString.concat(`&${queryField}=${queryData[query]}`)
    }
  }
  return queryString
}
export const formValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let result: any = validationResult(req)
  if (result.errors.length !== 0) {
    return res.status(HttpStatus.BAD_REQUEST)
    .json(result)
  }
  next()
}