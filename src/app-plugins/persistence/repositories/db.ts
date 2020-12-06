import * as mongoose from 'mongoose'
interface IDatabaseOptions {
  name: string // name of the database
  host: string // host of the database'
  authDBName?: string // auth db name
  // databaseURI?: string // full uri of the database
}
export default class Database {
  private _name: string = ''
  private _host: string = ''
  private _authDBName: string = ''
  private _databaseURI: string = ''
  /**
   * 
   * @param host db host
   * @param name db name
   */
  constructor (options: IDatabaseOptions) {
    this.name = options.name
    this.host = options.host
    this.authDBName = options.authDBName ? options.authDBName : ''
    // this.databaseURI = options.databaseURI ? options.databaseURI : ''
  }
  
    /**
    * set the db name of the db uri
     * Getter name
     * @return {string }
     */
	public get name(): string  {
		return this._name;
	}

    /**
     * Getter host
     * @return {string }
     */
	public get host(): string  {
		return this._host;
	}

    /**
     * Getter authDBName
     * @return {string }
     */
	public get authDBName(): string  {
		return this._authDBName;
	}

  /**
   * Getter databaseURI
   * @return {string }
   */
  public get databaseURI(): string  {
    return this._databaseURI;
  }

  /**
   * Setter name
   * @param {string } value
   */
  public set name(value: string ) {
    this._name = value;
  }

  /**
   * set the host of the db uri
   * Setter host
   * @param {string } value
   */
  public set host(value: string ) {
    this._host = value;
  }

  /**
   * set the uri of the db
   * Setter authDBName
   * @param {string } value
   */
  public set authDBName(value: string ) {
    this._authDBName = value;
  }
  // /**
  //  * Setter databaseURI
  //  * @param {string } value
  //  */
  // public set databaseURI(value: string ) {
  //   this._databaseURI = value;
  // }
  /**
   * connect the db.
   */
  public connect () {
    this._databaseURI = `mongodb://${this.host}/${this.name}`
    if (this.authDBName) {
      this._databaseURI = `${this._databaseURI}?authSource=${this.authDBName}`
    }
    if (process.env.NODE_ENV === 'test') {

    } else {
      return mongoose.connect(this.databaseURI, {useNewUrlParser: true}).then((res) => {
        console.log('Successfully connected to database.')
        return res
      }).catch((err) => {
        console.log('Failed to connect to the database. Error: ', err)
        throw err
      })
    }
  }
}