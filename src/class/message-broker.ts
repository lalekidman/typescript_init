import * as kafka from 'kafka-node'
import {CreateTopicRequest, ConsumerOptions, ConsumerGroupOptions} from 'kafka-node'
import { Schema, model } from 'mongoose'
import { KAFKA_HOST } from '../utils/constants';
import * as uuid from 'uuid/v4'
import EventLogs from './event-logs';
interface IKafka {
  topics?: Array<string | CreateTopicRequest>
  host: string
}
export interface ISubscriptionOptions {
  offset?: number
  topic: string
  partition: number
}
export interface ICallback {
  (error: Error|null, data: any|null) : any
}
interface IArrayOfCallbacks {
  topic: string
  callback: ICallback
}
// type ISubscriptionConfig & Omit<ConsumerOptions, "autoCommit"> 
const 
  Producer = kafka.Producer,
  Consumer = kafka.Consumer,
  ConsumerGroup = kafka.ConsumerGroup,
  HighLevelProducer = kafka.HighLevelProducer;
  // producer = new Producer(client)
interface IPublishMessage {
  newData: any
  previousData? : any
}
interface IPublishData {
  topic: string,
  key?: string,
  messages: IPublishMessage
}
interface IMessageBroker {
  subscribe(event: string, callback: ICallback) : void
  subscribe(callback: ICallback) : void
}
export default class MessageBroker implements IMessageBroker {
private isReady: boolean = false
private topicOptions: Array<CreateTopicRequest> =[]
private subscriptionOptions: Array<ISubscriptionOptions> =[]
private subscriptionConfig: ConsumerOptions|ConsumerGroupOptions = {fromOffset: false, autoCommit: false}
private subscriber: kafka.Consumer|kafka.ConsumerGroup = <any>{}
private offset: kafka.Offset = <any>{}
private kafkaClient: kafka.KafkaClient
private kafkaProducer: kafka.Producer
private UncommitedMessage = <any[]>[]
private _UncommitedMessage = <any[]>[]
private isCommiting: boolean = false
private kafkaConsumerGroup: kafka.ConsumerGroup = <any>{}
private isSubscribeInitialized: boolean = false
private subscriptionRetriesAllowed: number = 5
private subscriptionRetryTimes: number = 0
private ArrayOfCallbacks = <IArrayOfCallbacks[]>[]

private readonly KafkaHost: string
private isTopicsInitialized: boolean = false
  constructor (host: string) {
    this.KafkaHost = host
    this.kafkaClient = new kafka.KafkaClient({kafkaHost: this.KafkaHost}),
    this.kafkaProducer = new Producer(this.kafkaClient),
    this.offset = new kafka.Offset(this.kafkaClient)
    // const admin = new kafka.Admin(this.kafkaClient)
    // admin.listGroups((err, res) => {
    //   console.log('consumerGroups', res);
    // });
    // admin.describeGroups(['ORDER_MESSAGE_BROKER-LISTENER-1'], (err, res) => {
    //   // console.log(JSON.stringify(res,null,1))
    //   // console.log('consumerGroups', res);
    //   // console.log('consumerGroups', res['ORDER_MESSAGE_BROKER-LISTENER-1'].members);
    // });
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
  public async initializeSubscriberOptions (payloads: Array<string|ISubscriptionOptions>, config: ConsumerOptions, callback?: ICallback) {
    try {
      if (!(this.isSubscribeInitialized)) {
        const _options = await this.mapSubscriptionOptions(payloads, config)
        this.subscriptionConfig = config
        // remove autoCommit config
        const {autoCommit, ..._config} = config
        console.log(' >> set new consumer options.')
        this.subscriber = new Consumer(
          this.kafkaClient,
          _options,
          {
            ..._config,
            autoCommit: false,
          }
        )
        this.isSubscribeInitialized = true
        this.listenToEvents()
      }
      this._callback(callback, null, true)
      return true
    } catch (err) {
      this._callback(callback, err, null)
      console.log('ERROR ON subscribing : ', err)
    }
  }
  /**
   * load consumers/topics
   */
  public async initiateSubscriberGroupOptions (topics: string | ISubscriptionOptions | Array<string|ISubscriptionOptions>, config: ConsumerGroupOptions, callback?: ICallback) {
    try {
      if (!(this.isSubscribeInitialized)) {
        //@ts-ignore
        var _topics:Array<string|ISubscriptionOptions> = (((typeof topics === 'string') || !(topics.topic === undefined)) ? [topics] : topics)
        const _options = await this.mapSubscriptionOptions(<string[]|ISubscriptionOptions[]> _topics, config)
        this.subscriptionConfig = config
        // remove autoCommit config
        const {autoCommit, ..._config} = config
        var offset = 0
        // if (config.fromOffset) {
        //   offset = <number>await this.getTheLastOffset(option.topic)
        // }
        // const allTopics = _options.reduce((topics: string[], option: any) => topicsoption.topic)
        const allTopics = _options.map((option: any) => option.topic)
        const ConsumerGroupConfig = <ConsumerGroupOptions>{
          ..._config,
          autoCommit: false,
          fromOffset: 'latest',
          kafkaHost: this.KafkaHost,
          encoding: 'utf8',
          keyEncoding: 'utf8',
          sessionTimeout: 15000,


        }
        this.subscriber = new kafka.ConsumerGroup(ConsumerGroupConfig, allTopics)
        this.subscriber.on("connect", () => {
          this.isSubscribeInitialized = true
          this.listenToEvents()
        })
        this.subscriber.on("error", (err) => {
          this._callback(callback, err, null)
        })
        this.subscriber.on("rebalancing", () => {
          console.log(' rebalancing...')
          // this._callback(callback, err, null)
        })
        this.subscriber.on("rebalanced", () => {
          console.log(' rebalancing done!')
          // this._callback(callback, err, null)
        })
        this.subscriber.on("offsetOutOfRange", (err) => {
          console.log(' invalid offset!')
          this._callback(callback, err, null)
        })
        this._callback(callback, null, allTopics)
      }
      return true
    } catch (err) {
      this._callback(callback, err, null)
      console.log('ERROR ON subscribing : ', err)
    }
  }
  /**
   * listen to all incoming events
   */
  private listenToEvents () {
    this.subscriber.on("message", async (message: any) => {
      try {
        message.value = message.value ? JSON.parse(message.value) : {}
      } catch (err) {
        //ignore
        message.value = message.value.toString()
      }
      if (this.isCommiting) {
        // if commiting then some message is come, add to sub variable
        this._UncommitedMessage.push(message)
      } else {
        this.UncommitedMessage.push(message)
      }
      // dispatch callbacks
      this.dispatchCallbacks(message.topic, null, message.value)
      return true
    })
  }
  /**
   * save all events on event logs then commit the messages.
   * @param callback 
   */
  public async commit (callback: ICallback) {
    this.subscriber.commit(async (err, data) => {
      this._callback(callback, err, data)
      if (!err) {
        console.log(' >> succesxsfully commited data.')
        this.isCommiting = false
        this.UncommitedMessage = []
      } else {
        // remove all event logs if atleast one commit is failed.
        // (await Promise.all(eventLogs.map((event) => event.remove())))
        throw err
      }
    })
  }

  // private getUncommitedMessages (topic: string|string[]) {
  //   return this.
  // }
  /**
   * dispatch match events
   * @param topic event or topic needed to be dispatch
   * @param err 
   * @param data 
   */
  private dispatchCallbacks (topic: string|null = null, err: any, data: any) {
    for (let index in this.ArrayOfCallbacks) {
      const _callback = this.ArrayOfCallbacks[index]
      if (_callback.topic === null || _callback.topic === topic) {
        this._callback(_callback.callback, err, {topic, data})
      }
    }
  }
  /**
   * create the topics
   * @param topics 
   */
  private createTopics (topics: CreateTopicRequest[]) {
    if (this.isTopicsInitialized) {
      // to stop recreating the topic every call/instances
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
      partitions: 0,
      replicationFactor: 0,
      topic: topic.toString().trim()
    } : topic)) : []
  }
  /**
   * map the subscription options
   * @param options 
   */
  private async mapSubscriptionOptions (options: Array<string|ISubscriptionOptions>, config: ConsumerOptions|ConsumerGroupOptions) {
    return this.subscriptionOptions = await Promise.all(options.map(async (option) => {
      if (typeof option === 'string') {
        option = {
          topic: option,
          offset: 0,
          partition: 0
        }
      } else {
        option.offset = option.offset ?? 0
      }
      return option
    }))
  }
  /**
   * 
   * @param payloads 
   * @param callback 
   */
  private async send (payloads: IPublishData[], callback?: any) {
    var delay = <any>0
    if (!this.isReady) {
      console.log(' >> Waiting to connect...')
      clearTimeout(delay)
      delay = setTimeout(() => (this.send(payloads, callback)), 250)
    }
    for (let index in payloads) {
      const payload = payloads[index]
      let newEvent = null
      try {
        newEvent = await new EventLogs()
          .addLogs({
            event: payload.topic,
            newData: payload.messages.newData,
            previousData: payload.messages.previousData
          })
        try {
          payload.messages = <any>JSON.stringify(newEvent.newData)
        } catch (err) {
          payload.messages.toString()
          // continue
        }
        if (!payload.key) {
          payload.key = newEvent._id
        }
        payloads[index] = payload
      } catch (err) {
        if (newEvent) {
          newEvent.remove()
        }
        this._callback(callback, err, payload)
        throw err
      }
    }
    this.kafkaProducer.send(payloads, (err, data) => {
      if (err) {
        console.log(`Unable to send data. Error: `, err)
        console.log('DATA: ', payloads)
        return
      }
      console.log(` >> Successfully send data through topic/s: ${payloads.map((topic) => topic.topic)}`)
      this._callback(callback, err, data)
    });
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public async publish (payload: IPublishData, callback?: any) {
    return this.send([payload], callback)
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public async batchPublish (payloads: IPublishData[], callback?: any) {
    return this.send(payloads, callback)
  }
  /**
   * 
   * @param data 
   *  - topic, where to publish id where the customer will listen/subscribe
   *  - message string or object of data
   */
  public subscribe (event: string | ICallback, callback?: ICallback) {
    var _event = <any> event
    var _callback = <any> callback
    if (typeof event === 'string') {
      _event = event.toString()
      _callback = callback
    } else {
      _event = null
      _callback = event
    }
    if (this.isSubscribeInitialized) {
      console.log(' >> Connected.')
      this.ArrayOfCallbacks.push({
        topic: _event,
        callback: _callback
      })
    } else {
      // still reconnect if the allowed tries is not reached.
      // if (this.subscriptionRetriesAllowed >= this.subscriptionRetryTimes) {
        // this.subscriptionRetryTimes += 1
        console.log(' >>>> reconnecting...')
        setTimeout(() => {
          this.subscribe(event, callback)
        }, 500)
      // } else {
      //   this._callback(_callback, new Error('subscriber options not yet initialized.'), null)
      // }
    }
  }
  /**
   * just a general callback
   * @param callback 
   * @param err 
   * @param data 
   */
  private _callback (callback?: ICallback, err: any = {}, data: any = {}) {
    if (callback) {
      callback(err, data)
    }
    return false
  }
}
