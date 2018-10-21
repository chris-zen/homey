# Thermostat controller

## Overview

This is a temperature controller that allows to switch on or off the heater according to some parameters such as:
- target temperature: the desired temperature to achieve.
- reference temperature: as received from the sensors (inside or outside).
- other technical parameters (hysteresis, ...)

This is how it will interact with other components in the Smart Home system:

```
                            |------|
Inside sensors -----------> | MQTT | ---------> |------------|        |------|
Outside sensors ----------> |------|            | Thermostat | -----> | MQTT | -----> Heater controller
Mozilla Things Gateway & Custom React UI -----> |------------|        |------|
```

## Hardware

This controller is pure software and will run within the base station. It interacts with other hadrware
 through MQTT. On one side with the [sensors](../portable-sensors) to read temperature and humidity from several sources. And
 on the other side with the [heater](../heater) controller which controls the heater relay.

## Software

There are two main components:

- The backend server: A Node JS server that implements the thermostat controller logic, as well as a web interface to allow other components to interact with it. It uses the [webthing](https://www.npmjs.com/package/webthing) package to provide a [Web Thing API](https://iot.mozilla.org/wot/), and [mqtt.js](https://www.npmjs.com/package/mqtt) to interface with the sensors and the heater controller.
- The custom UI: It is a React web application that allows to view and control the thermostat. It communicates with the backend server using HTTP and WebSockets (following the [Web Thing API](https://iot.mozilla.org/wot/)).

The initial implementation for the thermostat controller logic is a simple On/Off control with hysteresis (aka deadband in the next figure).

![ON/OFF Control](https://www.eurotherm.com/image/data/pid-control/PID-Control-fig1-fig2.jpg)

## Roadmap

- [x] Simplified custom UI
- [x] Web of Things interface
- [x] Thermostat controller logic
- [x] Docker image for the base station
- [ ] Improved custom UI
- [ ] Advanced temperature control (PID controller)
