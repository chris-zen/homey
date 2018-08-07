load('api_config.js');
load('api_gpio.js');
load('api_rpc.js');
load('api_sys.js');

print("Starting Blinds controller ...");

// Constants

let POWER_OFF = 0;
let POWER_ON = 1;
let DIR_DOWN = 0;
let DIR_UP = 1;

let STATE_OFF = 0;
let STATE_ON = 1;

let relayCoilMicroseconds = 10000;

// Initial driver state

let power = POWER_OFF;
let direction = DIR_UP;

// Initial internal state

let stateDown = STATE_OFF;
let stateUp = STATE_OFF;

// Switches state

let switchDown = 1;
let switchUp = 1;

// Pins configuration

let enginePowerPin = Cfg.get('app.pins.engine_power');
let engineDirPin = Cfg.get('app.pins.engine_dir');
let driverEnablePin = Cfg.get('app.pins.driver_enable');

let switchUpPin = Cfg.get('app.pins.switch_up');
let switchDownPin = Cfg.get('app.pins.switch_down');


// Driver ------------------------------------------------------------------------------------

function powerSignal(power) {
  return power === POWER_OFF ? 1 : 0;
}

function powerSignalLabel(signal) {
  return signal === 1 ? "OFF" : "ON";
}

function directionSignal(direction) {
  return direction === DIR_DOWN ? 0 : 1;
}

function directionSignalLabel(signal) {
  return signal === 0 ? "DOWN" : "UP";
}

function initDriver() {
  print("Initialising the relays driver ...");

  GPIO.write(driverEnablePin, 0);
  GPIO.set_mode(driverEnablePin, GPIO.MODE_OUTPUT);
  GPIO.set_mode(enginePowerPin, GPIO.MODE_OUTPUT);
  GPIO.set_mode(engineDirPin, GPIO.MODE_OUTPUT);

  setDriver(powerSignal(POWER_OFF), directionSignal(DIR_UP));

  print("EnginePowerPin = ", enginePowerPin);
  print("EngineDirPin = ", engineDirPin);
  print("DriverEnablePin = ", driverEnablePin);
}

function setDriver(powerInput, directionInput) {
  print('[Driver] Power:', powerSignalLabel(powerInput),
        ', Direction:', directionSignalLabel(directionInput));

  GPIO.write(driverEnablePin, 0);
  GPIO.write(enginePowerPin, powerInput);
  GPIO.write(engineDirPin, directionInput);
  GPIO.write(driverEnablePin, 1);
  Sys.usleep(relayCoilMicroseconds);
  GPIO.write(driverEnablePin, 0);
}

// Switches --------------------------------------------------------------------------------

function stateFromSwitchValue(switchValue) {
  return switchValue === 0 ? STATE_ON : STATE_OFF;
}

function initSwitches() {
  print("Initialising switches ...");

  print("SwitchUpPin = ", switchUpPin);
  print("SwitchDownPin = ", switchDownPin);

  GPIO.set_pull(switchUpPin, GPIO.PULL_UP);
  GPIO.set_mode(switchUpPin, GPIO.MODE_INPUT);
  GPIO.set_int_handler(switchUpPin, GPIO.INT_EDGE_ANY, function(pin, userdata) {
    let pinValue = GPIO.read(pin);
    if (pinValue !== switchUp) {
      switchUp = pinValue;
      let newStateUp = stateFromSwitchValue(pinValue);
      print("[Switch] Up:", stateLabel(newStateUp), ', Pin:', pin, ', Value:', pinValue);
      updateState(stateDown, newStateUp);
    }
  }, null);
  switchUp = GPIO.read(switchUpPin);
  GPIO.enable_int(switchUpPin);

  GPIO.set_pull(switchDownPin, GPIO.PULL_UP);
  GPIO.set_mode(switchDownPin, GPIO.MODE_INPUT);
  GPIO.set_int_handler(switchDownPin, GPIO.INT_EDGE_ANY, function(pin, userdata) {
    let pinValue = GPIO.read(pin);
    if (pinValue !== switchDown) {
      switchDown = pinValue;
      let newStateDown = stateFromSwitchValue(pinValue);
      print("[Switch] Down:", stateLabel(newStateDown), ', Pin:', pin, ', Value:', pinValue);
      updateState(newStateDown, stateUp);
    }
  }, null);
  switchDown = GPIO.read(switchDownPin);
  GPIO.enable_int(switchDownPin);
}

// Blinds logic ----------------------------------------------------------------------------

function powerLabel(power) {
  return power === POWER_OFF ? "OFF" : "ON";
}

function directionLabel(direction) {
  return direction === DIR_DOWN ? "DOWN" : "UP";
}

function updateOutput(newPower, newDirection) {
  print('[Output] (Power:', powerLabel(power),
        ', Direction:', directionLabel(direction),
        ') --> (Power:', powerLabel(newPower),
        ', Direction:', directionLabel(newDirection), ')');

  // Make sure we change the relays following some rules

  while (power !== newPower || direction !== newDirection) {
    if (power !== newPower && direction !== newDirection) {
      // Make sure that only one relay changes state at a time
      // and that the direction changes before the power goes on
      if (newPower === POWER_ON) {
        direction = newDirection;
      }
      else if (newPower === POWER_OFF) {
        power = newPower;
      }
    }
    else if (power === POWER_ON && direction !== newDirection) {
      // Prevent the direction relay from changing while the power is on
      power = POWER_OFF;
    }
    else {
      power = newPower;
      direction = newDirection;
    }

    setDriver(powerSignal(power), directionSignal(direction));  
  }
}

function stateLabel(state) {
  return state === STATE_OFF ? "OFF" : "ON";
}

function updateState(newStateDown, newStateUp) {
  print('[State] (Down:', stateLabel(stateDown), ', Up:', stateLabel(stateUp),
        ') --> (Down:', stateLabel(newStateDown), ', Up:', stateLabel(newStateUp), ')');
  
  stateDown = newStateDown;
  stateUp = newStateUp;

  if (power === POWER_OFF) {
    if (stateDown === STATE_ON) {
      updateOutput(POWER_ON, DIR_DOWN);
    }
    else if (stateUp === STATE_ON) {
      updateOutput(POWER_ON, DIR_UP);
    }
  }
  else if (power === POWER_ON) {
    if (stateDown === STATE_OFF && stateUp === STATE_OFF) {
      updateOutput(POWER_OFF, direction);
    }
    else if (stateDown === STATE_ON && stateUp === STATE_ON) {
      updateOutput(POWER_OFF, direction);
    }
    else if (direction === DIR_DOWN && stateDown === STATE_OFF && stateUp === STATE_ON) {
      updateOutput(POWER_ON, DIR_UP);
    }
    else if (direction === DIR_UP && stateDown === STATE_ON && stateUp === STATE_OFF) {
      updateOutput(POWER_ON, DIR_DOWN);
    }
  }
}

function isValidState(state) {
  return state === STATE_ON || state === STATE_OFF;
}

function currentState() {
  return {
    power: power,
    direction: direction,
    down: stateDown,
    up: stateUp
  };
}

// ---------------------------------------------------------------------------------------

initDriver();
initSwitches();

print("Registering RPC handlers ...");

RPC.addHandler('Blinds.Down', function() {
  updateState(STATE_ON, STATE_OFF);
  return currentState();
});

RPC.addHandler('Blinds.Up', function() {
  updateState(STATE_OFF, STATE_ON);
  return currentState();
});

RPC.addHandler('Blinds.Off', function() {
  if (stateDown === STATE_ON || stateUp === STATE_ON) {
    updateState(STATE_OFF, STATE_OFF);
  }
  return currentState();
});

RPC.addHandler('Blinds.State', function() {
  return currentState();
});

