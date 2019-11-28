import {default as BranchModel, IBranchModel} from '../models/branches'
import {default as BranchSettings, IBranchSettingsModel} from '../models/settings'

import AppError from '../utils/app-error'

import Queries, { IPaginationData } from '../utils/queries'

import * as uuid from 'uuid/v4'

import {FORM_DATA_TYPES, ACCOUNT_ROLE_LEVEL} from '../utils/constants'
import * as RC from '../utils/response-codes'

import Partner from './partner'
import Account from './account'
import Settings from './settings'
import {default as KyooToken} from '../utils/token'
import { formDataValidator } from '../utils/helper';
import QueueSettingsModel, {IQueueSettingsModel} from '../models/queue-settings'
import { IContactList } from '../interfaces/branches';
import { SocialLinks } from '../interfaces/settings';

export {IBranchModel}
const filePath = 'avatars/branches/'
interface IBranchFilter extends IPaginationData {
  partnerId?: string
  branchIds?: any
}
export default class BusinessBranches extends Queries {
  // public KT: KyooToken
  public ModelInterface: any
  constructor () {
    super(BranchModel)
  }
  /**
   * form data that validates the submitted data.
   */
  private formDataValidation = (data: any) => {
    const {name, branchName, email, address, contacts = [], about} = data
    return formDataValidator([
      {
        fieldName: 'name',
        type: FORM_DATA_TYPES.STRING,
        value: name
      },
      {
        fieldName: 'email',
        type: FORM_DATA_TYPES.STRING,
        value: email
      },
      {
        fieldName: 'branchName',
        type: FORM_DATA_TYPES.STRING,
        value: branchName
      },
      {
        fieldName: 'about',
        type: FORM_DATA_TYPES.STRING,
        value: about
      },
      {
        fieldName: 'contacts',
        type: FORM_DATA_TYPES.ARRAY,
        value: contacts
      },
      {
        fieldName: 'address',
        type: FORM_DATA_TYPES.ANY,
        value: address
      },
    ])
  }
  /**
   * add new branch
   * @param partnerId 
   * @param data 
   */
  //@ts-ignore
  public save (partnerId: string, data: any, actionBy: any) {
    return this.formDataValidation(data)
      .then(() => {
        const {contacts = [], email, address, avatar, coordinates, about} = data
        // return BranchModel.find({
        //   email
        // })
        // .sort({
        //   createdAt: -1
        // })
        // .then(branch => {
          // if (!branch.length) {
            return new Partner().findOne(partnerId)
            .catch((err) => {
              console.log('Fetch partner detais failed. Error: ', err.message)
              throw new Error('No partner found.')
            })
          // } else {
          //   throw new AppError(RC.EMAIL_ALREADY_EXISTS, 'email you input is already exists to our database.')
          // }
        // })
        .then(async (partner: any) => {
          const primaryContactIndex = contacts.findIndex((prop: any) => (prop.isPrimary))
          const newBranch = this.initilize(Object.assign(data, {
            email,
            address,
            partnerId,
            about,
            contacts: contacts.map((contact: any) => (Object.assign(contact, {_id: uuid()}))),
            contactNo: contacts[primaryContactIndex].number,
            location: {
              coordinates: coordinates
            }
          }))
          const branchSettings = JSON.parse(JSON.stringify((await new Settings(newBranch._id).save(data))))
          const uploader = await this.upload(filePath.concat(newBranch._id), avatar)
          const adminAccount = await new Account().addAccount(newBranch._id, {
            firstName: 'Super Admin',
            lastName: 'Admin',
            roleLevel: ACCOUNT_ROLE_LEVEL.SUPER_ADMIN,
            partnerId: partnerId.toString(),
            email: email.toString(),
            contactNo: contacts[primaryContactIndex].number
          }, actionBy)
          uploader.imageUrl ? newBranch.avatarUrl = uploader.imageUrl : ''
          newBranch.save()
          // create branch queue settings
          const branchQueueSettings: IQueueSettingsModel = new QueueSettingsModel()
          const queueSettingsId = uuid()
          branchQueueSettings.branchId = newBranch._id
          branchQueueSettings._id = queueSettingsId
          branchQueueSettings.id = queueSettingsId
          branchQueueSettings.save()
          return {
            ...JSON.parse(JSON.stringify(newBranch)),
            settings: branchSettings
          }
      })
      // }).then(async () => {
        // return Promise.resolve(DefaultQueueGroups.map((qg: any) => this.QG.save(Object.assign(Object.assign(qg, {businessBranchId: newBranch._id, businessUserId: newBranch._id})))))
      // }).then((queueGroups) => {
      //   return Object.assign(newBranch, {queueGroups})
    })
  }

  /**
   * edit branch
   */
  public updateBranch(branchId: string, categoryId: string, about: string, branchEmail: string, contactNumbers: Array<IContactList>, socialLinks: Array<SocialLinks>, avatar: any, banner: any) {
    return new Promise((resolve, reject) => {
      BranchModel.findOne({_id: branchId})
      .then(async (branch: any) => {
        let errors: Array<any> = []
        // upload images (avatar and banner)
        let avatarUrl, bannerUrl
        let settings: any
        if (avatar) {
          const s3FolderPathAvatar = `branch/${branchId}/avatar`
          try {
            let avatarUpload = await this.upload(s3FolderPathAvatar, avatar)
            branch.avatarUrl = avatarUpload.imageUrl
          }
          catch (error) {
            errors.push('avatar upload failed')
          }
        }
        if (banner) {
          const s3FolderPathBanner = `branch/${branchId}/banner`
          try {
            let bannerUpload = await this.upload(s3FolderPathBanner, banner)
            bannerUrl = bannerUpload.imageUrl
          }
          catch (error) {
            errors.push('banner upload failed')
          }
        }
        // update banner (model location : Settings model)
        try {
          settings = await BranchSettings.findOneAndUpdate(
            {branchId},
            Object.assign({}, bannerUrl? {bannerUrl} : {}),
            {new: true}
          )
        }
        catch (error) {
          errors.push(error)
        }
        branch.email = branchEmail
        branch.categoryId = categoryId
        branch.about = about
        for (let i in contactNumbers) {
          if (!contactNumbers[i]._id) {
            contactNumbers[i]["_id"] = uuid()
          }
        }
        branch.contacts = contactNumbers
        try {
          let settings: any = await BranchSettings.findOne({branchId})
          for (let i in socialLinks) {
            if (!socialLinks[i].id) {
              socialLinks[i]["id"] = uuid()
            }
            if (socialLinks[i].type === "facebook" || socialLinks[i].type === "instagram") {
              let disected = socialLinks[i].url.split(/\//g)
              socialLinks[i]["url"] = disected[disected.length - 1]
            }
          }
          settings.socialLinks = socialLinks
          settings.save()
        }
        catch (error) {
          return reject(error)
        }
        branch.save()
        .then((updatedBranch: any) => {
          resolve({...updatedBranch.toObject(), ...{socialLinks}, ...{settings}, ...{errors}})
        })
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
      
    })
  }

  public getList (data: IBranchFilter, projection: any = null) {
    const {partnerId = '', branchIds = null} = data
    const searchBranchIds = branchIds ? branchIds.split(',') : []
    const query = <any> [
      {
        $match: partnerId ? {
          partnerId: partnerId.toString().trim()
        }: {}
      },
      {
        $match: branchIds ? {
          _id: {
            $in: searchBranchIds
          }
        } : {}
      }
    ]
    if (projection) {
      query.splice(query.length, 0, {
        $project: projection
      })
    }
    return this.aggregateWithPagination(query, {...data, sortBy: {fieldName: 'branchName', status: 1}}, ['branchName'])
  }
}