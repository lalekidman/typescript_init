import MessageBroker from '../class/message-broker'
import { KAFKA_HOST } from '../utils/constants'
class EventPublisher {
  /**
   * @class
   */
  private messageBroker: MessageBroker
  constructor() {
    this.messageBroker = new MessageBroker(KAFKA_HOST)
  }
  public publish () {
    // publish per service
  }
}
export default EventPublisher