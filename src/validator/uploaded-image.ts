import {Request, Response, NextFunction} from 'express'
import { IRequest } from '../utils/interfaces';
import { ValidateImage } from '../utils/regex-validator';
import * as HttpStatus from 'http-status-codes'
import * as RC from '../utils/response-codes'
import AppError from '../utils/app-error'
/**
 * validate if uploaded file is a valid images
 * @param fileName fileName from the request files
 */
const ImageValidator = (fileName: string) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.files) {
      next()
      return
    }
    if (req.files[fileName]) {
      if (!(req.files[fileName].type.match(ValidateImage))) {
        res.status(HttpStatus.BAD_REQUEST).send({
          error: `uploaded file type must be either ${(ValidateImage).toString()}`
        })
        return
      }
    }
    next()
    return
  }
}
export default ImageValidator