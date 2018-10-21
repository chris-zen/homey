import { floatMapper } from './ValueMappers'
import { regexFromTopic } from './helpers'

import logging from './logging'

const logger = logging(__filename)

const knownSensors = {
  t: {
    name: 'temperature',
    mapper: floatMapper(1)
  },
  h: {
    name: 'humidity',
    mapper: floatMapper(0)
  }
}

export default class SensorsDevice {
  constructor (mqttClient, config) {
    this.mqttClient = mqttClient
    this.config = config
    this.listeners = []

    this.topicRegex = regexFromTopic(this.config.topic)

    logger('Initialising MQTT ...')
    mqttClient.on('connect', this.handleConnect)
    mqttClient.on('message', this.handleMessage)
  }

  onUpdate (listener) {
    this.listeners.push(listener)
  }

  handleConnect = () => {
    logger('MQTT connected')
    logger(`Subscribing to ${this.config.topic}`)
    this.mqttClient.subscribe(this.config.topic)
  }

  handleMessage = (topic, message) => {
    if (!this.topicRegex.test(topic)) {
      return
    }

    logger(`MQTT message from ${topic}: ${message.toString()}`)

    const deviceNameStart = topic.lastIndexOf('/')
    if (deviceNameStart === -1) {
      logger(`Unable to extract device name from the topic '${topic}'`)
      return
    }
    const deviceName = topic.substring(deviceNameStart + 1)
    if (deviceName.length === 0) {
      logger(`Empty device name from the topic '${topic}'`)
      return
    }
    const rawData = JSON.parse(message.toString())
    const sensors = {}
    for (const [key, value] of Object.entries(rawData)) {
      if (key in knownSensors && value !== null) {
        const sensor = knownSensors[key]
        sensors[sensor.name] = sensor.mapper(value)
      }
    }
    this.listeners.forEach((listener) => {
      listener(deviceName, sensors)
    })
  }
}
