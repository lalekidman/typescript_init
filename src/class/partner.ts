import Http from '../utils/http'
export default class Partner {
  constructor () {
  }
  public findOne (partnerId: string) {
    const url = `http://${process.env.PARTNER_SERVICE_URL}:3000/${partnerId}`
    return Http({
      url: url,
      method: 'GET'
    })
  }
}