import {body, check} from 'express-validator'
import {Response, Request, NextFunction} from 'express'
import { formValidatorMiddleware, ValidateEmail, ValidateMobileNo,  } from '../utils/helper'
import { LINK_TYPES, CONTACT_NUMBER_TYPES } from '../utils/constants'
import * as regExp from '../utils/regularExpressions'
/**
   * validation of featured access
   */
export const validateOnFeaturedAccess = (value: any, {req}: any) => {
  const {queueGroup, account, smsModule} = value
  const booleanString = ['true', 'false']
  if (queueGroup && ((typeof(queueGroup.status) !== 'boolean' && booleanString.indexOf(queueGroup.status) === -1) || typeof(parseInt(queueGroup.max)) !== 'number') || 
    account && ((typeof(account.status) !== 'boolean' && booleanString.indexOf(queueGroup.status) === -1) || typeof(parseInt(account.max)) !== 'number') || 
    smsModule && (typeof(smsModule.status) !== 'boolean' && booleanString.indexOf(smsModule.status) === -1) ||
    (parseInt(queueGroup.max) < 0 || parseInt(account.max) < 0)
  ) {
    throw new Error('Invalid data. featuredAccess: {queueGroup: {status: boolean, max: validNumber}, account: {status: boolean, max: validNumber}, smsModule: {status: boolean}}')
  }
  req.body.featuredAccess = {
    queueGroup: {
      status: queueGroup.status === 'true',
      max: parseInt(queueGroup.max)
    },
    account: {
      status: account.status === 'true',
      max: parseInt(account.max)
    },
    smsModule: {
      status: smsModule.status === 'true'
    }
  }
  return true
}
export const validateOnEmail = (value: any, {req}: any) => {
  // const {featuredAccess = {}} = req.body
  const validatedEmail = ValidateEmail(value)
  if (!value) {
    throw new Error('Invalid data. email: string')
  } else if (!validatedEmail) {
    throw new Error('Invalid email format.')
  }
  return true
}
export const validateSocialLinks = (socialLinks: any[]) => {
   // validate Links
  //  if (!socialLinks) {
  //    return true
  //  }
   for (let i in socialLinks) {
    if (typeof socialLinks[i].url !== 'string' || LINK_TYPES.indexOf(socialLinks[i].type) === -1) {
      throw new Error('Invalid data. socialLinks: [{id?:string, url:string, type:facebook|instagram|company}]')
    }
    if (socialLinks[i].type === 'facebook') {
      if (!regExp.validFbLink.test(socialLinks[i].url)) {
        throw new Error('Invalid fb link format.')
      }
    }
    if (socialLinks[i].type === 'instagram') {
      if (!regExp.validInstagramLink.test(socialLinks[i].url)) {
        throw new Error('Invalid instagram link format.')
      }
    }
    if (socialLinks[i].type === 'company') {
      if (!regExp.validUrl.test(socialLinks[i].url)) {
        throw new Error('Invalid Company link format.')
      }
    }
  }
  return true
}
export const validateOnMobileNumbers = (contactNumbers: any[]) => {
  for (let i in contactNumbers) {
    if (typeof contactNumbers[i].isPrimary === 'string' && (contactNumbers[i].isPrimary === 'true' || contactNumbers[i].isPrimary === 'false')) {
      contactNumbers[i].isPrimary = contactNumbers[i].isPrimary === 'true'
    }
    contactNumbers[i].number = ValidateMobileNo(contactNumbers[i].number)
    if ((typeof contactNumbers[i].isPrimary !== 'boolean') || typeof (contactNumbers[i].number) !== 'string'
    || CONTACT_NUMBER_TYPES.indexOf(contactNumbers[i].type) === -1) {
      throw new Error('Invalid value. contactNumbers: [{id?:string, isPrimary:boolean, number:validNumber, type:landline|mobile}]')
    }
    // validate mobile number
    if (contactNumbers[i].type === 'mobile') {
      if (!regExp.validNumber.test(contactNumbers[i].number)) {
        throw new Error('Invalid mobile format. Value: 9|09|+639|639XXXXXXXXX')
      }
    }
    if (contactNumbers[i].type === 'landline') {
      if (!regExp.validLandline.test(contactNumbers[i].number)) {
        throw new Error('Invalid landline format. Value: XXXXXXXXX')
      }
    }
  }
  return true
}
const validateOnUpdateAddress = (address: any, {req}: any) => {
  const {street, province, city, zipcode} = address
  // validate request body
  if ((typeof(street) !== 'string' || typeof(province) !== 'string' || typeof(city) !== 'string' || typeof(zipcode) !== 'number') || 
    (!street || !province || !city || zipcode.toString().length !== 4)
    ) {
    throw new Error('Invalid Data: address: {street:string, province:string, city:string, zipcode:number(length=4)}')
  }
  return true
}
const validateCoordinates = (coordinates: any, {req}: any) => {
  const {lat, lng} = coordinates
  // validate request body
  if (typeof(parseFloat(lat)) !== 'number' || typeof(parseFloat(lng)) !== 'number'){
    throw new Error('Invalid Data: coordinates: {lat: number, lng: number}')
  }
  req.body.coordinates = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  }
  return true
}
const validateBranchId = (branchId: string, {req}: any) => {
  const patt = /\s/g
  // validate request body
  if (patt.test(branchId)){
    throw new Error('Invalid branchId format. Must be no space/s on it. branchId: string')
  }
  return true
}
export const AddUpdateBranchValidator = {
  pipeline: [
    body('featuredAccess')
      .custom(validateOnFeaturedAccess),
    body('about')
      .isString()
      .withMessage('Invalid data. about: string'),
    body('branchId')
      .custom(validateBranchId),
    body('email')
      .custom(validateOnEmail),
    body('address')
      .optional()
      .custom(validateOnUpdateAddress),
    body('coordinates')
      .custom(validateCoordinates),
    body('contactNumbers')
      .custom(validateOnMobileNumbers),
    body('socialLinks')
      .custom(validateSocialLinks)
  ],
  middleware: formValidatorMiddleware
}

export const SuspendBranchValidator = {
  pipeline: [
    body('suspendStatus')
      .isBoolean()
      .withMessage('about must me a boolean.')
  ],
  middleware: formValidatorMiddleware
}

