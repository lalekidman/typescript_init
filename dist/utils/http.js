"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const app_error_1 = require("./app-error");
const response_codes_1 = require("./response-codes");
exports.default = (data) => {
    return axios_1.default(data)
        // .then((response: AxiosResponse) => {
        //   const {data, status, statusText} = response
        //   return <AxiosResponse>{data, status, statusText}
        // })
        .catch((err) => {
        if (err.code === 'ECONNREFUSED') {
            // can't reach the ip,
            throw new app_error_1.default(response_codes_1.SERVER_FAILED, err.message);
        }
        else if (err.response.status === 500) {
            //server problem
            throw new app_error_1.default(response_codes_1.SYSTEM_ERROR, err.message);
        }
        else if (err.response.status === 400) {
            throw new app_error_1.default(err.response.data);
        }
        else if (err.response.status === 404) {
            throw new app_error_1.default(response_codes_1.URL_NOT_FOUND, 'Request failed with status code 404');
        }
        else if (err.response.status === 401) {
            throw new app_error_1.default(response_codes_1.UNAUTHORIZED_REQUEST, err.response.data.error);
        }
        else {
            const { message = '', response = {} } = err || {};
            console.log('message: ', message);
            console.log('status: ', response.status);
            console.log('body: ', response.data);
            throw new Error('SYSTEM ERROR');
        }
    });
};
