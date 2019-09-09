"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
class Token {
    constructor(secretKey = 'SAMPLE_DEFAULT_SECRET_KEY_THAT_SHOULD_NOT_BE_SHARED') {
        this.DEFAULT_SECRET_KEY = '';
        this.DEFAULT_PUBLIC_KEY = '';
        this.signOptions = {};
        this.jwt = jwt;
        this.setSecretKey(secretKey);
    }
    setSecretKey(secretKey) {
        return this.DEFAULT_SECRET_KEY = secretKey;
    }
    setPublicKey(publicKey) {
        return this.DEFAULT_PUBLIC_KEY = publicKey;
    }
    setOptions(data = {}) {
        const { subject, issuer, audience } = data;
        return this.signOptions = Object.assign({}, (subject ? { subject } : {}), (audience ? { audience } : {}), (issuer ? { issuer } : {}));
    }
    generate(data, minutes = 5, opt = null) {
        const expiration = minutes ? { expiresIn: (60 * Math.floor(minutes)) } : null;
        const options = Object.assign(opt || {}, expiration || {}, this.signOptions);
        return {
            token: this.jwt.sign(data, this.DEFAULT_SECRET_KEY, options),
            expiration: expiration ? (expiration.expiresIn * 1000) + Date.now() : 0
        };
    }
    verify(token, opt = null) {
        return new Promise((resolve, reject) => {
            const options = Object.assign(opt ? this.setOptions(opt) : this.signOptions);
            this.jwt.verify(token, this.DEFAULT_SECRET_KEY, options, (err, decoded) => {
                if (!err) {
                    resolve(decoded);
                }
                else {
                    reject(err);
                }
            });
        });
    }
}
exports.default = Token;
