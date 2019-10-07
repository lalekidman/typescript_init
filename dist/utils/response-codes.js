"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_ERROR = {
    statusCode: 10401,
    error: 'SYSTEM_ERROR',
    source: ''
};
exports.SERVER_FAILED = {
    statusCode: 10402,
    error: 'SERVER_FAILED',
    source: ''
};
exports.URL_NOT_FOUND = {
    statusCode: 10403,
    error: 'URL_NOT_FOUND',
    source: ''
};
exports.UNAUTHORIZED_REQUEST = {
    statusCode: 10404,
    error: 'UNAUTHORIZED_REQUEST',
    source: ''
};
exports.FIELDS_ARE_REQUIRED = {
    statusCode: 10300,
    error: 'FIELDS_ARE_REQUIRED',
    source: 'All fields are required'
};
exports.INVALID_VARIABLE_TYPE = {
    statusCode: 10301,
    error: 'INVALID_VARIABLE_TYPE',
    source: ''
};
exports.INALID_VALUE = {
    statusCode: 10302,
    error: 'INALID_VALUE',
    source: ''
};
exports.INVALID_ACCESS_TOKEN_FORMAT = {
    statusCode: 290,
    error: 'INVALID_ACCESS_TOKEN_FORMAT',
    source: 'Access token is required or please check if the token format is correct.'
};
exports.ACCESS_TOKEN_EXPIRED = {
    statusCode: 291,
    error: 'ACCESS_TOKEN_EXPIRED',
    source: 'token is expired.'
};
exports.INVALID_EMPLOYEE_LEVEL = {
    statusCode: 292,
    error: 'INVALID_EMPLOYEE_LEVEL',
    source: ''
};
exports.FETCH_BRANCH_LIST_FAILED = {
    statusCode: 1501,
    error: 'FETCH_BRANCH_LIST_FAILED',
    source: ''
};
exports.FETCH_BRANCH_DETAILS_FAILED = {
    statusCode: 1502,
    error: 'FETCH_BRANCH_DETAILS_FAILED',
    source: ''
};
exports.ADD_BRANCH_FAILED = {
    statusCode: 1503,
    error: 'ADD_BRANCH_FAILED',
    source: ''
};
exports.UPDATE_BRANCH_FAILED = {
    statusCode: 1504,
    error: 'UPDATE_BRANCH_FAILED',
    source: ''
};
exports.SUSPEND_BRANCH_FAILED = {
    statusCode: 1505,
    error: 'SUSPEND_BRANCH_FAILED',
    source: ''
};
exports.EMAIL_ALREADY_EXISTS = {
    statusCode: 1510,
    error: 'EMAIL_ALREADY_EXISTS',
    source: ''
};
exports.NOT_FOUND_BRANCH_QUEUE_SETTINGS = {
    statusCode: 160404,
    error: 'NOT_FOUND_BRANCH_QUEUE_SETTINGS',
    source: ''
};
exports.BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS = {
    statusCode: 160400,
    error: 'BAD_REQUEST_UPDATE_BRANCH_QUEUE_SETTINGS',
    source: '** requestBody {features:array, hideCustomerNameField:boolean, ' +
        'hideMobileNumberField:boolean, autoSms:boolean, queuesAway:number, queueTags=array}'
};
exports.BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS = {
    statusCode: 161400,
    error: 'BAD_REQUEST_UPDATE_BRANCH_ADVERTISEMENT_SETTINGS',
    source: '** requestBody {enableCustomQr:boolean, imagePreviewDuration:number, ' +
        'customQrLink:string, adsToDelete:array<string>'
};
exports.NOT_FOUND_QUEUE_TAGS = {
    statusCode: 161404,
    error: 'NOT_FOUND_QUEUE_TAGS',
    source: ''
};
exports.NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS = {
    statusCode: 163404,
    error: 'NOT_FOUND_BRANCH_ADVERTISEMENT_SETTINGS',
    source: ''
};
exports.BAD_REQUEST_BRANCH_ADVERTISEMENT_SETTINGS = {
    statusCode: 163400,
    error: 'BAD_REQUEST_BRANCH_ADVERTISEMENT_SETTINGS',
    source: '** requestBody {enableCustomQr=boolean, customQrLink=string, imagePreviewDuration=number,' +
        'gallery=array}'
};
