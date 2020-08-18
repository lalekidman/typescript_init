import {default as http, AxiosResponse, AxiosRequestConfig } from 'axios'
import AppError from './app-error'
import {SYSTEM_ERROR, SERVER_FAILED, URL_NOT_FOUND, UNAUTHORIZED_REQUEST} from './response-codes'
import {REQUEST_LOCATION_TYPES} from './constants'
export default (data: AxiosRequestConfig) => {
  return http(data)
  // .then((response: AxiosResponse) => {
  //   const {data, status, statusText} = response
  //   return <AxiosResponse>{data, status, statusText}
  // })
    .catch((err: any) => {
      if (err.code === 'ECONNREFUSED') {
        // can't reach the ip,
        throw new AppError({
          location: REQUEST_LOCATION_TYPES.SYSTEM,
          value: '',
          param: 'SYSTEM',
          msg: SERVER_FAILED
        }, err.message)
      } else if (err.response.status === 500) {
        //server problem
        throw new AppError({
          location: REQUEST_LOCATION_TYPES.SYSTEM,
          value: '',
          param: 'SYSTEM',
          msg: SYSTEM_ERROR
        }, err.message)
      } else if (err.response.status === 400) {
        throw new AppError({
          location: REQUEST_LOCATION_TYPES.SYSTEM,
          value: '',
          param: 'SYSTEM',
          msg: err.response.data
        }, err.message)
      } else if (err.response.status === 404) {
        throw new AppError({
          location: REQUEST_LOCATION_TYPES.SYSTEM,
          value: '',
          param: 'SYSTEM',
          msg: URL_NOT_FOUND
        }, err.message)
      } else if (err.response.status === 401) {
        throw new AppError({
          location: REQUEST_LOCATION_TYPES.SYSTEM,
          value: '',
          param: 'SYSTEM',
          msg: UNAUTHORIZED_REQUEST
        }, err.response.data.error)
      } else {
        const {message = '', response = {}} = err || {}
        console.log('message: ', message)
        console.log('status: ', response.status)
        console.log('body: ', response.data)
        throw new Error('SYSTEM ERROR')
      }
    })
} 