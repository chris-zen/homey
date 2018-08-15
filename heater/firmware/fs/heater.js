load('api_log.js');
load('api_gpio.js');
load('api_timer.js');
load('api_sys.js');

let Heater = {
  ON_LEVEL: 0,
  OFF_LEVEL: 1,

  // Time required for the relay coil to apply the state change
  RELAY_TIME_MS: 10000,

  // Minimum time to wait for applying new state changes to avoid micro-changes in the heater
  MIN_UPDATE_AGE_SEC: 60.0,

  create: function(driverEnablePin, driverInputPin) {
    let obj = Object.create(Heater._proto);
    obj.driverEnablePin = driverEnablePin;
    obj.driverInputPin = driverInputPin;

    Log.info("Create:");
    Log.info("  driverEnablePin: " + JSON.stringify(driverEnablePin));
    Log.info("  driverInputPin: " + JSON.stringify(driverInputPin));

    GPIO.write(driverEnablePin, 0);
    GPIO.set_mode(driverEnablePin, GPIO.MODE_OUTPUT);
    GPIO.set_mode(driverInputPin, GPIO.MODE_OUTPUT);

    obj.switchOff();

    return obj;
  },

  _proto: {
    getLevel: function() {
      return GPIO.read(this.driverInputPin);
    },

    getLabel: function(level) {
      return level === Heater.ON_LEVEL ? "ON" : "OFF";
    },

    isOn: function() {
      return this.getLevel() === Heater.ON_LEVEL;
    },
    
    switchOn: function() {
      this.set(Heater.ON_LEVEL);
    },

    switchOff: function() {
      this.set(Heater.OFF_LEVEL);
    },

    set: function(level) {
      if (this.getLevel() === level) {
        Log.info("Heater already " + this.getLabel(level));
        return;
      }

      let now = Timer.now();
      let updateAge = now - (this.updateTimestamp || - Heater.MIN_UPDATE_AGE_SEC);
      if (updateAge < Heater.MIN_UPDATE_AGE_SEC) {
        let prevLabel = this.getLabel(this.getLevel());
        let label = this.getLabel(level);
        Log.warn("Protecting heater from fast state switches: " + prevLabel + " --> " + label);
        return;
      }

      Log.info('Switching heater ' + this.getLabel(level));
    
      GPIO.write(this.driverEnablePin, 0);
      GPIO.write(this.driverInputPin, level);
      GPIO.write(this.driverEnablePin, 1);
      Sys.usleep(Heater.RELAY_TIME_MS);
      GPIO.write(this.driverEnablePin, 0);

      this.updateTimestamp = Timer.now();
    }
  }
};
