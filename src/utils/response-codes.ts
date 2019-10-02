export const SYSTEM_ERROR = {
  statusCode: 10401,
  error: 'SYSTEM_ERROR',
  source: ''
}
export const SERVER_FAILED = {
  statusCode: 10402,
  error: 'SERVER_FAILED',
  source: ''
}
export const URL_NOT_FOUND = {
  statusCode: 10403,
  error: 'URL_NOT_FOUND',
  source: ''
}
export const UNAUTHORIZED_REQUEST = {
  statusCode: 10404,
  error: 'UNAUTHORIZED_REQUEST',
  source: ''
}
export const FIELDS_ARE_REQUIRED = {
  statusCode: 10300,
  error: 'FIELDS_ARE_REQUIRED',
  source: 'All fields are required'
}
export const INVALID_VARIABLE_TYPE = {
  statusCode: 10301,
  error: 'INVALID_VARIABLE_TYPE',
  source: ''
}
export const INALID_VALUE = {
  statusCode: 10302,
  error: 'INALID_VALUE',
  source: ''
}


export const INVALID_ACCESS_TOKEN_FORMAT = {
  statusCode: 290,
  error: 'INVALID_ACCESS_TOKEN_FORMAT',
  source: 'Access token is required or please check if the token format is correct.'
}
export const ACCESS_TOKEN_EXPIRED = {
  statusCode: 291,
  error: 'ACCESS_TOKEN_EXPIRED',
  source: 'token is expired.'
}
export const INVALID_EMPLOYEE_LEVEL = {
  statusCode: 292,
  error: 'INVALID_EMPLOYEE_LEVEL',
  source: ''
}

export const FETCH_BRANCH_LIST_FAILED = {
  statusCode: 1501,
  error: 'FETCH_BRANCH_LIST_FAILED',
  source: ''
}
export const FETCH_BRANCH_DETAILS_FAILED = {
  statusCode: 1502,
  error: 'FETCH_BRANCH_DETAILS_FAILED',
  source: ''
}
export const ADD_BRANCH_FAILED = {
  statusCode: 1503,
  error: 'ADD_BRANCH_FAILED',
  source: ''
}
export const UPDATE_BRANCH_FAILED = {
  statusCode: 1504,
  error: 'UPDATE_BRANCH_FAILED',
  source: ''
}
export const SUSPEND_BRANCH_FAILED = {
  statusCode: 1505,
  error: 'SUSPEND_BRANCH_FAILED',
  source: ''
}
export const EMAIL_ALREADY_EXISTS = {
  statusCode: 1510,
  error: 'EMAIL_ALREADY_EXISTS',
  source: ''
}

export const NOT_FOUND_BRANCH_QUEUE_SETTINGS = {
  statusCode: 160404,
  error: 'NOT_FOUND_BRANCH_QUEUE_SETTINGS',
  source: ''
}

export const BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS = {
  statusCode: 160400,
  error: 'BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS',
  source: '** requestBody {features:array, hideCustomerNameField:boolean, ' +
     'hideMobileNumberField:boolean, autoSms:boolean, queuesAway:number, queueTags=array}'
}

export const BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS = {
  statusCode: 161400,
  error: 'BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS',
  source: '** requestBody {enableCustomQr:boolean, imagePreviewDuration:number, ' +
     'customQrLink:string, adsToDelete:array<string>'
}

export const NOT_FOUND_QUEUE_TAGS = {
  statusCode: 161404,
  error: 'NOT_FOUND_QUEUE_TAGS',
  source: ''
}

export const NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS = {
  statusCode: 163404,
  error: 'NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS',
  source: ''
}

export const BAD_REQUEST_BRANCH_ADVERTISEMENT_SETTINGS = {
  statusCode: 163400,
  error: 'BAD_REQUEST_BRANCH_ADVERTISEMENT_SETTINGS',
  source: '** requestBody {enableCustomQr=boolean, customQrLink=string, imagePreviewDuration=number,' +
  'gallery=array}'
}