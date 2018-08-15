# Heater controller

## Overview

This is a temperature controller that allows to switch on or off the heater according to some parameters such as:
- target temperature: the desired temperature to achieve.
- current temperature: as received from the sensors (external and internal).
- other technical parameters (hysteresis, ...)

This is how it will interact with other components in the Smart Home system:

```
Mozilla Thing & Web UI ---> |------|
Internal sensors ---------> | MQTT | -----> Heater controller -----> Heater relay
External sensors ---------> |------|
```

## Hardware

For the time being, the hardware is very similar to that of the blinds controller, but instead of using two relays, it only requires one.

## Firmware

The initial implementation for the Thermostat is a simple On/Off control with hysteresis (aka deadband in the next figure).

![ON/OFF Control](https://www.eurotherm.com/image/data/pid-control/PID-Control-fig1-fig2.jpg)

## Mozilla Thing

*Comming soon*

## Roadmap

- [x] Install an MQTT broker in the base station
- [x] Heater controller hardware and basic firmware (on/off control with histeresis)
- [ ] Web of Things interface
- [ ] Advanced temperature control firmware (PID controller)
