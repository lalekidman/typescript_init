export enum FORM_DATA_TYPES {
  STRING = 1,
  NUMBER = 2,
  ARRAY = 3,
  ANY = 4,
  BOOLEAN = 5
}
export enum BRANCH_MODULES {
  QUEUE = 5,
  RESERVATION = 6
}
export enum ACCOUNT_ROLE_LEVEL {
  SUPER_ADMIN = 0,
  ADMIN = 1
}

export const FEATURES = [
  {
    "key": 1,
    "value": 'Enable Skip Queue Function'
  },
  {
    "key": 2,
    "value": 'Enable Return Queue Function'
  },
  {
    "key": 3,
    "value": 'Send SMS to customer when Notify is tapped/clicked'
  }
]

export const LINK_TYPES = ["facebook", "instagram", "company"]

export const CONTACT_NUMBER_TYPES = ["landline", "mobile"]

export const BRANCH_NOTIFICATION_TYPES = {
  CUSTOMER_RATE_INCREASE: 16,
  CUSTOMER_RATE_DECREASE: 17,
  QUEUE_SETTINGS_UPDATE: 25,
  ADVERTISEMENT_SETTINGS_UPDATE: 26,
  ADDRESS_UPDATE: 27,
  OPERATION_HOURS_UPDATE: 28,
  BRANCH_DETAILS_UPDATE: 29,
  BRANCH_CONTACT_UPDATE: 30,
  BRANCH_SOCIAL_LINKS_UPDATE: 31
}