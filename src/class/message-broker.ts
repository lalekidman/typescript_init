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
export interface ISubscriptionOptions extends ConsumerOptions{
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
private subscriber: kafka.Consumer = <any>{}
private kafkaClient: kafka.KafkaClient
private kafkaProducer: kafka.Producer
private isSubscribeInitialized: boolean = false
private isTopicsInitialized: boolean = false
  constructor (host: string) {
    // const {host, topics} = data
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
  public initializeTopicOptions (topics?: Array<string | CreateTopicRequest>) {
    this.isTopicsInitialized = false
    this.mapPublisherOptions(topics)
    this.createTopics(this.topicOptions)
  }
  
  /**
   * load consumers/topics
   */
  public async initializeSubscribeOptions (options: Array<string | ISubscriptionOptions>, callback?: any) {
    try {
      if (!(this.isSubscribeInitialized)) {
        const _options = await this.mapSubscriptionOptions(options)
        this.isSubscribeInitialized = true
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
    if (this.isTopicsInitialized) {
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
      this.isTopicsInitialized = true
      console.log(` >> created topic: ${createdTopicsString}.`)
    })
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
  private async mapSubscriptionOptions (options: Array<string|ISubscriptionOptions>) {
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
   * 
   * @param payloads 
   * @param callback 
   */
  private async send (payloads: ISend[], callback?: any) {
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
  public async publish (payload: ISend, callback?: any) {
    return this.send([payload], callback)
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public async batchPublish (payloads: ISend[], callback?: any) {
    return this.send(payloads, callback)
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public subscribe (event: string, callback: any) {
    if (this.isSubscribeInitialized) {
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
          this.subscriber.commit(async (err, data) => {
            if (!err) {
              console.log(' >> successfully commited data.')
              console.log(data)
            } else {
              // remove event log if commit is failed.
              (await newEvent).remove()
            }
          })
          console.log(' >> successfully save new event.')
        } catch (err) {
          console.log(' >> failed to save new event.')
          console.log('ERR: ', err.message)
        }
        if (event === message.topic) {
          callback(null, message)
        }
        return true
      })
    } else {
      callback('subscriber options not yet initialized.', null)
    }
  }
}
