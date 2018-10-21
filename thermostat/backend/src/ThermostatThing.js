import {
  Property, Thing, Value
} from 'webthing'

import config from './config'
import logging from './logging'

const logger = logging(__filename)

const sensorProperties = {
  temperature: 'referenceTemperature',
  humidity: 'referenceHumidity'
}

export default class ThermostatThing extends Thing {
  constructor (thermostat) {
    super('Thermostat', 'Thermostat', 'Thermostat Thing')

    this.thermostat = thermostat
    thermostat.onSensorsUpdate(this.handleSensors)
    thermostat.onHeaterUpdate(this.handleHeater)
    thermostat.onUpdate(this.handleThermostat)

    this.context = 'http://iotschema.org/'

    if (config.uiHref !== undefined) {
      this.setUiHref(config.uiHref)
    }

    this.addProperty(new Property(this, 'mode',
      new Value(thermostat.getMode(), this.handleModeValue.bind(this)),
      {
        type: 'string',
        enum: [
          'custom',
          'comfort',
          'energySaving',
          'frostProtection'
        ],
        label: 'Mode',
        description: 'Mode'
      }))

    const initialTargetTemperature = thermostat.getTargetTemperature()
    logger('initialTargetTemperature:', initialTargetTemperature)
    this.addProperty(new Property(this, 'targetTemperature',
      new Value(initialTargetTemperature, this.handleTargetTemperatureValue),
      {
        '@context': 'http://iotschema.org/',
        '@type': ['TargetTemperature'],
        type: 'number',
        unit: 'celsius',
        min: thermostat.minTargetTemperature,
        max: thermostat.maxTargetTemperature,
        label: 'Target Temperature',
        description: 'Target Temperature'
      }))

    this.addProperty(new Property(this, 'referenceTemperature',
      new Value(undefined),
      {
        '@context': 'http://iotschema.org/',
        '@type': ['Temperature'],
        type: 'number',
        unit: 'celsius',
        label: 'Temperature',
        description: 'Reference Temperature'
      }))

    this.addProperty(new Property(this, 'referenceHumidity',
      new Value(undefined),
      {
        '@context': 'http://iotschema.org/',
        '@type': ['Humidity'],
        type: 'number',
        unit: 'percent',
        label: 'Humidity',
        description: 'Reference Humidity'
      }))

    // TODO add property for the heater state
  }

  handleSensors = (name, value) => {
    logger(`${name} = ${value}`)
    const propertyName = sensorProperties[name]
    if (propertyName !== undefined) {
      const property = this.findProperty(propertyName)
      if (property !== undefined) {
        property.value.notifyOfExternalUpdate(value)
      }
    }
  }

  handleHeater = (status) => {
    logger('Heater status', status)
    // TODO update property
  }

  handleThermostat = () => {
    logger('handleThermostat')
    // TODO update properties
  }

  handleTargetTemperatureValue = (value) => {
    logger('handleTargetTemperatureValue', value)
    const minTemperature = this.thermostat.minTargetTemperature
    const maxTemperature = this.thermostat.maxTargetTemperature
    if (value < minTemperature || value > maxTemperature) {
      const property = this.findProperty('targetTemperature')
      this.propertyNotify(property)
      throw new Error(`Target temperature ${value} is out of the range [${minTemperature}, ${maxTemperature}]`)
    }
    const prevMode = this.thermostat.getMode()
    this.thermostat.setTargetTemperature(value)
    const mode = this.thermostat.getMode()
    if (prevMode !== mode) {
      const property = this.findProperty('mode')
      property.value.notifyOfExternalUpdate(mode)
    }
  }

  handleModeValue = (mode) => {
    logger('handleModeValue', mode)
    const targetTemperature = this.thermostat.setTargetTemperature({ preset: mode })
    const property = this.findProperty('targetTemperature')
    property.value.notifyOfExternalUpdate(targetTemperature)
  }
}
