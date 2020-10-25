/**
 * @libraries
 */
import {Document, Model, Schema, SchemaTypeOpts, model} from 'mongoose'
/**
 * @models
 */
/**
 * @repositories
 */
import MainRepository from './main'
/**
 * @interfaces
 */
import {ICollectionDefaultProperty} from './interfaces/general'
/**
 * @db
 */
import DB from './db'

export {
  /**
   * @library_interfaces
   */
  Document,
  Model,
  model,
  Schema,
  SchemaTypeOpts,
/**
 * @interfaces
 */
  ICollectionDefaultProperty,
  /**
   * @repository
   */
  MainRepository
}
export default DB