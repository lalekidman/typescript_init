import MessageBroker from '../class/message-broker'
import { KAFKA_HOST } from '../utils/constants'
class EventStreamer {
  /**
   * @class
   */
  private messageBroker: MessageBroker
  constructor() {
    this.messageBroker = new MessageBroker(KAFKA_HOST)
  }
  public stream () {
    // stream per service
  }
}
export default EventStreamer