load('api_config.js');
load('api_log.js');
load('api_rpc.js');
load('api_mqtt.js');

load('heater.js');
load('thermostat.js');

Log.info("Starting controller ...");

// Heater ------------------------------------------------------------------------------------

let driverEnablePin = Cfg.get('app.heater.driver_enable_pin');
let driverInputPin = Cfg.get('app.heater.driver_input_pin');

let heater = Heater.create(driverEnablePin, driverInputPin);

function initHeater() {
  Log.info("Registering RPC handlers for the Heater ...");

  RPC.addHandler('Heater.Set', function(state) {
    if (state === "on") {
      heater.switchOn();
    }
    else if (state === "off") {
      heater.switchOff();
    }
  });

  RPC.addHandler('Heater.On', function() {
    heater.switchOn();
  });

  RPC.addHandler('Heater.Off', function() {
    heater.switchOff();
  });

  RPC.addHandler('Heater.State', function(config) {
    return {on: heater.isOn()};
  });
}

// Thermostat -------------------------------------------------------------------------------

let hysteresisUp = Cfg.get('app.ths.hysteresis_up');
let hysteresisDown = Cfg.get('app.ths.hysteresis_down');
let temperaturePresets = {
  comfort: Cfg.get('app.ths.temperature_presets.comfort'),
  energySaving: Cfg.get('app.ths.temperature_presets.energy_saving'),
  frostProtection: Cfg.get('app.ths.temperature_presets.frost_protection'),
};

let thermostat = Thermostat.create(heater, hysteresisUp, hysteresisDown, temperaturePresets);

function initThermostat() {
  let topicPrefix = Cfg.get('app.mqtt.topic_prefix');
  let internalSensorId = Cfg.get('app.mqtt.internal_sensor_id');
  let internalSensorsTopicName = topicPrefix + '/' + internalSensorId;
  Log.info("Internal sensors MQTT topic: " + internalSensorsTopicName);

  let externalSensorId = Cfg.get('app.mqtt.external_sensor_id');
  let externalSensorsTopicName = topicPrefix + '/' + externalSensorId;
  Log.info("External sensors MQTT topic: " + externalSensorsTopicName);

  MQTT.sub(internalSensorsTopicName, function(conn, topic, msg) {
    Log.info('Topic: ' + topic + ', message: ' + msg);
    let sensors = JSON.parse(msg);
    thermostat.updateSensors({
      internalTemperature: sensors.t
    });
    
    thermostat.updateController();
  }, null);

  MQTT.sub(externalSensorsTopicName, function(conn, topic, msg) {
    Log.info('Topic: ' + topic + ', message: ' + msg);
    let sensors = JSON.parse(msg);
    thermostat.updateSensors({
      externalTemperature: sensors.t
    });
    
    thermostat.updateController();
  }, null);

  RPC.addHandler('Ths.SetTargetTemp', function(targetTemp) {
    thermostat.setTargetTemperature(targetTemp);
    thermostat.updateController();
    return thermostat.getTargetTemperature();
  });

  RPC.addHandler('Ths.GetTargetTemp', function() {
    return thermostat.getTargetTemperature();
  });

  RPC.addHandler('Ths.SetTempPresets', function(presets) {
    thermostat.updateTemperaturePresets(presets);
    thermostat.updateController();
    return thermostat.temperaturePresets;
  });

  RPC.addHandler('Ths.GetTempPresets', function() {
    return thermostat.temperaturePresets;
  });

  RPC.addHandler('Ths.State', function() {
    return thermostat;
  });

  let updatePeriod = Cfg.get('app.ths.update_period_ms');
  Timer.set(updatePeriod, Timer.REPEAT, function(ths) {
    Log.info("Timer: " + JSON.stringify(Timer.now()));
    ths.updateController();
  }, thermostat);
}

// ---------------------------------------------------------------------------------------

initHeater();
initThermostat();
