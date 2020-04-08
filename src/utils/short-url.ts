import http from './http'
import { DYNAMIC_LINK_API_KEY } from './constants'
// import * as http from 'request'
export default class ShortURL {
  private HOST : string
  /**
   * create short url using dynamic links of firebase.
   * @param host 
   */
  constructor (host: string) {
    this.HOST = host
  }
  public generate (url: string, data: any) {
    const {metaTags = null} =data
    return http({
      url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${DYNAMIC_LINK_API_KEY}`,
      method: 'POST',
      // "Content-Type": 'application/json',
      data: {
        dynamicLinkInfo: Object.assign({
          domainUriPrefix: "https://kyoo.page.link",
          link: this.HOST.concat(url),
          androidInfo: {
            androidPackageName: "com.leisue.kyoo_customer"
          }
        }, 
          metaTags ? {
            socialMetaTagInfo: {
              socialTitle: metaTags.title,
              socialDescription: metaTags.desc,
              socialImageLink: metaTags.imageURL
            }
          } : {}
        )
      }
    })
    .then((response: any) => {
      const {shortLink: url, error} = <any> response.data
      return (url)
    })
  }
}