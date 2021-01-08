import {
  ITodoEntity,
  ITodoParams  
} from './interfaces'
import {
  IGeneralEntityDependencies
} from '../../interfaces/index'
export * from './interfaces'
// export * from './enum'
export * from './repository-gateway-interfaces'

export default ({generateId}: IGeneralEntityDependencies) => {
  return class TodoEntity implements ITodoEntity {
    public readonly _id: string = ''
    private _content: string = ''
    public readonly createdAt: number = Date.now()
    public readonly updatedAt: number = Date.now()
    constructor (todoData: Partial<ITodoEntity>) {
      let {
        _id = '',
        content = '',
      } = todoData
      if (!_id) {
        _id = generateId()
      }
      this._id = _id
      this._content = content
    }
      /**
       * Getter content
       * @return {string }
       */
    public get content(): string  {
      return this._content;
    }
      /**
       * Setter content
       * @param {string } value
       */
    public set content(value: string ) {
      if (!value) {
        throw new Error('content must not be null, undefined or empty string.')
      } else if (!(typeof value === 'string')) {
        throw new Error('content must be a string.')
      }
      this._content = value;
    }
    
  }
}