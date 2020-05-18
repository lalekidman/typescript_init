import * as kafka from 'kafka-node'
import {CreateTopicRequest, ConsumerOptions, ConsumerGroupOptions, ConsumerGroupStreamOptions} from 'kafka-node'
import { Schema, model } from 'mongoose'
import { KAFKA_HOST } from '../utils/constants';
import * as uuid from 'uuid/v4'
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
interface IUncommitedTopic {
  topic: string
  commitTimeout: any
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
private subscriptionTopics: string[] = []
private subscriber: kafka.ConsumerGroupStream = <any>{}
// private subscriber: kafka.Consumer|kafka.ConsumerGroupStream = <any>{}
private offset: kafka.Offset = <any>{}
private kafkaClient: kafka.KafkaClient
private kafkaProducer: kafka.Producer
private UncommitedTopics = <IUncommitedTopic[]>[]
private _UncommitedMessage = <any[]>[]
private isCommiting: boolean = false
private kafkaConsumerGroup: kafka.ConsumerGroup = <any>{}
private isSubscribeInitialized: boolean = false
private subscriptionRetriesAllowed: number = 5
private subscriptionRetryTimes: number = 0
private ArrayOfCallbacks = <IArrayOfCallbacks[]>[]
private commitTimeout: any
// default 1 second
private commitDelayMilis: number = 1000

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
  public async initiateSubscriberGroupOptions (topics: string | ISubscriptionOptions | Array<string|ISubscriptionOptions>, config: ConsumerGroupStreamOptions, callback?: ICallback) {
    try {
      if (!(this.isSubscribeInitialized)) {
        //@ts-ignore
        var _topics:Array<string|ISubscriptionOptions> = (((typeof topics === 'string') || !(topics.topic === undefined)) ? [topics] : topics)
        const _options = await this.mapSubscriptionOptions(<string[]|ISubscriptionOptions[]> _topics, config)
        this.subscriptionConfig = config
        // remove autoCommit config
        const {autoCommit, ..._config} = config
        this.subscriptionTopics = _options.map((option: any) => option.topic)
        const ConsumerGroupConfig = <ConsumerGroupStreamOptions>{
          autoCommit: false,
          kafkaHost: this.KafkaHost,
          encoding: 'utf8',
          keyEncoding: 'utf8',
          sessionTimeout: 15000,
          ..._config,
          onRebalance: (status: boolean, rebalance: any) => {
            console.log('Rebalancing....', status)
            if (status) {
              console.log('Rebalanced!')
            }
            rebalance()
          }
        }
        this.subscriber = new kafka.ConsumerGroupStream(ConsumerGroupConfig, this.subscriptionTopics)
        if (ConsumerGroupConfig.fromOffset !== 'latest') {
          for (let x in _options) {
            const option = _options[x]
            this.subscriber.consumerGroup.setOffset(option.topic, option.partition, option.offset || 0)
          }
        }
        this.listenToEvents()
        this.subscriber.on("connect", () => {
          console.log(' >>>> connected.')
          // this.isSubscribeInitialized = true
          // // setTimeout(() => {
          // console.log(' >>> connected to broker! listening to all uncommited message.')
          // this.listenToEvents()
          // }, 1000)
        })
        this.subscriber.on("error", (err) => {
          this._callback(callback, err, null)
        })
        this.subscriber.on("close", () => {
          console.log(' CONNECTION CLOSEEEEE')
          // this._callback(callback, err, null)
        })
        this._callback(callback, null, this.subscriptionTopics)
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
  private async listenToEvents () {
    var x = 0
    console.log('>>>> listen txo events...')
    this.subscriber.on("data", async (message) => {
      try {
        message.value = message.value ? JSON.parse(message.value) : {}
      } catch (err) {
        //ignore
        message.value = message.value.toString()
      }
      this.dispatchCallbacks(message.topic, null, message)
    })
  }
  public async removeStreamerTopics (topics: string|string[], callback: any) {
    this.subscriber.consumerGroup.removeTopics(topics, (err, removed) => {
      callback(removed) 
    })
  }
  public async addStreamerTopics (topics: any[]) {
    this.subscriber.consumerGroup.addTopics(topics, (err, added) => {
      if (err) {
        throw new Error(err)
      }
    })
    this.subscriber.consumerGroup.removeTopics(topics, (err, removed) => {
      if (err) {
        console.log(' >>> err: ', err)
      }
    })
  }
  /**
   * save all events on event logs then commit the messages.
   * @param callback 
   */
  public async commit (message: kafka.Message, callback: ICallback) {
    //this will just allow to commit the last call on this method/function
    // clear or remove the recent call because the delay/timeout call
    var index = this.UncommitedTopics.findIndex((c) => c.topic === message.topic)
    if (index >= 0) {
      clearTimeout(this.UncommitedTopics[index].commitTimeout)
    } else {
      this.UncommitedTopics.push({
        commitTimeout: 0,
        topic: message.topic
      })
      index = this.UncommitedTopics.length - 1
    }
    this.UncommitedTopics[index].commitTimeout = setTimeout(() => {
      console.log(' >>> will commit key -> ', message.key)
      this.subscriber.commit(message, false, (err: Error, data: any) => {
        if (err) {
          console.log('failed to commit: ', err)
        } else {
          console.log(' >>> did commit key -> ', message.key)
          this._callback(callback, err, message.key)
        }
      })
    }, this.commitDelayMilis)
  }
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
        this._callback(_callback.callback, err, data)
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
      try {
        payload.messages = <any>JSON.stringify(payload.messages)
      } catch (err) {
        payload.messages.toString()
        // continue
      }
      if (!payload.key) {
        payload.key = uuid()
      }
      payloads[index] = payload
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
    this.ArrayOfCallbacks.push({
      topic: _event,
      callback: _callback
    })
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
  /**
   * set the delay or timeout value before commit is proceed
   * @param delay // milis
   */
  public setCommitTimeout (delay: number) {
    if (delay < 0) {
      throw new Error(`commitDelayMilis must be greater than 0 miliseconds.`)
    }
    return this.commitDelayMilis = delay
  }
}
