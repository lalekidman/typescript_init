import Http from '../utils/http'
interface IAccountData {
  firstName: string
  lastName: string
  email: string
  partnerId: string
  contactNo: string
  roleLevel: number
}
export default class Account {
  private URL: string
  constructor () {
    this.URL = `http://${process.env.ACCOUNT_SERVICE_URL}`
  }
  public findOne (branchId: string) {
    const url = `${this.URL}/${branchId}`
    return Http({
      url: url,
      method: 'GET'
    })
  }
  public addAccount (branchId: string, data: IAccountData) {
    const url = `${this.URL}/${branchId}`
    return Http({
      url: url,
      data,
      method: 'POST'
    })
  }
}