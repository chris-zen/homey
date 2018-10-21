const { env } = process

export default {
  uiHref: env.UI_HREF_URL,
  mqtt: {
    url: env.MQTT_URL || 'mqtt://localhost:1883'
  },
  sensors: {
    topic: env.SENSORS_TOPIC || 'sensors/#'
  },
  heater: {
    targetTopic: env.HEATER_TARGET_TOPIC || 'heater/target',
    statusTopic: env.HEATER_STATUS_TOPIC || 'heater/status'
  },
  thermostat: {
    referenceDevice: env.THS_REFERENCE_DEVICE || 'inside',
    updateIntervalMs: parseInt(env.THS_UPDATE_INTERVAL_MS || 15000),
    hysteresisUp: parseFloat(env.THS_HYSTERESIS_UP || 0),
    hysteresisDown: parseFloat(env.THS_HYSTERESIS_DOWN || 0.5),
    temperaturePresets: {
      comfort: parseFloat(env.THS_COMFORT_PRESET || 24),
      energySaving: parseFloat(env.THS_ENERGY_SAVING_PRESET || 19),
      frostProtection: parseFloat(env.THS_FROST_PROTECTION_PRESET || 12)
    }
  }
}
