import {default as BranchModel, IBranchModel} from '../models/branches'
import AppError from '../utils/app-error'

import Queries from '../utils/queries'

import * as uuid from 'uuid/v4'

import {FORM_DATA_TYPES, ACCOUNT_ROLE_LEVEL} from '../utils/constants'
import * as RC from '../utils/response-codes'

import Partner from './partner'
import Account from './account'
import Settings from './settings'
import {default as KyooToken} from '../utils/token'
import { formDataValidator } from '../utils/helper';
import QueueSettingsModel, {IQueueSettingsModel} from '../models/queue-settings'

export {IBranchModel}
const filePath = 'avatars/branches/'

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
  public save (partnerId: string, data: any) {
    return this.formDataValidation(data)
      .then(() => {
        const {contacts = [], email, address, avatar, coordinates, about} = data
        return BranchModel.find({
          email
        })
        .sort({
          createdAt: -1
        })
        .then(branch => {
          if (!branch.length) {
            return new Partner().findOne(partnerId)
            .catch((err) => {
              console.log('Fetch partner detais failed. Error: ', err.message)
              throw new Error('No partner found.')
            })
          } else {
            throw new AppError(RC.EMAIL_ALREADY_EXISTS, 'email you input is already exists to our database.')
          }
        }).then(async (partner: any) => {
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
          console.log(newBranch)
          const branchSettings = JSON.parse(JSON.stringify((await new Settings(newBranch._id).save(data))))
          const uploader = await this.upload(filePath.concat(newBranch._id), avatar)
          const adminAccount = await new Account().addAccount(newBranch._id, {
            firstName: 'Super Admin',
            lastName: 'Admin',
            roleLevel: ACCOUNT_ROLE_LEVEL.SUPER_ADMIN,
            partnerId: partnerId.toString(),
            email: email.toString(),
            contactNo: contacts[primaryContactIndex].number
          })
          uploader.imageUrl ? newBranch.avatarUrl = uploader.imageUrl : ''
          newBranch.save()
          console.log('rr: ', newBranch)
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
}