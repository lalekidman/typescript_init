import * as moment from 'moment'
import { IRequest} from '../utils/interfaces';
import {Request, Response, NextFunction} from 'express'
import {validationResult} from 'express-validator'
import * as HttpStatus from 'http-status-codes'
import {ImagePattern, MobileNumberPattern} from '../utils/regex-pattern'
import * as RegexValidator from '../utils/regex-pattern'
import { REQUEST_LOCATION_TYPES } from '../utils/constants';
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
interface IRequestImageParamValidation {
  isRequired: boolean
  fileName: string
}
/**
 * validate mobileNumber
 * @param contactNo 
 */
export const ValidateMobileNo = (contactNo: string|number): string|null => {
  const newN = contactNo.toString().trim().replace(/ /g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '')
  const txt = newN.toString().match(MobileNumberPattern)
  return txt ? txt[0].substr(txt[0].length - 10, 10): null
}
/**
 * validate human name
 * @param name 
 */
export const validateHumanName = (name: string) => {
  return name.match(RegexValidator.HumanNamePattern) !== null
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

export const formValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let result: any = validationResult(req)
  if (result.errors.length !== 0) {
    return res.status(HttpStatus.BAD_REQUEST)
    .json(result)
  }
  next()
}

/**
 * validate request params middleware
 * @param pipeline express validator pipeline such as query | body | params | cookie | header etc...
 * @param imageFileName fileName or array of fileName that needed to be check if image type
 */
export const requestParamsValidatorMiddleware = (pipeline: any[], imageFileName?: string | string[]) => {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    await Promise.all(pipeline.map(validation => validation.run(req)));
    let result: any = validationResult(req)
    
    const validateUploadedImage = (uploadedImage: string | IRequestImageParamValidation) => {
      const _paramName = (typeof(uploadedImage) === 'string') ? uploadedImage : uploadedImage.fileName
      var image = req.files[_paramName]
      const imageURL = req.body[_paramName]
      if (imageURL && (typeof imageURL === 'string' && ImagePattern.test(imageURL))) {
        // if imageURL is not empty and image format, skip the validation
        return true
      }
      if (!(typeof(uploadedImage) === 'string') && (uploadedImage.isRequired && image?.size <= 0)) {
        result.errors.push({
          value: image,
          msg: `this field is required. ${_paramName}: ${(ImagePattern).toString()} `,
          param: _paramName,
          location: 'file'
        })
        return false
      }
      if (image && image.size > 0) {
        if (!(image.type.match(ImagePattern))) {
          result.errors.push({
            value: image,
            msg: `allow file type to upload. ${(ImagePattern).toString()}`,
            param: _paramName,
            location: 'file'
          })
        }
      }
      return false
    }
    if (imageFileName) {
      if (Array.isArray(imageFileName)) {
        for(let x in imageFileName) {
          validateUploadedImage(imageFileName[x])
        }
      } else {
        validateUploadedImage(imageFileName)
      }
    }
    if (!(result.isEmpty())) {
      return res.status(HttpStatus.BAD_REQUEST)
      .json(result)
    }
    next()
  }
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
    const andSign = queryString ? '&' : '?'
    // check if fieldName is not empty, if not, add query inside of the '[]' eg: filterBy[value] = testValue
    const queryField = fieldName ? `${fieldName}[${query}]` : query
    try {
      // console.log('queryData[query]: ', queryData[query])
      // check if the value is object
      if (typeof(queryData[query]) === 'object') {
        // recursion call
        queryString = generateQueryString(queryString, queryData[query], query)
      } else {
        queryString = queryString.concat(andSign).concat(`${queryField}=${queryData[query]}`)
      }
    } catch (err) {
      queryString = queryString.concat(andSign).concat(`${queryField}=${queryData[query]}`)
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
    if (err.param) {
      res.status(httpStatusCode).send({
        errors: [err]
      })
    } else {
      res.status(httpStatusCode).send({
        errors: [
          {
            location: REQUEST_LOCATION_TYPES.SYSTEM,
            msg: err.message,
            param: '',
            value: ''
          }
        ]
      })
    }
  }
}
/**
 * get the changedProperty of newObject to previousObject
 * @param newObject new data 
 * @param previousObject old/previous data
 * @param withValues set true if want the return with values, default false
 */
export const getChangedProperties = (newObject: any, previousObject: any, withValues: boolean = false) => {
  const changedProps = {
    removed: <any[]>[],
    updated: <any[]>[],
    added: <any[]>[]
  }
  const addToChanges = (arr: any[], prop: string, value?: any) => {
    arr.push(withValues ? {
      fieldName: prop,
      value: value
    } : prop)
    return arr
  }
  const getRemoveOrAddedProperty = (newObject: any, previousObject: any, arr: any[] = [], parentField: any = '') => {
    for (let prop in newObject) {
      if (['array', 'object'].indexOf(typeof newObject[prop]) >= 0) {
        getRemoveOrAddedProperty(newObject[prop], previousObject ? previousObject[prop] : undefined, arr, `${parentField}${prop}->`)
      } else {
        if (previousObject === undefined || previousObject[prop] === undefined) {
          arr = addToChanges(arr, `${parentField}${prop}`, newObject[prop])
        }
      }
    }
    return arr
  }
  const getUpdatedProp = (newObject: any, previousObject: any, arr: any[] = [], parentField: any = '') => {
    for (let prop in newObject) {
      if (['array', 'object'].indexOf(typeof newObject[prop]) >= 0) {
        getUpdatedProp(newObject[prop], previousObject ? previousObject[prop] : undefined, arr, `${parentField}${prop}->`)
      } else {
        if (newObject && previousObject) {
          if ((newObject[prop] && previousObject[prop]) && newObject[prop] !== previousObject[prop]) {
            arr = addToChanges(arr, `${parentField}${prop}`, newObject[prop])
          }
        }
      }
    }
    return arr
  }
  // get added property
  changedProps.added = getRemoveOrAddedProperty(newObject, previousObject)
  // get remove
  changedProps.removed = getRemoveOrAddedProperty(previousObject, newObject)
  // get updated
  changedProps.updated = getUpdatedProp(newObject, previousObject)
  return changedProps
}