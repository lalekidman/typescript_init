"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const constants_1 = require("./constants");
const app_error_1 = require("./app-error");
const RC = require("./response-codes");
exports.TrimMobileNo = (contactNo) => contactNo.toString().replace(/[^+\d]+/g, "");
exports.ValidateMobileNo = (contactNo) => {
    const newN = contactNo.toString().replace(/ /g, '').replace(/-/g, '');
    const patt = /^(\+639|09|9)\d{9}$/g;
    const txt = newN.toString().match(patt);
    return txt ? txt[0] : null;
};
exports.ValidateEmail = (email) => {
    const pattern = /^\S+@\S+$/;
    return pattern.test(email);
};
/**
 *
 * @param dateFrom startDate
 * @param dateTo endDate
 */
exports.getDateRange = (dateFrom, dateTo) => ({
    dFrom: (new Date(moment(dateFrom || Date.now()).format('YYYY-MM-DD 00:00:00'))).getTime(),
    dTo: (new Date(moment(dateTo || Date.now()).format('YYYY-MM-DD 23:59:59'))).getTime()
});
/**
 *
 * @param searchFields array of fieldName that needed to be search, eg: name, email
 * @param searchText value that needed to be search
 */
exports.generateSearchFields = (searchFields, searchText) => (searchFields.map((field) => ({ [field]: {
        $regex: new RegExp(searchText, 'gi')
    } })));
exports.getClientInfo = (req) => {
    return {
        geoInfo: req.geoInfo || {},
        ip: req.clientIp || '0.0.0.0',
        userId: req.user ? req.user._id : "b7a8823f-41df-4845-ba54-cbb168bfcb28"
    };
};
const FormDataVariableTypes = [
    {
        formType: constants_1.FORM_DATA_TYPES.STRING,
        value: 'string',
    },
    {
        formType: constants_1.FORM_DATA_TYPES.NUMBER,
        value: 'number',
    },
    {
        formType: constants_1.FORM_DATA_TYPES.BOOLEAN,
        value: 'boolean',
    },
    {
        formType: constants_1.FORM_DATA_TYPES.ARRAY,
        value: 'array',
    },
];
exports.formDataValidator = (formdata) => __awaiter(this, void 0, void 0, function* () {
    for (let x = 0; x < formdata.length; x++) {
        FormDataVariableTypes.forEach(v => {
            const dataType = typeof (formdata[x].value);
            if (Array.isArray(formdata[x].value)) {
                if (formdata[x].type !== constants_1.FORM_DATA_TYPES.ARRAY) {
                    throw new app_error_1.default(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a ${v.value}. Detect: array.`);
                }
            }
            else {
                if (formdata[x].type === constants_1.FORM_DATA_TYPES.ARRAY) {
                    throw new app_error_1.default(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a array. Detect: ${dataType}.`);
                }
                else if (formdata[x].type === constants_1.FORM_DATA_TYPES.NUMBER) {
                    if (isNaN(formdata[x].value)) {
                        throw new app_error_1.default(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a number. Detect: ${dataType}.`);
                    }
                }
                else if (formdata[x].type === v.formType && dataType !== v.value) {
                    throw new app_error_1.default(RC.INVALID_VARIABLE_TYPE, `${formdata[x].fieldName} should be a ${v.value}. Detect: ${dataType}.`);
                }
            }
        });
    }
});
