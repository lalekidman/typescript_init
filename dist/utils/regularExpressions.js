"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
exports.validNumber = /^(9)+[0-9]{8}$/;
exports.validLandline = /^(\()[0-9]{2}(\))(\s?)([0-9]{3,4})(-)([0-9]{3,4})$/;
exports.validFbLink = /^(https\:\/\/www\.facebook\.com\/)[a-zA-Z0-9.?=&]+$/;
exports.validInstagramLink = /^(https\:\/\/www\.instagram\.com\/)[a-zA-Z0-9.?=&]+$/;
exports.validUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
