interface IError {
  statusCode: number
  errorCode: string
  errorMessage: string
}
export default class AppError extends Error {
  public statusCode: number
  public source?: string
  public errorCode?: string
  public errorMessage?: string
  constructor (data: IError, errMsg?: (string | null)) {
    super(`${data.statusCode} - ${data.errorCode}. Source: ${errMsg || data.errorMessage}`)
    this.statusCode = data.statusCode
    this.errorCode = data.errorCode
    this.errorMessage = this.errorMessage
  }
}