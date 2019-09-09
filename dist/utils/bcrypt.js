"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const saltRounds = 15;
exports.hash = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (!err) {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (!err) {
                        return resolve(hash);
                    }
                    return reject(err);
                });
            }
            else {
                return reject(err);
            }
        });
    });
};
exports.compare = (password, hashPassword) => bcrypt.compare(password, hashPassword);
exports.compareSync = (password, hashPassword) => bcrypt.compareSync(password, hashPassword);
class Bcrypt {
    constructor(saltRound) {
        this.saltRound = 15;
        if (saltRound) {
            this.saltRound = saltRound;
        }
    }
    hash(password) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(this.saltRound, (err, salt) => {
                if (!err) {
                    bcrypt.hash(password, this.saltRound, (err, hash) => {
                        if (!err) {
                            return resolve(hash);
                        }
                        return reject(err);
                    });
                }
                else {
                    return reject(err);
                }
            });
        });
    }
    compareSync(password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword);
    }
}
exports.default = Bcrypt;
