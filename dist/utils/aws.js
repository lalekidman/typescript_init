"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");
const fs = require("fs");
class Uploader {
    // @ts-ignore
    constructor(bucketName = process.env.S3_BUCKET_NAME) {
        this.BucketName = bucketName;
        this._init();
    }
    _init() {
        const awsConfig = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_KEY_ID || '',
            Bucket: this.BucketName
        };
        this.s3Sdk = new AWS.S3(awsConfig);
        this.s3Uploader = new S3(awsConfig);
    }
    setBucketName(bucketName) {
        this.BucketName = bucketName;
        this._init();
        return this.BucketName;
    }
    upload(filepath, avatar, ACL = 'public-read') {
        const fileLoc = `${filepath}/${avatar.originalFilename}`;
        const stream = fs.createReadStream(avatar.path);
        const obj = {
            Bucket: this.BucketName,
            Key: fileLoc,
            Body: stream,
            ContentType: avatar.type,
            ACL
        };
        return new Promise((resolve, reject) => {
            this.s3Uploader.upload(obj, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    const { Location: imageUrl = '' } = data;
                    resolve({
                        avatarUrl: imageUrl,
                        fileName: avatar.originalFilename,
                        imageUrl: imageUrl
                    });
                }
                fs.unlink(avatar.path, (err) => {
                    if (err)
                        console.log('err: ', err);
                });
            });
        });
    }
    multiUpload(filepath, files, ACL = 'public-read') {
        const obj = files.map(image => this.upload(filepath, image, ACL));
        return Promise.all(obj);
    }
    deleteFile(file) {
        return new Promise((resolve, reject) => {
            const params = { Bucket: this.BucketName, Key: file };
            this.s3Sdk.deleteObject(params, (error, data) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                resolve(data);
            });
        });
    }
}
exports.default = Uploader;
