import * as jwt from 'jsonwebtoken'
class Token {
  private jwt: any
  private DEFAULT_SECRET_KEY: string = ''
  private DEFAULT_PUBLIC_KEY: string = ''
  private signOptions: any = {}
  constructor (secretKey = 'SAMPLE_DEFAULT_SECRET_KEY_THAT_SHOULD_NOT_BE_SHARED') {
    this.jwt = jwt
    this.setSecretKey(secretKey)
  }
  setSecretKey (secretKey: string) {
    return this.DEFAULT_SECRET_KEY = secretKey
  }
  setPublicKey (publicKey: string) {
    return this.DEFAULT_PUBLIC_KEY = publicKey
  }
  setOptions(data:any = {}) {
    const {subject, issuer, audience} = data
    return this.signOptions = Object.assign({}, (subject ? {subject} : {}), (audience ? {audience} : {}), (issuer ? {issuer} : {}))
  }
  generate (data: any, minutes:number = 5, opt = null) {
    const expiration = minutes ? {expiresIn: (60 * Math.floor(minutes))} : null
    const options = Object.assign(opt || {}, expiration || {}, this.signOptions)
    return {
      token: this.jwt.sign(data, this.DEFAULT_SECRET_KEY, options),
      expiration: expiration ? (expiration.expiresIn * 1000) + Date.now() : 0
    }
  }
  verify (token: string, opt: any = null):Promise<object> {
    return new Promise((resolve, reject) => {
      const options = Object.assign(opt ? this.setOptions(opt) : this.signOptions)
      this.jwt.verify(token, this.DEFAULT_SECRET_KEY, options, (err : any, decoded: any) => {
        if (!err) {
          resolve(decoded)
        } else {
          reject(err)
        }
      })
    })
  }
}
export default Token
