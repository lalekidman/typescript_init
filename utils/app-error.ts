interface IError {
  statusCode: number
  error: string
  source?: string
}
export default class AppError extends Error {
  public statusCode: number
  public error: string
  public source?: string
  constructor (data: IError, errMsg?: (string | null)) {
    super(`${data.statusCode} - ${data.error}. Source: ${errMsg || data.source}`)
    this.statusCode = data.statusCode
    this.error = data.error
    this.source = errMsg || data.source
  }
}