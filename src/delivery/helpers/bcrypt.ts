import * as bcrypt from 'bcrypt'
const saltRounds = 15
export const hash = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err: any, salt: any) => {
      if (!err) {
        bcrypt.hash(password, salt, (err:any, hash: any) => {
          if (!err) {
            return resolve(hash)
          }
          return reject(err)
        })
      } else {
        return reject(err)
      }
    })
  })
}
export const compare = (password: string, hashPassword: string) => bcrypt.compare(password, hashPassword)
export const compareSync = (password: string, hashPassword: string) => bcrypt.compareSync(password, hashPassword)
export default class Bcrypt {
  private saltRound: number = 15
  constructor (saltRound: number) {
    if (saltRound) {
      this.saltRound = saltRound
    }
  }
  hash (password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(this.saltRound, (err: any, salt: any) => {
        if (!err) {
          bcrypt.hash(password, this.saltRound, (err:any, hash: any) => {
            if (!err) {
              return resolve(hash)
            }
            return reject(err)
          })
        } else {
          return reject(err)
        }
      })
    })
  }
  public compareSync (password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword)
  }
}