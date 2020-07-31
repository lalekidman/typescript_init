import MessageBroker from "../class/message-broker"
import { KAFKA_HOST } from "../utils/constants"
const STATES = {
  SAMPLE_STATE:'SAMPLE_STATE_ONE',
  SAMPLE_STATE_TWO:'SAMPLE_STATE_TWO'
}
class OrderStreamer {
  /**
   * @class
   */
  private Broker: MessageBroker
  private streamersData = <any[]>[]
  constructor () {
    this.Broker = new MessageBroker(KAFKA_HOST)
    this.initializeTopics()
  }

  private initializeTopics () {
    this.Broker.initiateSubscriberGroupOptions([
      STATES.SAMPLE_STATE
    ], {
      groupId: 'SAMPLE_STATE_GROUP_ID',
      autoCommit: false,
      fromOffset: 'earliest',
      fetchMaxBytes: 1024 * 1024
    }, (err, listenedTopics) => {
      if (err) {
        throw err
      }
    })
    this.Broker.setCommitTimeout(2500)
  }
  public stream () {
    this.Broker.subscribe((error, message: any) => {
      const {topic, value} = message
      const {newData, localStreamId = ''} = value
      // CLASS INHERITED QUERIES
      const _Order = new Order()
      console.log(' >>> received new message on ', topic)
      if (topic === STATES.SAMPLE_STATE) {
        _Order.connectTransactionStream({
          streamId: localStreamId,
          message,
          failedEvents: [
           // FAILED EVENTS OR TOPIC E.G(SAMPLE_STATE_FAILED)
          ],
          successEvents: [
           // SUCCESS EVENTS OR TOPIC E.G(SAMPLE_STATE_SUCCESS)
          ]
        })
      } else {
        _Order.watchTransactionStream(localStreamId, message)
          .then(async (response) => {
            if (response) {
              const {messages, isFinished, isSuccess} = response
              if (isFinished) {
                return _Order.updateState(newData._id, isSuccess ? ORDER_STATES.COMPLETED : ORDER_STATES.REJECTED, message)
                  .then(() => {
                    for (let index in messages) {
                      this.Broker.commit(messages[index], (err, commited) => {
                        if (err) {
                          console.log('something error on commiting message.')
                          return
                        }
                        console.log('xcommited...')
                      })
                    }
                  })
                  .catch((err) => {
                    console.log(' >>> update order state failed. Error: ', err)
                  })
              }
            }
            return true
          })
      }
    })
  }
} 
export default SampleStreamer