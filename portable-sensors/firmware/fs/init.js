load('api_config.js');
load('api_log.js');
load('api_dht.js');
load('api_mqtt.js');
load('api_timer.js');

Log.info("Starting portable sensors ...");

let dhtPin = Cfg.get('app.pins.dht');
Log.info("DHT Pin: " + JSON.stringify(dhtPin));

let timerPeriod = Cfg.get('app.timer_period');
Log.info("Meassurements period: " + JSON.stringify(timerPeriod));

let mqttTopicPrefix = Cfg.get('app.mqtt.topic_prefix');
let mqttSensorId = Cfg.get('app.mqtt.sensor_id');
let topicName = mqttTopicPrefix + '/' + mqttSensorId;
Log.info("MQTT topic name: " + topicName);

let dht = DHT.create(dhtPin, DHT.DHT22);

function sensorsData() {
  let t = dht.getTemp();
  let h = dht.getHumidity();

  let data = {
    t: !isNaN(t) ? t : null,  // Temperature
    h: !isNaN(h) ? h : null,  // Humidity
    p: null,                  // Barometric pressure
    g: null                   // Gas / VOC / Air-Quality
  };

  return data;
}

Timer.set(timerPeriod, Timer.REPEAT, function() {
  let data = sensorsData();
  let msg = JSON.stringify(data);
  Log.info("Sensor data: " + msg);
  if (data.t !== null) {
    MQTT.pub(topicName, msg);
  }
}, null);
