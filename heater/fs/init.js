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

function pubHeaterStatus(status) {
  MQTT.pub(heaterStatusTopic + '/on', JSON.stringify(status.on));
  MQTT.pub(heaterStatusTopic + '/value', JSON.stringify(status.value));
  MQTT.pub(heaterStatusTopic + '/switchAllowed', JSON.stringify(status.switchAllowed));
  MQTT.pub(heaterStatusTopic + '/all', JSON.stringify(status));
}

function initHeater() {
  pubHeaterStatus(heater.status());

  MQTT.sub(heaterTargetTopic, function(conn, topic, msg, heater) {
    Log.info('Topic: ' + topic + ', message: ' + msg);
    let target = JSON.parse(msg);
    heater.switchTarget(target);
    pubHeaterStatus(heater.status());
  }, heater);

  // heater.onUpdate(function(status) {
  //   pubHeaterStatus(status);
  // });

  Timer.set(10000, Timer.REPEAT, function(heater) {
    heater.watchdog();
  }, heater);

  Log.info("Registering RPC handlers for the Heater ...");

  RPC.addHandler('Heater.Set', function(status) {
    if (status === "on" || status === Heater.ON_STATUS) {
      heater.switchOn();
    }
    else if (status === "off" || status === Heater.OFF_STATUS) {
      heater.switchOff();
    }
  });

  RPC.addHandler('Heater.On', function() {
    heater.switchOn();
  });

  RPC.addHandler('Heater.Off', function() {
    heater.switchOff();
  });

  RPC.addHandler('Heater.Status', function(config) {
    return heater.status();
  });
}

// ---------------------------------------------------------------------------------------

initHeater();
