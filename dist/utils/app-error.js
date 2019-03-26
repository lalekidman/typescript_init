"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(data, errMsg) {
        super(`${data.statusCode} - ${data.error}. Source: ${errMsg || data.source}`);
        this.statusCode = data.statusCode;
        this.error = data.error;
        this.source = errMsg || data.source;
    }
}
exports.default = AppError;
