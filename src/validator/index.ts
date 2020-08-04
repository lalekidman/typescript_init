import {body} from 'express-validator'
import { HumanNamePattern } from '../utils/regex-validator'

export const IndexPostValidationPipeline = [
  body('firstName')
    .matches(HumanNamePattern)
    .withMessage('Invalid human name.')
]