"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FORM_DATA_TYPES;
(function (FORM_DATA_TYPES) {
    FORM_DATA_TYPES[FORM_DATA_TYPES["STRING"] = 1] = "STRING";
    FORM_DATA_TYPES[FORM_DATA_TYPES["NUMBER"] = 2] = "NUMBER";
    FORM_DATA_TYPES[FORM_DATA_TYPES["ARRAY"] = 3] = "ARRAY";
    FORM_DATA_TYPES[FORM_DATA_TYPES["ANY"] = 4] = "ANY";
    FORM_DATA_TYPES[FORM_DATA_TYPES["BOOLEAN"] = 5] = "BOOLEAN";
})(FORM_DATA_TYPES = exports.FORM_DATA_TYPES || (exports.FORM_DATA_TYPES = {}));
var BRANCH_MODULES;
(function (BRANCH_MODULES) {
    BRANCH_MODULES[BRANCH_MODULES["QUEUE"] = 5] = "QUEUE";
    BRANCH_MODULES[BRANCH_MODULES["RESERVATION"] = 6] = "RESERVATION";
})(BRANCH_MODULES = exports.BRANCH_MODULES || (exports.BRANCH_MODULES = {}));
var ACCOUNT_ROLE_LEVEL;
(function (ACCOUNT_ROLE_LEVEL) {
    ACCOUNT_ROLE_LEVEL[ACCOUNT_ROLE_LEVEL["SUPER_ADMIN"] = 1] = "SUPER_ADMIN";
    ACCOUNT_ROLE_LEVEL[ACCOUNT_ROLE_LEVEL["ADMIN"] = 2] = "ADMIN";
})(ACCOUNT_ROLE_LEVEL = exports.ACCOUNT_ROLE_LEVEL || (exports.ACCOUNT_ROLE_LEVEL = {}));
exports.FEATURES = [
    {
        "key": 1,
        "value": 'Enable Skip Queue Function'
    },
    {
        "key": 2,
        "value": 'Enable Return Queue Function'
    },
    {
        "key": 3,
        "value": 'Send SMS to customer when Notify is tapped/clicked'
    }
];
exports.LINK_TYPES = ["facebook", "instagram", "company"];
exports.CONTACT_NUMBER_TYPES = ["landline", "mobile"];
