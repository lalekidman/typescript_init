import * as mongoose from 'mongoose'
export default class DB {
  private name: string = ''
  private host: string = ''
  private DBURI: string = ''
  /**
   * 
   * @param host db host
   * @param name db name
   */
  constructor (host: string, name: string) {
    this.setHost(host)
    this.setName(name)
  }
  /**
   * set the db name of the db uri
   * @param name string
   */
  public setName (name: string) {
    return this.name = name
  }
  /**
   * set the host of the db uri
   * @param host 
   */
  public setHost (host: string) {
    return this.host = host
  }
  /**
   * set the uri of the db
   * @param uri 
   */
  public setDbUrl (uri: string) {
    return this.DBURI = uri
  }
  /**
   * connect the db.
   */
  public connect () {
    this.DBURI = `mongodb://${this.host}/${this.name}`
    if (process.env.NODE_ENV === 'test') {

    } else {
      return mongoose.connect(this.DBURI, {useNewUrlParser: true}).then((res) => {
        console.log('Successfully connected to database.')
        return res
      }).catch((err) => {
        console.log('Failed to connect to the database. Error: ', err)
        throw err
      })
    }
  }
}