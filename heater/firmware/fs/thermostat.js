load('api_log.js');
load('api_timer.js');

let Thermostat = {

  // Target temperature operation modes
  CUSTOM_MODE: 'custom',
  PRESET_MODE: 'preset',

  // Available presets
  COMFORT_PRESET: 'comfort',
  ENERGY_SAVING_PRESET: 'energySaving',
  FROST_PROTECTION_PRESET: 'frostProtection',

  // Max allowed age for a sensor reading in seconds
  MAX_SENSOR_READING_AGE: 5 * 60.0,

  // Create a Thermostat object
  //
  // heater: A Heater object that will be used whenever the heater needs to be actioned or
  //         its state be consulted.
  // hysteresisUp: hysteresis added to the target temperature for calculating switch on threshold.
  // hysteresisDown: hysteresis substracted from the target temperature for calculating switch off threshold.
  // temperaturePressets: temperature pressets (comfort, energySaving, frostProtection)
  // Return: the new Thermostat instance.
  create: function(heater, hysteresisUp, hysteresisDown, temperaturePresets) {
    let obj = Object.create(Thermostat._proto);
    obj.heater = heater;
    obj.mode = Thermostat.PRESET_MODE;
    obj.selectedPreset = Thermostat.ENERGY_SAVING_PRESET;
    obj.customTargetTemperature = undefined;
    obj.hysteresisUp = hysteresisUp;
    obj.hysteresisDown = hysteresisDown;
    obj.temperaturePresets = temperaturePresets;
    obj.sensors = {};
    obj.sensorsTimestamp = {};

    Log.info("Create: " + JSON.stringify(obj));
    
    return obj;
  },

  _assign: function(originalValue, newValue) {
    return newValue !== undefined ? newValue : originalValue;
  },

  _proto: {
    // Set new values for sensors. It doesn't delete previous sensors if not defined.
    // Return: updated sensors state.
    updateSensors: function(sensors) {
      if (sensors.internalTemperature !== undefined) {
        this.sensors.internalTemperature = sensors.internalTemperature;
        this.sensorsTimestamp.internalTemperature = Timer.now();
      }
      if (sensors.externalTemperature !== undefined) {
        this.sensors.externalTemperature = sensors.externalTemperature;
        this.sensorsTimestamp.externalTemperature = Timer.now();
      }
      return this.sensors;
    },

    // Invoked whenever the thermostat controller needs to be updated.
    updateController: function() {
      let internalTemperature = this.sensors.internalTemperature;
      let sensorReadingAge = Timer.now() - (this.sensorsTimestamp.internalTemperature || 0.0);
      if (internalTemperature !== undefined && sensorReadingAge <= Thermostat.MAX_SENSOR_READING_AGE) {
        let targetTemperature = this.getTargetTemperature();
        let upThreshold = targetTemperature + this.hysteresisUp;
        let downThreshold = targetTemperature - this.hysteresisDown;
        Log.info("Temperature: " + JSON.stringify(internalTemperature) +
                ", Thresholds: (" + JSON.stringify(downThreshold) + ", " + JSON.stringify(upThreshold) + "]");

        if (internalTemperature > upThreshold) {
          this.heater.switchOff();
        }
        else if (internalTemperature <= downThreshold) {
          this.heater.switchOn();
        }
      }
      else {
        Log.warn("Sensor readings for internal temperature not received or too old");
        this.heater.switchOff();
      }
    },

    getTargetTemperature: function() {
      if (this.mode === Thermostat.CUSTOM_MODE) {
        return this.customTargetTemperature;
      }
      else if (this.mode === Thermostat.PRESET_MODE) {
        return this.temperaturePresets[this.selectedPreset];
      }

      Log.console.error("Unexpected mode: " + JSON.stringify(this.mode));
      return undefined;
    },

    setTargetTemperature: function(targetTemp) {
      if (typeof(targetTemp) === "number") {
        this.mode = Thermostat.CUSTOM_MODE;
        this.customTargetTemperature = targetTemp;
        return targetTemp;
      }
      else if (typeof(targetTemp) === "object") {
        let presetTemp = this.temperaturePresets[targetTemp.preset];
        if (presetTemp !== undefined) {
          this.mode = Thermostat.PRESET_MODE;
          this.selectedPreset = targetTemp.preset;
          return presetTemp;
        }
      }

      Log.error("Unknown preset: " + JSON.stringify(targetTemp));
      return this.getTargetTemperature();
    },

    updateTemperaturePresets: function(presets) {
      if (presets.comfort !== undefined) {
        this.temperaturePresets.comfort = presets.comfort;
      }
      if (presets.energySaving !== undefined) {
        this.temperaturePresets.energySaving = presets.energySaving;
      }
      if (presets.frostProtection !== undefined) {
        this.temperaturePresets.frostProtection = presets.frostProtection;
      }
      return this.temperaturePresets;
    }
  }
};
