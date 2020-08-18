import * as S3 from 'aws-sdk/clients/s3'
import * as fs from 'fs'
import {uploadFiles, UploadedImage} from './interfaces'
interface IInitializeData {
  accessKeyId: string
  secretAccessKey: string
}
class Uploader {
  private BucketName: string
  private s3Uploader: any
  constructor (bucketName:string = 'kyoo-test2') {
    this.BucketName = bucketName
  }
  public _init (data: IInitializeData) {
    const awsConfig = {
      accessKeyId: data.accessKeyId,
      secretAccessKey: data.secretAccessKey,
      Bucket: this.BucketName
    }
    this.s3Uploader = new S3(awsConfig)
  }
  public setBucketName (bucketName: string) {
    this.BucketName = bucketName
    return this.BucketName 
  }
  upload (filepath: string, avatar: uploadFiles, ACL: string = 'public-read') {
    const fileLoc = `${filepath}/${avatar.originalFilename}`
    const stream = fs.createReadStream(avatar.path)
    const obj = {
      Bucket: this.BucketName,
      Key: fileLoc,
      Body: stream,
      ContentType: avatar.type,
      ACL
    }
    return new Promise((resolve, reject) => {
      console.log('Uploading to AWS S3...')
      this.s3Uploader.upload(obj, (err: any, data: any) => {
        if (err) {
          console.log('Failed to upload on AWS S3...\nError: ', err.message)
          reject(err);
        } else {
          console.log('Successfully upload on AWS S3.')
          const {Location: imageUrl = ''} = data
          return resolve(<UploadedImage>{
            avatarUrl: imageUrl,
            fileName: avatar.originalFilename,
            imageUrl: imageUrl
          })
        }
        fs.unlink(avatar.path, (err: any) => {
          if (err) console.log('err: ', err)
        })
      })
    })
  }
  multiUpload (filepath: string, files: uploadFiles[], ACL: string = 'public-read') {
    const obj = files.map(image => this.upload(filepath, image, ACL))
    return Promise.all(obj)
  }
}

export default Uploader