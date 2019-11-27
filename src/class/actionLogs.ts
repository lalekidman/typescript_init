import axios from 'axios'

export interface IActionBy {
  _id: string
  firstName: string
  lastName: string
  jobTitle?: string
  roleLevel?: number
  avatarUrl: string
}

export interface INewGeneralLog {
  collectionName: string
  platform: string
  branchId?: string
  oldData: any
  newData: any
  actionBy: IActionBy
  actionType: number
  module: string
  eventSummary: string
}

class Logs {
  private urlPrefix: string

  constructor() {
    this.urlPrefix = `http://${process.env.LOGGER_SERVICE_HOST}`
  }

  /**
   * create new log
   */
  public save(data: INewGeneralLog) {
    return new Promise((resolve, reject) => {
      axios.post(`${this.urlPrefix}/general-logs`, data)
      .then((response) => {
        console.log(response.data)
        resolve(response.data)
      })
      .catch((error) => {
        reject(error.response.data)
      })
    })
  }
}

export default new Logs()