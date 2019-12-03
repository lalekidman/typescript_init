import {default as BranchModel, IBranchModel} from '../models/branches'
import {default as BranchSettings, IBranchSettingsModel} from '../models/settings'

import AppError from '../utils/app-error'

import Queries, { IPaginationData } from '../utils/queries'
import actionLogs from './actionLogs'

import * as uuid from 'uuid/v4'

import {FORM_DATA_TYPES, ACCOUNT_ROLE_LEVEL, BRANCH_NOTIFICATION_TYPES, GENERAL_LOGS_ACTION_TYPE, COLLECTION_NAMES} from '../utils/constants'
import * as RC from '../utils/response-codes'

import Partner from './partner'
import Account from './account'
import Settings from './settings'
import {default as KyooToken} from '../utils/token'
import { formDataValidator, ValidateEmail } from '../utils/helper';
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
    return new Partner().findOne(partnerId)
    .catch((err) => {
      console.log('Fetch partner detais failed. Error: ', err.message)
      throw new Error('No partner found.')
    })
    .then(async (partner: any) => {
      const {contacts = [], email, address, avatar, banner, coordinates, about, branchName = '', account, branchId} = data
      const branch = await BranchModel.findOne({
        branchId: data.branchId.toString().trim(),
        partnerId: partnerId.toString().trim()
      })
      if (branch) {
        throw new Error('BranchId is already existed to this partner.')
      }
      //get the isPrimary = true on contactList
      //##DEVNOTE: checking its variable type to make sure
      //##DEVNOTE: formdata convert the boolean value to literal string, e.g. isPrimary: 'true'
      const primaryContactIndex = contacts.findIndex((prop: any) => ((typeof(prop.isPrimary) === 'boolean' && prop.isPrimary === true) || (typeof(prop.isPrimary) === 'string' && prop.isPrimary === 'true')))
      const newBranch = <IBranchModel> this.initilize({
        branchName: branchName.toString(),
        email: email.toString(),
        address: address ? {
          street: address.street.toString(),
          province: address.province.toString(),
          city: address.city.toString(),
          zipcode: address.zipcode.toString(),
        } : {},
        branchId: branchId.toString().trim(),
        partnerId,
        about,
        contacts: contacts.map((contact: any) => (Object.assign(contact, {_id: uuid()}))),
        contactNo: contacts[primaryContactIndex].number,
        location: {
          coordinates: coordinates
        }
      })
      if (!newBranch.branchId) {
        throw new Error('branchId must not be empty or null.')
      } else 
      if (!newBranch.branchName) {
        throw new Error('branchName must not be empty or null.')
      } else if (!newBranch.email) {
        throw new Error('branchName must not be empty or null.')
      } else if (!ValidateEmail(newBranch.email)) {
        throw new Error('Invalid email format.')
      } else if (!newBranch.contactNo) {
        throw new Error('contacts must have atleast 1 primary.')
      }
      // create settings,
      const branchSettings = JSON.parse(JSON.stringify((await new Settings(newBranch._id).save(data))))
      // upload branch avatar
      const branchAvatar = await this.upload(filePath.concat(newBranch._id), avatar)
      // upload branch banner
      const branchBanner = await this.upload(filePath.concat(newBranch._id), banner)
      const {firstName = '', lastName = ''}  = <any> account || {}
      // upload avatar for default account
      const accountAvatar = await this.upload(filePath.concat(newBranch._id), account.avatar)
      await new Account().addAccount(newBranch._id, {
        firstName: firstName.toString(),
        lastName: lastName.toString(),
        roleLevel: ACCOUNT_ROLE_LEVEL.SUPER_ADMIN,
        partnerId: partnerId.toString(),
        email: account ? account.email : '',
        contactNo: contacts[primaryContactIndex].number,
        avatarUrl: accountAvatar.imageUrl
      }, actionBy)
      newBranch.avatarUrl = branchAvatar.imageUrl
      newBranch.bannerUrl = branchBanner.imageUrl
      await newBranch.save()
      // create branch queue settings
      const queueSettingsId = uuid()
      await new QueueSettingsModel({
        _id: queueSettingsId,
        branchId: newBranch._id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }).save()
      return {
        ...JSON.parse(JSON.stringify(newBranch)),
        settings: branchSettings
      }
    })
    .catch(err => {
      console.log('Failed to add branch.\nError: ', err)
      throw err
    })
      // }).then(async () => {
        // return Promise.resolve(DefaultQueueGroups.map((qg: any) => this.QG.save(Object.assign(Object.assign(qg, {businessBranchId: newBranch._id, businessUserId: newBranch._id})))))
      // }).then((queueGroups) => {
      //   return Object.assign(newBranch, {queueGroups})
  }

  /**
   * check branch changes
   */
  private listChanges(oldData: any, newData: any) {
    return new Promise((resolve, reject) => {
      let updates = []
      // check details update
      if (
        oldData.avatarUrl !== newData.avatarUrl ||
        oldData.settings.bannerUrl !== newData.settings.bannerUrl ||
        oldData.categoryId !== newData.categoryId ||
        oldData.about !== newData.about
      ) {
        updates.push(BRANCH_NOTIFICATION_TYPES.BRANCH_DETAILS_UPDATE)
      }
      // check contact details update
      let oldContacts = oldData.contacts.map((data: any) => {
        return {
          isPrimary: data.isPrimary,
          number: data.number,
          type: data.type
        }
      })
      let newContacts = newData.contacts.map((data: any) => {
        return {
          isPrimary: data.isPrimary,
          number: data.number,
          type: data.type
        }
      })
      for (let i in newData.contacts) {
        delete oldData.contacts[i]._id
      }
      if (JSON.stringify(oldContacts) !== JSON.stringify(newContacts) ) {
        updates.push(BRANCH_NOTIFICATION_TYPES.BRANCH_CONTACT_UPDATE)
      }
      // check if ther is an update in social links
      let oldSocialLinks = oldData.settings.socialLinks.map((data: any) => {
        return {
          url: data.url,
          type: data.type
        }
      })
      let newSocialLinks = newData.settings.socialLinks.map((data: any) => {
        return {
          url: data.url,
          type: data.type
        }
      })
      if (JSON.stringify(oldSocialLinks) !== JSON.stringify(newSocialLinks) ) {
        updates.push(BRANCH_NOTIFICATION_TYPES.BRANCH_SOCIAL_LINKS_UPDATE)
      }
      resolve(updates)
    })
  }

  /**
   * edit branch
   */
  public updateBranch(branchId: string, categoryId: string, about: string, branchEmail: string, contactNumbers: Array<IContactList>, socialLinks: Array<SocialLinks>, avatar: any, banner: any, source: string = '', actionBy: any = {}) {
    return new Promise(async (resolve, reject) => {
      const oldDetails = <IBranchModel> (await BranchModel.findOne({_id: branchId}))
      const oldSettings = <IBranchSettingsModel> await BranchSettings.findOne({branchId})
      const oldData = {...oldDetails.toObject(), ...{settings: oldSettings.toObject()}}
      BranchModel.findOne({_id: branchId})
      .then(async (branch: any) => {
        let oldDetails = branch.toObject()
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
            errors.push('banxxxxxxxxxxxxxxxxxxxxxxner upload failed')
          }
        }
        // update banner (model location : Settings model)
        try {
          await BranchModel.findOneAndUpdate(
            {
              _id: branchId
            },
            Object.assign({}, bannerUrl? {bannerUrl} : {}),
            {
              new: true
            }
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
        .then(async (updatedBranch: any) => {
          const newDetails = <IBranchModel> (await BranchModel.findOne({_id: branchId}))
          let newD = newDetails.toObject()
          const newSettings = <IBranchSettingsModel> await BranchSettings.findOne({branchId})
          const newData = {...newD, ...{settings: newSettings.toObject()}}
          const updates = await this.listChanges(oldData, newData)
          // remove _id field from  contacts
          function mapContacts(obj: any) {
            obj.contacts = obj.contacts.map((data: any) => {
              const {isPrimary, number, type} = data
              return {
                isPrimary,
                number,
                type
              }
            })
            return obj
          }
          // log action
          actionLogs.save({
            actionBy,
            actionType: GENERAL_LOGS_ACTION_TYPE.EDIT,
            branchId: branchId,
            collectionName: COLLECTION_NAMES.BRANCH,
            eventSummary: `Branch, ${branch.name}, details has been modified`,
            module: 'Branch Details - Edit Details',
            oldData: mapContacts(oldDetails),
            newData: mapContacts(newD),
            platform: source
          })
          resolve({...updatedBranch.toObject(), ...{socialLinks}, ...{settings}, ...{errors}, ...{updates}})
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