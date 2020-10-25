// first inner layer
interface IMainDependencies {
  generateId: () => string
  validateHumanName: (name: string) => boolean
}
export interface IMainEntityData {
  _id: string // id of the main
  name: string // name of the main
  isSuspended: boolean // isSuspended toggle of the main
  updatedAt: number // milis of when it updated
  createdAt: number // milis of when it created
}
export default ({generateId, validateHumanName}: IMainDependencies) => {
  /**
   * @class main entity
   */
  return class MainEntity {
    // private variables

    private _id: string = ''
    private _name: string = ''
    private _isSuspended: boolean = false
    private _updatedAt: number = Date.now()
    private _createdAt: number = Date.now()
    /**
     * 
     * @param data 
     */
    constructor (data: IMainEntityData) {
      const {
        _id = generateId(),
        isSuspended = false,
        name,
        updatedAt = 0,
        createdAt = Date.now()} = data
      if (!_id) {
        throw new Error('id is a required field.')
      }
      if (!name) {
        throw new Error('name is a required field.')
      }
      if (!validateHumanName(name)) {
        throw new Error('Invalid human name format.')
      }
      if (name.length <= 2) {
        throw new Error('name must be a greater than 2 characters.')
      }
      if (typeof(isSuspended) !== 'boolean') {
        throw new Error('isSuspended must be a boolean.')
      }
    }

      /**
       * Getter id
       * @return {string }
       */
    public get id(): string  {
      return this._id;
    }

      /**
       * Getter name
       * @return {string }
       */
    public get name(): string  {
      return this._name;
    }

      /**
       * Getter isSuspended
       * @return {boolean }
       */
    public get isSuspended(): boolean  {
      return this._isSuspended;
    }

      /**
       * Getter updatedAt
       * @return {number }
       */
    public get updatedAt(): number  {
      return this._updatedAt;
    }

      /**
       * Getter createdAt
       * @return {number }
       */
    public get createdAt(): number  {
      return this._createdAt;
    }

      /**
       * Setter id
       * @param {string } value
       */
    public set id(value: string ) {
      this._id = value;
    }

      /**
       * Setter name
       * @param {string } value
       */
    public set name(value: string ) {
      this._name = value;
    }

      /**
       * Setter isSuspended
       * @param {boolean } value
       */
    public set isSuspended(value: boolean ) {
      this._isSuspended = value;
    }

      /**
       * Setter updatedAt
       * @param {number } value
       */
    public set updatedAt(value: number ) {
      this._updatedAt = value;
    }

      /**
       * Setter createdAt
       * @param {number } value
       */
    public set createdAt(value: number ) {
      this._createdAt = value;
    }
  }
}