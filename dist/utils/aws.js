"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
class Uploader {
    constructor(bucketName = 'kyoo-test2') {
        this.BucketName = bucketName;
        this._init();
    }
    _init() {
        const awsConfig = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_KEY_ID || '',
            Bucket: this.BucketName
        };
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
}
exports.default = Uploader;
