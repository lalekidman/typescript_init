"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const industry_1 = require("./industry");
class AccountRoute {
    constructor() {
        // initialize redis
        this.app = express_1.Router({ mergeParams: true });
    }
    initializeRoutes() {
        this.app.use('/industry', new industry_1.default().initializeRoutes());
        return this.app;
    }
}
exports.default = AccountRoute;
