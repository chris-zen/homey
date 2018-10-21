import { currentTimestampSecs } from './helpers'

import logging from './logging'

const logger = logging(__filename)

/**
 * A thermostat to control a heater according to the sensors readings and the user preferrences.
 */
export default class Thermostat {
  // Modes

  static PRESET_MODE = 'preset';

  static CUSTOM_MODE = 'custom';

  // Presets

  static COMFORT_PRESET = 'comfort';

  static ENERGY_SAVING_PRESET = 'energySaving';

  static FROST_PROTECTION_PRESET = 'frostProtection';

  // Sensor names

  static TEMPERATURE_SENSOR_NAME = 'temperature';

  static HUMIDITY_SENSOR_NAME = 'humidity';

  // Max time allowed since the last sensor update for it to be still valid

  static MAX_SENSOR_READING_AGE = 5 * 60.0;

  // Temperature limits

  minTargetTemperature = 0;

  maxTargetTemperature = 36;

  /**
   * Create a new Thermostat.
   *
   * @param {SensorsDevice} sensors The interface to the sensors devices
   * @param {HeaterDevice} heater The interface to the heater device
   * @param {Object} config The thermostat configuration:
   *                        - hysteresisUp
   *                        - hysteresisDown
   *                        - temperaturePresets
   *                        - referenceDevice
   */
  constructor (sensors, heater, config) {
    this.sensors = sensors
    this.heater = heater
    this.config = config
    this.listeners = {
      sensors: [],
      heater: [],
      thermostat: []
    }

    this.mode = Thermostat.PRESET_MODE
    this.selectedPreset = Thermostat.COMFORT_PRESET
    this.customTargetTemperature = undefined
    this.referenceDevice = this.config.referenceDevice
    this.referenceSensors = {}

    this.sensors.onUpdate(this.sensorsUpdated)
    this.heater.onUpdate(this.heaterUpdated)

    this.interval = setInterval(this.update, config.updateIntervalMs)
  }

  /**
   * Add a listener for new sensor readings.
   *
   * @param {(name, value) => any} listener Listener for new sensor readings
   */
  onSensorsUpdate (listener) {
    this.listeners.sensors.push(listener)
  }

  /**
   * Add a listener for heater state changes.
   *
   * @param {(name, value) => any} listener Listener for new sensor readings
   */
  onHeaterUpdate (listener) {
    this.listeners.heater.push(listener)
  }

  /**
   * Add a listener for thermostat state changes.
   *
   * @param {(name, value) => any} listener Listener for new sensor readings
   */
  onUpdate (listener) {
    this.listeners.thermostat.push(listener)
  }

  /**
   * Handle sensors update and notify listeners.
   */
  sensorsUpdated = (device, sensors) => {
    if (device === this.referenceDevice) {
      logger(`Sensors updated for ${device}: ${JSON.stringify(sensors)}`)
      for (const [name, value] of Object.entries(sensors)) {
        this.referenceSensors[name] = {
          timestamp: currentTimestampSecs(),
          value
        }
        this.listeners.sensors.forEach(listener => listener(name, value))
      }
    }
  }

  /**
   * Handle heater update and notify listeners.
   */
  heaterUpdated = (status) => {
    logger(status)
    // TODO
  }

  /**
   * Update the thermostat status according to the current conditions and the user preferrences.
   */
  update = () => {
    logger('Updating state ...')
    const temperatureSensor = this.referenceSensors[Thermostat.TEMPERATURE_SENSOR_NAME]
    if (temperatureSensor === undefined) {
      logger('No temperature sensor received yet')
      return
    }

    const sensorReadingAge = currentTimestampSecs() - temperatureSensor.timestamp
    if (sensorReadingAge <= Thermostat.MAX_SENSOR_READING_AGE) {
      const referenceTemperature = temperatureSensor.value
      const targetTemperature = this.getTargetTemperature()
      const upThreshold = targetTemperature + this.config.hysteresisUp
      const downThreshold = targetTemperature - this.config.hysteresisDown

      if (referenceTemperature >= upThreshold) {
        logger(`Temperature ${referenceTemperature} is above thresholds [${downThreshold}, ${upThreshold}]`)
        this.heater.off()
      } else if (referenceTemperature <= downThreshold) {
        logger(`Temperature ${referenceTemperature} is below thresholds [${downThreshold}, ${upThreshold}]`)
        this.heater.on()
      } else {
        logger(`Temperature ${referenceTemperature} is within thresholds [${downThreshold}, ${upThreshold}]`)
        this.heater.keep()
      }
    } else {
      logger(`Sensor readings for temperature are too old: ${sensorReadingAge.toFixed(0)} s`)
      this.heater.off()
    }
  }

  /**
   * Get mode.
   */
  getMode () {
    switch (this.mode) {
      case Thermostat.CUSTOM_MODE:
        return Thermostat.CUSTOM_MODE

      case Thermostat.PRESET_MODE:
        return this.selectedPreset

      default:
        return undefined
    }
  }

  /**
   * Get target temperature.
   */
  getTargetTemperature () {
    switch (this.mode) {
      case Thermostat.CUSTOM_MODE:
        return this.customTargetTemperature

      case Thermostat.PRESET_MODE:
        return this.config.temperaturePresets[this.selectedPreset]

      default:
        logger(`Unexpected mode: ${JSON.stringify(this.mode)}`)
        return undefined
    }
  }

  /**
   * Set target temperature.
   *
   * @param {string | number} target Either a number representing the new target temperature,
   *                                 or an Object containing the temperature preset to use like {preset: "name"}.
   */
  setTargetTemperature (target) {
    switch (typeof target) {
      case 'number':
        this.mode = Thermostat.CUSTOM_MODE
        this.customTargetTemperature = target
        logger(`Custom target temperature changed to ${target}`)
        return target

      case 'object': {
        if (target.preset !== undefined) {
          if (target.preset === 'custom') {
            this.mode = Thermostat.CUSTOM_MODE
            return this.customTargetTemperature
          }
          const presetTemp = this.config.temperaturePresets[target.preset]
          if (presetTemp !== undefined) {
            this.mode = Thermostat.PRESET_MODE
            this.selectedPreset = target.preset
            logger(`Target temperature changed to ${presetTemp} from preset ${target.preset}`)
            return presetTemp
          }
        }
        const expectedPresets = Object.keys(this.config.temperaturePresets)
        logger(`Unknown preset: ${JSON.stringify(target)}. Expected on of: ${expectedPresets}`)
        return this.getTargetTemperature()
      }

      default:
        logger(`Unexpected parameter type ${typeof target} for ${target}`)
        return this.getTargetTemperature()
    }

    // TODO send update to MQTT
  }
}
