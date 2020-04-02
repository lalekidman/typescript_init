export const DB_HOST = process.env.DB_HOST || ''
export const DB_NAME = process.env.DB_NAME || ''
export const SERVER_PORT = process.env.DB_PORT || 8080
export const SEARCH_VARIABLE_TYPES = {
  MOBILE_NUMBER: 3
}
export enum REQUEST_LOCATION_TYPES {
  BODY = 'body',
  PARAM ='param',
  QUERY = 'query',
  COOKIES = 'cookies',
  HEADERS = 'headers',
  SYSTEM = 'system',
  DATABASE = 'database'
}