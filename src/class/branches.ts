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
import { IContactList, IAddress, ILocation, ISubscription, IAssignedDevices } from '../interfaces/branches';
import { SocialLinks, IFeaturedAccess } from '../interfaces/settings';

export {IBranchModel}
const filePath = 'avatars/branches/'
interface IBranchFilter extends IPaginationData {
  partnerId?: string
  branchIds?: any
}
interface IBranchData {
  categoryId: string
  about: string
  featuredAccess: IFeaturedAccess
  email: string
  contactNumbers: Array<IContactList>
  socialLinks: Array<SocialLinks>
  avatar: any
  banner: any
  operationHours: any[]
  coordinates: number[]
  isWeeklyOpened: boolean
  address: IAddress
  subscription: ISubscription
  assignedDevices: IAssignedDevices[]
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
  public save (partnerId: string, body: any, actionBy: any) {
    return new Partner().findOne(partnerId)
    .catch((err) => {
      console.log('Fetch partner detais failed. Error: ', err.message)
      throw new Error('No partner found.')
    })
    .then(async (partner: any) => {
      // const {contacts = [], email, address, avatar, banner, coordinates, about, branchName = '', account, branchId, subscription, assignedDevices, data} = body
      const {avatar, banner, data} = body
      const {account, branchId, subscription, assignedDevices, coordinates, about, branchName = '', contactNumbers = [], email, address} = JSON.parse(data)
      const branch = await BranchModel.findOne({
        branchId: branchId.toString().trim(),
        partnerId: partnerId.toString().trim()
      })
      if (branch) {
        throw new Error('BranchId is already existed to this partner.')
      }
      //get the isPrimary = true on contactList
      //##DEVNOTE: checking its variable type to make sure
      //##DEVNOTE: formdata convert the boolean value to literal string, e.g. isPrimary: 'true'
      const primaryContactIndex = contactNumbers.findIndex((prop: any) => ((typeof(prop.isPrimary) === 'boolean' && prop.isPrimary === true) || (typeof(prop.isPrimary) === 'string' && prop.isPrimary === 'true')))
      const {street, province, city, zipcode} = address
      const newBranch = <IBranchModel> this.initilize({
        branchName: branchName,
        email: email,
        address: address ? {
          street: street,
          province: province,
          city: city,
          zipcode: zipcode,
        } : {},
        branchId: branchId,
        partnerId,
        about,
        contacts: contactNumbers.map((contact: any) => (Object.assign(contact, {_id: uuid()}))),
        contactNo: contactNumbers[primaryContactIndex].number,
        location: {
          coordinates: coordinates
        },
        subscription,
        assignedDevices: assignedDevices ? assignedDevices.map((devices: any) => Object.assign(devices, {_id: uuid(), createdAt: Date.now()})) : []
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
      const branchSettings = JSON.parse(JSON.stringify((await new Settings(newBranch._id).save(JSON.parse(data)))))
      const {avatarUrl, bannerUrl} = await this.uploadImages(branchId, {avatar, banner})
      const {firstName = '', lastName = ''}  = <any> account || {}
      // upload avatar for default account
      const accountx = await new Account().addAccount(newBranch._id, {
        firstName: firstName.toString(),
        lastName: lastName.toString(),
        roleLevel: ACCOUNT_ROLE_LEVEL.SUPER_ADMIN,
        partnerId: partnerId.toString(),
        email: account ? account.email : '',
        contactNo: contactNumbers[primaryContactIndex].number,
        avatarUrl,
      }, actionBy)
      newBranch.avatarUrl = avatarUrl
      newBranch.bannerUrl = bannerUrl
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
  public updateBranch(branchId: string, data: IBranchData, source:string = '', actionBy: any = {}) {
    const {avatar, about, banner, email: branchEmail, categoryId, contactNumbers, socialLinks, coordinates, featuredAccess, isWeeklyOpened, operationHours, address, subscription, assignedDevices = []} = data
    return new Promise((resolve, reject) => {
      console.log('############################3UPDATE BRANCH!!!!!!!!')
      BranchModel.findOne({_id: branchId})
      .then(async (branch: any) => {
        let oldDetails = branch.toObject()
        const oldSettings = <IBranchSettingsModel> await BranchSettings.findOne({branchId})
        const oldData = {...oldDetails.toObject(), ...{settings: oldSettings.toObject()}}
        let errors: Array<any> = []
        // upload images (avatar and banner)
        let settings: any
        if (!branch) {
          throw new Error('No branch details found.')
        }
        branch.email = branchEmail
        branch.categoryId = categoryId
        branch.about = about
        branch.contacts = contactNumbers.map((contact) => {
          if (!contact._id) {
            contact._id = uuid()
          }
        })
        const {avatarUrl, bannerUrl} = await this.uploadImages(branchId, {avatar, banner})
        // update banner (model location : Settings model)
        avatarUrl ? branch.avatarUrl = avatarUrl : ''
        bannerUrl ? branch.bannerUrl = bannerUrl : ''
        branch.save()
        this.updateAddress(branchId, address)
        this.updateSubscription(branchId, subscription)
        this.updateAssignedDevices(branchId, assignedDevices)
        try {
          // save branch settings
          settings = await new Settings(branch._id).updateSettings({
            socialLinks: socialLinks,
            coordinates: coordinates,
            featuredAccess,
            isWeeklyOpened,
            operationHours
          })
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
  /**
   * upload banner and avatar image
   * @param branchId 
   * @param param1 
   */
  public async uploadImages (branchId: string, {banner, avatar}: {avatar: any, banner: any}) {
    var photoUrl = <any> {avatarUrl: '', bannerUrl: ''}
    try {
      // upload branch avatar
      const avatarUploaded = await this.upload(filePath.concat(branchId), avatar)
      if (avatarUploaded.imageUrl) {
        photoUrl.avatarUrl = avatarUploaded.imageUrl
      }
    } catch (err) {
      console.log('Failed tyo upload branch avatar.\nError: ', err.message)
    }
    try {
       // upload branch avatar
       const bannerUploaded = await this.upload(filePath.concat(branchId), banner)
       if (bannerUploaded.imageUrl) {
        photoUrl.bannerUrl = bannerUploaded.imageUrl
      }
    } catch (err) {
      console.log('Failed tyo upload branch avatar.\nError: ', err.message)
    }
    return <{avatarUrl: string, bannerUrl: string}>photoUrl
  }
  /**
   * update branch address
   * @param branchId 
   * @param address 
   */
 public updateAddress (branchId: string, address: IAddress) {
   const {city, province, street, zipcode} = address
  return BranchModel.findOneAndUpdate({
    _id: branchId
    },
    {
      address: {
        city: city.toString().trim(),
        province: province.toString().trim(),
        street: street.toString().trim(),
        zipcode: zipcode.toString().trim()
      }
    },
    {
      new: true
    }
  )
  .then((branch: any) => {
    if (!branch) {
      throw new Error('No Branch data found.')
    }
    return branch
  })
 }
 /**
  * update subscription plan
  * @param branchId
  * @param subscription 
  */
  public async updateSubscription (branchId: string, subscription: ISubscription) {
    const {planType = '', SMSRate = 0, amountRate = 0} = subscription || {}
    if (SMSRate < 0) {
      throw new Error('@requestBody->subscription.SMSRate must be greater than 0. (e.g: {SMSRate: 0.5})')
    }
    if (amountRate < 0) {
      throw new Error('@requestBody->subscription.amountRate must be greater than 0. (e.g: {amountRate: 1500})')
    }
    return BranchModel.findOneAndUpdate({
      _id: branchId
      },
      {
        subscription: {
          planType: planType.toString().trim(),
          SMSRate,
          amountRate
        }
      },
      {
        new: true
      }
    )
    .then((branch: any) => {
      if (!branch) {
        throw new Error('No Branch data found.')
      }
      return branch
    })
  }
 /**
  * update assigned devices
  * @param branchId 
  * @param assignedDevices 
  */
 public updateAssignedDevices (branchId: string, assignedDevices: IAssignedDevices[]) {
  return BranchModel.findOneAndUpdate({
    _id: branchId
    },
    {
      // check if _id is existed, if not put uuid data on _id and current time on createdAt
      assigedDevices: assignedDevices.map((devices: any) => devices._id ? devices : Object.assign(devices, {_id: uuid(), createdAt: Date.now()}))
    },
    {
      new: true
    }
  )
  .then((branch: any) => {
    if (!branch) {
      throw new Error('No Branch data found.')
    }
    return branch
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