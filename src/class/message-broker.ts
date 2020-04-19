import * as kafka from 'kafka-node'
import {CreateTopicRequest, ConsumerOptions, ConsumerGroupOptions} from 'kafka-node'
import { Schema, model } from 'mongoose'
import { KAFKA_HOST } from '../utils/constants';
import * as uuid from 'uuid/v4'
import {Document} from 'mongoose'
export interface IEventLogs {
  _id: any
  eventId: string
  event: string
  offset: number
  data: any
  createdAt: number
  updatedAt: number
}
interface IEventLogsModel extends IEventLogs, Document {}
interface IKafka {
  topics?: Array<string | CreateTopicRequest>
  host: string
}
interface IConsumerOptions extends ConsumerOptions{
  offset?: number
  topic: string
}
export const EventLogsObject = {
  _id: {
    type: String,
    default: '',
    required: true
  },
  eventId: {
    type: String,
    default: '',
    required: true
  },
  event: {
    type: String,
    default: '',
    required: true
  },
  offset: {
    type: Number,
    default: -1
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  }
}
const EventLogs = model<IEventLogsModel>('event_logs', new Schema(EventLogsObject))
EventLogs.ensureIndexes({
  offset: -1
})
const 
  Producer = kafka.Producer,
  Consumer = kafka.Consumer,
  HighLevelProducer = kafka.HighLevelProducer;
  // producer = new Producer(client)
interface ISend {
  topic: string,
  key?: string,
  messages: any
}
export default class MessageBroker {
private isReady: boolean = false
private topicOptions: Array<CreateTopicRequest> =[]
private subscriptionOptions: Array<ConsumerOptions | ConsumerGroupOptions> =[]
private subscriber :any
private kafkaClient: kafka.KafkaClient
private kafkaProducer: kafka.Producer
private static isSubscribeInitialized: boolean = false
private static isTopicsInitialized: boolean = false
  constructor (data: IKafka) {
    const {host, topics} = data
    this.kafkaClient = new kafka.KafkaClient({kafkaHost: host}),
    this.kafkaProducer = new Producer(this.kafkaClient),
    this.kafkaProducer.on('ready', () => {
      console.log(' >> Producer is ready.')
      this.isReady = true
    });
  }
  
  /**
   * initialize/create topics
   */
  public initializeTopics (topics?: Array<string | CreateTopicRequest>) {
    MessageBroker.isTopicsInitialized = false
    this.mapPublisherOptions(topics)
    this.createTopics(this.topicOptions)
  }

  private mapPublisherOptions (topics?: Array<string | CreateTopicRequest>) {
    return this.topicOptions = topics ? topics.map((topic) => (typeof topic === 'string' ? {
      partitions: 1,
      replicationFactor: 1,
      topic: topic.toString().trim()
    } : topic)) : []
  }
  /**
   * map the subscription options
   * @param options 
   */
  private async mapSubscriptionOptions (options: Array<string|IConsumerOptions>) {
    return this.subscriptionOptions = await Promise.all(options.map(async (option) => {
      if (typeof option === 'string') {
        option = {
          topic: option,
          offset: 0,
          fromOffset: false,
          encoding: 'utf8',
          keyEncoding: 'utf8'
        }
      } else {
        option.offset = option.offset ?? 0
        if (!(option.offset && option.offset >= 0)) {
          try {
            const broken = await EventLogs.findOne({
              event: option.topic
            })
            .sort({
              offset: -1
            })
            option.offset = broken ? broken.offset : 0
          } catch (err) {
            console.log('failed to get last event')
          }
        }
      }
      return option
    }))
  }
  /**
   * load consumers/topics
   */
  public async initializeSubscriber (options: Array<string | IConsumerOptions>, callback?: any) {
    try {
      if (!(MessageBroker.isSubscribeInitialized)) {
        const _options = await this.mapSubscriptionOptions(options)
        MessageBroker.isSubscribeInitialized = true
        console.log(' >> set new consumer options.')
        this.subscriber = new Consumer(
          this.kafkaClient,
          _options,
          {
              autoCommit: false
          }
        )
      }
      if (callback) {
        callback(true) 
      }
      return true
    } catch (err) {
      console.log('ERROR ON subscribing : ', err)
    }
  }
  private createTopics (topics: CreateTopicRequest[]) {
    if (MessageBroker.isTopicsInitialized) {
      // to stop recreating the topic every call/instances
      console.log(' >> no creating of data.')
      return true
    }
    this.kafkaClient.createTopics(topics, (err, result) => {
      const createdTopicsString = topics.map((topic) => topic.topic).join(",")
      if (err) {
        console.log(` >> Unable to create topics ${createdTopicsString}.`)
        return
      }
      MessageBroker.isTopicsInitialized = true
      console.log(` >> created topic: ${createdTopicsString}.`)
    })
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public async send (payloads: ISend[], callback?: any) {
    var delay = <any>0
    if (!this.isReady) {
      console.log(' >> Waiting to connect...')
      clearTimeout(delay)
      delay = setTimeout(() => (this.send(payloads, callback)), 250)
    }
    payloads = await Promise.all(payloads.map(async (payload) => {
      try {
        payload.messages = JSON.stringify(payload)
      } catch (err) {
        payload.messages.toString()
        // continue
      }
      if (!payload.key) {
        payload.key = uuid()
      } 
      return payload
    }))
    this.kafkaProducer.send(payloads, function (err, data) {
      if (err) {
        console.log(`Unable to send data. Error: `, err)
        console.log('DATA: ', payloads)
        return
      }
      console.log(` >> Successfully send data through topic/s: ${payloads.map((topic) => topic.topic)}`)
      if (callback) {
        callback(err, data)
      }
    });
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public subscribe (event: string, callback: any) {
    this.initializeSubscriber(() => {
      this.subscriber.on("message", async (message: any) => {
        try {
          message.value = message.value ? JSON.parse(message.value) : {}
        } catch (err) {
          //ignore
          message.value = message.value.toString()
        }
        // console.log('message.value: ', message.value)
        try {
          const newEvent = new EventLogs({
            _id: uuid(),
            eventId: message.key.toString(),
            event: message.topic,
            offset: message.offset,
            data: message.value.messages,
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
          .save()
          this.subscriber.commit((err, data) => {
            if (!err) {
              console.log(' >> successfully commited data.')
              console.log(data)
            }
          })
          console.log(' >> successfully save new event.')
        } catch (err) {
          console.log(' >> failed to save new event.')
          console.log('ERR: ', err.message)
        }
        if (event === message.topic) {
          callback(message)
        }
        return true
      })
    })
  }
}
