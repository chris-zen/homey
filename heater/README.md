# Heater controller

## Overview

This is a controller that allows to switch on or off the heater according to some parameters such as:
- target temperature: the desired temperature to achieve.
- current temperature and humidity (TH): as received from the sensors (external and internal).
- other technical parameters (threshold margins, tolerances, cycle periods, ...)

This is how it will interact with other components in the Smart Home system:

```
Mozilla Thing & Web UI ---> |------|
TH internal sensor -------> | MQTT | ---------> Heater controller
TH external sensor -------> |------|
```

## Hardware

For the time being, the hardware is very similar to that of the blinds controller, but instead of using two relays, it only requires one.

## Firmware

*Comming soon*

## Mozilla Thing

*Comming soon*

## Roadmap

- [] Install an MQTT broker in the base station
- [] Heater controller hardware and basic firmware
- [] Advanced temperature control firmware
