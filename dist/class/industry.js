"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../utils/http");
const URL = `http://${process.env.PARTNER_HOST}`;
class Industry {
    findById(industryId) {
        return http_1.default({
            method: 'GET',
            url: `${URL}/settings/industry/${industryId}`,
            headers: {
                ContentType: 'application/json'
            }
        }).then((response) => {
            const { data, status = '', statusText = '' } = response;
            return data.data;
        })
            .catch(() => {
            throw new Error('Failed to fetch industry data.');
        });
    }
}
exports.default = Industry;
