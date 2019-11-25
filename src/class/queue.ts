import axios from 'axios'

class Queue {
  private urlPrefix: string
  constructor() {
    this.urlPrefix = `http://${process.env.QUEUE_SERVICE_HOST}`
  }

  /**
   * get queues by queueGroupId
   */
  public async getBranchCustomerRates(branchId: string, week1: number, week2: number): Promise<{r1: number, r2: number}> {
    return new Promise(async (resolve, reject) => {
      try {
        const rate1 = await axios.get(`${this.urlPrefix}/${branchId}/dashboard/info/branch/customer-rate?week=${week1}`)
        const rate2 = await axios.get(`${this.urlPrefix}/${branchId}/dashboard/info/branch/customer-rate?week=${week2}`)
        return resolve({
          r1: rate1.data.customerIncreaseRate ? rate1.data.customerIncreaseRate : 0,
          r2: rate2.data.customerIncreaseRate ? rate2.data.customerIncreaseRate : 0
        })
      }
      catch (error) {
        console.log('getBranchCustomerRates error:', error)
        reject(error)
      }
    })
  }

}

export default new Queue()