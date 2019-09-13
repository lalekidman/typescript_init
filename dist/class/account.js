"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../utils/http");
class Account {
    constructor() {
        this.URL = `http://${process.env.ACCOUNT_SERVICE_URL}:3000`;
    }
    findOne(branchId) {
        const url = `${this.URL}/${branchId}`;
        return http_1.default({
            url: url,
            method: 'GET'
        });
    }
    addAccount(branchId, data) {
        const url = `${this.URL}/${branchId}`;
        return http_1.default({
            url: url,
            data,
            method: 'POST'
        });
    }
}
exports.default = Account;
