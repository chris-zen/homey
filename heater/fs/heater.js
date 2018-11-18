load('api_log.js');
load('api_gpio.js');
load('api_timer.js');
load('api_sys.js');

let Heater = {
  // Status
  ON_STATUS: 1,
  OFF_STATUS: 0,

  // GPIO levels for the relay
  ON_LEVEL: 0,
  OFF_LEVEL: 1,

  // Time required for the relay coil to apply the state change
  RELAY_TIME_MS: 10000,

  create: function(driverEnablePin, driverInputPin, minUpdateAgeSec, maxTargetAgeSec) {
    let obj = Object.create(Heater._proto);
    obj.driverEnablePin = driverEnablePin;
    obj.driverInputPin = driverInputPin;
    obj.minUpdateAgeSec = minUpdateAgeSec;
    obj.maxTargetAgeSec = maxTargetAgeSec;
    obj.switchTimestamp = undefined;
    obj.targetTimestamp = Timer.now();
    obj.listener = undefined;

    Log.info("Create:");
    Log.info("  driverEnablePin: " + JSON.stringify(driverEnablePin));
    Log.info("  driverInputPin:  " + JSON.stringify(driverInputPin));
    Log.info("  minUpdateAgeSec: " + JSON.stringify(minUpdateAgeSec));
    Log.info("  maxTargetAgeSec: " + JSON.stringify(maxTargetAgeSec));

    GPIO.write(driverEnablePin, 0);
    GPIO.set_mode(driverEnablePin, GPIO.MODE_OUTPUT);
    GPIO.set_mode(driverInputPin, GPIO.MODE_OUTPUT);

    obj.switchOff();

    return obj;
  },

  _proto: {
    onUpdate: function(listener) {
      this.listener = listener;
    },

    isOn: function() {
      return this.getLevel() === Heater.ON_LEVEL;
    },

    status: function() {
      let now = Timer.now();
      let on = this.isOn();
      let value = on ? Heater.ON_STATUS : Heater.OFF_STATUS;
      return {
        on: on,
        value: value,
        now: now,
        targetAge: now - this.targetTimestamp,
        targetTimestamp: this.targetTimestamp,
        maxTargetAge: this.maxTargetAgeSec,
        updateAge: now - (this.switchTimestamp || - this.minUpdateAgeSec),
        switchTimestamp: this.switchTimestamp,
        minUpdateAge: this.minUpdateAgeSec,
        switchAllowed: this.switchAllowed()
      };
    },

    switchTarget: function(target) {
      if (target === Heater.ON_STATUS) {
        this.switchOn();
      }
      else if (target === Heater.OFF_STATUS) {
        this.switchOff();
      }
      this.targetTimestamp = Timer.now();
    },

    switchOn: function() {
      this.setLevel(Heater.ON_LEVEL);
    },

    switchOff: function() {
      this.setLevel(Heater.OFF_LEVEL);
    },

    watchdog: function() {
      if (!this.isOn()) {
        return;
      }

      let targetAge = Timer.now() - this.targetTimestamp;
      if (targetAge >= this.maxTargetAgeSec) {
        Log.info("Watchdog: Switching OFF the heater. Last target value is older than "
                 + JSON.stringify(this.maxTargetAgeSec) + " secs.");
        this.switchOff();
      }
      else {
        Log.debug("Watchdog: Last target value received " + JSON.stringify(targetAge)
                  + " secs ago (maximum allowed " + JSON.stringify(this.maxTargetAgeSec) + ")");
      }
      return targetAge;
    },

    getLabel: function(level) {
      return level === Heater.ON_LEVEL ? "ON" : "OFF";
    },

    getLevel: function() {
      return GPIO.read(this.driverInputPin);
    },

    setLevel: function(level) {
      if (this.getLevel() === level) {
        Log.info("Heater already " + this.getLabel(level));
        return;
      }

      if (this.switchAllowed(level)) {
        Log.info('Switching heater ' + this.getLabel(level));

        GPIO.write(this.driverEnablePin, 0);
        GPIO.write(this.driverInputPin, level);
        GPIO.write(this.driverEnablePin, 1);
        Sys.usleep(Heater.RELAY_TIME_MS);
        GPIO.write(this.driverEnablePin, 0);

        this.switchTimestamp = Timer.now();

        if (this.listener !== undefined) {
          this.listener(this.status());
        }
      }
    },

    switchAllowed: function(level) {
      let now = Timer.now();
      let updateAge = now - (this.switchTimestamp || - this.minUpdateAgeSec);
      if (updateAge >= this.minUpdateAgeSec) {
        return true;
      }
      else {
        let prevLabel = this.getLabel(this.getLevel());
        let label = this.getLabel(level);
        let remaining = this.minUpdateAgeSec - updateAge;
        Log.warn("Switching " + prevLabel + " --> " + label + " protected for the next "
                 + JSON.stringify(remaining) + " secs");
        return false;
      }
    }
  }
};
