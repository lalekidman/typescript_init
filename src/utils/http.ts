import {default as http, AxiosResponse, AxiosRequestConfig } from 'axios'
import AppError from './app-error'
import {SYSTEM_ERROR, SERVER_FAILED, URL_NOT_FOUND, UNAUTHORIZED_REQUEST} from './response-codes'
export default (data: AxiosRequestConfig) => {
  return http(data)
  // .then((response: AxiosResponse) => {
  //   const {data, status, statusText} = response
  //   return <AxiosResponse>{data, status, statusText}
  // })
    .catch((err: any) => {
      if (err.code === 'ECONNREFUSED') {
        // can't reach the ip,
        throw new AppError(SERVER_FAILED, err.message)
      } else if (err.response.status === 500) {
        //server problem
        throw new AppError(SYSTEM_ERROR, err.message)
      } else if (err.response.status === 400) {
        throw new AppError(err.response.data)
      } else if (err.response.status === 404) {
        throw new AppError(URL_NOT_FOUND, 'Request failed with status code 404')
      } else if (err.response.status === 401) {
        throw new AppError(UNAUTHORIZED_REQUEST, err.response.data.error)
      } else {
        const {message = '', response = {}} = err || {}
        console.log('message: ', message)
        console.log('status: ', response.status)
        console.log('body: ', response.data)
        throw new Error('SYSTEM ERROR')
      }
    })
} 