interface IError {
  statusCode: number
  errorCode: string
  errorMessage: string
}
class _AppError extends Error {
  public statusCode: number
  public errorCode: string
  public errorMessage: string
  constructor (data: IError, errMsg?: (string | null)) {
    super(`${data.statusCode} - ${data.errorCode}. Source: ${errMsg || data.errorMessage}`)
    this.statusCode = data.statusCode
    this.errorCode = data.errorCode
    this.errorMessage = data.errorMessage
  }
}
interface IErrorData {
  msg: IError,
  location: string
  param: string
  value: any
}
export default class AppError implements IErrorData {
  public msg: IError
  public location: string
  public param: string
  public value: any
  constructor (data: IErrorData) {
    this.msg = new _AppError(data.msg)
    this.location = data.location
    this.param = data.param
    this.value = data.value
  }
}