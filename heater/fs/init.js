load('api_config.js');
load('api_log.js');
load('api_rpc.js');
load('api_mqtt.js');

load('heater.js');

Log.info("Starting controller ...");

// Heater ------------------------------------------------------------------------------------

let driverEnablePin = Cfg.get('app.driver_enable_pin');
let driverInputPin = Cfg.get('app.driver_input_pin');
let minUpdateAgeSec = Cfg.get('app.min_update_age_sec');
let maxTargetAgeSec = Cfg.get('app.max_target_age_sec');

let heater = Heater.create(driverEnablePin, driverInputPin, minUpdateAgeSec, maxTargetAgeSec);

let heaterTargetTopic = Cfg.get('device.id') + '/target';
let heaterStatusTopic = Cfg.get('device.id') + '/status';

function initHeater() {
  let heaterState = heater.isOn() ? Heater.ON_STATE : Heater.OFF_STATE;
  MQTT.pub(heaterStatusTopic, JSON.stringify(heaterState));
  
  MQTT.sub(heaterTargetTopic, function(conn, topic, msg) {
    Log.info('Topic: ' + topic + ', message: ' + msg);
    let target = JSON.parse(msg);
    heater.switchTarget(target);
  }, null);

  heater.onUpdate(function(state) {
    MQTT.pub(heaterStatusTopic, JSON.stringify(state));
  });
  
  Timer.set(10000, Timer.REPEAT, function(heater) {
    heater.watchdog();
  }, heater);

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

// ---------------------------------------------------------------------------------------

initHeater();
