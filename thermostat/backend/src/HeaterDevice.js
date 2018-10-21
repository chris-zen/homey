import { regexFromTopic, currentTimestampSecs } from './helpers'

import logging from './logging'

const logger = logging(__filename)

export default class HeaterDevice {
  // ON/OFF states in stringified JSON format
  static ON = '1';
  static OFF = '0';

  constructor (mqttClient, config) {
    this.mqttClient = mqttClient
    this.config = config
    this.listeners = []

    this.statusTopicRegex = regexFromTopic(this.config.statusTopic)

    this.lastState = undefined

    logger('Initialising MQTT ...')
    mqttClient.on('connect', this.handleConnect)
    mqttClient.on('message', this.handleMessage)
  }

  onUpdate (listener) {
    this.listeners.push(listener)
  }

  handleConnect = () => {
    logger('MQTT connected')
    logger(`Subscribing to ${this.config.statusTopic}`)
    this.mqttClient.subscribe(this.config.statusTopic)
  }

  handleMessage = (topic, message) => {
    if (this.statusTopicRegex.test(topic)) {
      logger(`MQTT message from ${topic}: ${message.toString()}`)
      this.status = JSON.parse(message.toString())
      this.statusTimestamp = currentTimestampSecs()
      // this.listeners.forEach((listener) => {
      //   listener({});
      // });
    }
  }

  on () {
    this.lastState = HeaterDevice.ON
    logger(`ON [${this.lastState}]`)
    this.mqttClient.publish(this.config.targetTopic, this.lastState)
  }

  off () {
    this.lastState = HeaterDevice.OFF
    logger(`OFF [${this.lastState}]`)
    this.mqttClient.publish(this.config.targetTopic, this.lastState)
  }

  keep () {
    logger(`KEEP [${this.lastState}]`)
    if (this.lastState !== undefined) {
      this.mqttClient.publish(this.config.targetTopic, this.lastState)
    }
  }
}
