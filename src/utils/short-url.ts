import http from './http'
export default class ShortURL {
  private DOMAIN : string
  constructor (domain: string) {
    this.DOMAIN = domain
  }
  public generate (url: string) {
    return http({
      url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=',
      method: 'POST',
      // "Content-Type": 'application/json',
      data: {
        longDynamicLink: `https://dqv3s.app.goo.gl?link=${this.DOMAIN.concat(url)}`
      }
    })
    .then((response: any) => {
      const {shortLink: url, error} = <any> response.data
      return (url)
    })
  }
}
