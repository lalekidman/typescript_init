import axios from 'axios'

class Notification {
  private urlPrefix: string

  constructor() {
    this.urlPrefix = `http://${process.env.NOTIFICATION_SERVICE_HOST}`
  }

  public invokeNotif(branchId: string, customerRates: any, type: number) {
    return new Promise((resolve, reject) => {
      axios.post(`${this.urlPrefix}/${branchId}/generic-notification`, {
        type,
        customerRates
      })
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

export default new Notification()