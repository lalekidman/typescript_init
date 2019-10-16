import Http from '../utils/http'
const URL = `http://${process.env.PARTNER_HOST}`
class Industry {
  public findById (industryId: string) {
    return Http({
      method: 'GET',
      url: `${URL}/settings/industry/${industryId}`,
      headers: {
        ContentType: 'application/json'
      }
    }).then((response: any) => {
      const {data, status = '', statusText = ''} = response
      return data
    })
    .catch(() => {
      throw new Error('Failed to fetch industry data.')
    })
  }
}
export default Industry