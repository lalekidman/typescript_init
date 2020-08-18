// import MessageBroker from '../class/message-broker'
// import { KAFKA_HOST, ORDER_TOPIC_STATES } from '../utils/constants'
// import Orders from '../class/order'
// class EventPublisher {
//   /**
//    * @class
//    */
//   private Broker: MessageBroker
//   constructor(Broker: MessageBroker) {
//     this.Broker = Broker
//     // this.Broker.initializeTopicOptions([
//     //   {
//     //     partitions: 0,
//     //     replicationFactor: 0,
//     //     topic: ORDER_TOPIC_STATES.CREATED
//     //   },
//     //   {
//     //     partitions: 0,
//     //     replicationFactor: 0,
//     //     topic: ORDER_TOPIC_STATES.REJECTED
//     //   },
//     // ])
//   }
//   public publish () {
//     // stream per service
//     Orders.stateDidChangedListener((state, data, key) => {
//       if (state === ORDER_TOPIC_STATES.REJECTED) {
//          // send another action or data.
//         this.Broker.publish({topic: <string>state, key, messages: data})
//       } else {
//         this.Broker.publish({topic: <string>state, key, messages: data})
//       }
//     })
//   }
// }
// export default EventPublisher