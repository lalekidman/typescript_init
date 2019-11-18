"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../utils/http");
class Account {
    constructor() {
        this.URL = `http://${process.env.ACCOUNT_SERVICE_HOST}`;
    }
    findOne(branchId) {
        const url = `${this.URL}/${branchId}`;
        return http_1.default({
            url: url,
            method: 'GET'
        });
    }
    addAccount(branchId, data, actionBy) {
        const url = `${this.URL}/${branchId}`;
        return http_1.default({
            url: url,
            data,
            headers: {
                user: JSON.stringify(actionBy)
            },
            method: 'POST'
        });
    }
}
exports.default = Account;
