import express from 'express'
import mqtt from 'mqtt'

import { SingleThing, WebThingServer } from 'webthing'

import config from './config'
import SensorsDevice from './SensorsDevice'
import HeaterDevice from './HeaterDevice'
import Thermostat from './Thermostat'
import ThermostatThing from './ThermostatThing'

import logging from './logging'

const logger = logging(__filename)

function runServer () {
  logger(`Connecting to MQTT url ${config.mqtt.url}`)
  const mqttClient = mqtt.connect(config.mqtt.url)

  const sensorsDevice = new SensorsDevice(mqttClient, config.sensors)

  const heaterDevice = new HeaterDevice(mqttClient, config.heater)

  const thermostat = new Thermostat(sensorsDevice, heaterDevice, config.thermostat)

  const thermostatThing = new ThermostatThing(thermostat)

  const port = process.env.PORT || 9001

  const server = new WebThingServer(new SingleThing(thermostatThing), port)

  server.app.use(express.static('public'))

  process.on('SIGINT', () => {
    server.stop()
    process.exit()
  })

  logger(`Listening on port ${port} ...`)
  server.start()
}

runServer()
