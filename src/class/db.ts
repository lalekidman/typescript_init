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
  public setName (name: string) {
    return this.name = name
  }
  public setHost (host: string) {
    return this.host = host
  }
  public setDbUrl (url: string) {
    return this.DBURI = url
  }
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