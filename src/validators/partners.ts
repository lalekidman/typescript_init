import {body, check} from 'express-validator'
import {Response, Request, NextFunction} from 'express'
import { formValidatorMiddleware, ValidateEmail,  } from '../utils/helper'
/**
   * validation of featured access
   */
export const validateOnFeaturedAccess = (value: any, {req}: any) => {
  const {queueGroup, account, smsModule} = value
  if (queueGroup && (typeof(queueGroup.status) !== 'boolean' || typeof(parseInt(queueGroup.max)) !== 'number') || 
    account && (typeof(account.status) !== 'boolean' || typeof(parseInt(account.max)) !== 'number') || 
    smsModule && (typeof(smsModule.status) !== 'boolean') ||
    (parseInt(queueGroup.max) < 0 || parseInt(account.max) < 0)
  ) {
    throw new Error('Invalid data. featuredAccess: {queueGroup: {status: boolean, max: validNumber}, account: {status: boolean, max: validNumber}, smsModule: {status: boolean}}')
  }
  return true
}
export const validateOnEmail = (value: any, {req}: any) => {
  // const {featuredAccess = {}} = req.body
  const validatedEmail = ValidateEmail(value)
  if (!value) {
    throw new Error('Email field is required.')
  } else if (!validatedEmail) {
    throw new Error('Invalid email format.')
  }
  return true
}
export const AddPartnerValidator = {
  pipeline: [
    body('featuredAccess')
      .custom(validateOnFeaturedAccess),
    body('about')
      .isString()
      .withMessage('about must me a string.'),
    body('email')
      .custom(validateOnEmail)
  ],
  middleware: formValidatorMiddleware
}

