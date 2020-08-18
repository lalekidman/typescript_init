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
    private _id: string
    private name: string
    private isSuspended: boolean = false
    private updatedAt: number = Date.now()
    private createdAt: number = Date.now()
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
      this._id = _id
      this.name = name
      this.isSuspended = isSuspended
      this.updatedAt = updatedAt
      this.createdAt = createdAt
    }
    public getId () {
      return this._id
    }
    public getName () {
      return this.name
    }
    public getIsSuspended () {
      return this.isSuspended
    }
    public getUpdatedAt () {
      return this.updatedAt
    }
    public getCreatedAt () {
      return this.createdAt
    }
    /**
     * set the suspend status of main entity
     * @param status 
     */
    public setSuspendStatus (status: boolean) {
      return this.isSuspended = status
    }
  }
}