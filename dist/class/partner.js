"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../utils/http");
class Partner {
    constructor() {
    }
    findOne(partnerId) {
        const url = `http://${process.env.PARTNER_SERVICE_URL}:5007/${partnerId}`;
        return http_1.default({
            url: url,
            method: 'GET'
        });
    }
}
exports.default = Partner;
