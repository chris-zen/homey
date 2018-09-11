# Heater controller

## Overview

This is a heater controller that allows to switch on or off the heater relay.

## Hardware

For the time being, the hardware is very similar to that of the [blinds](../blinds) controller, but instead of using two relays, it only requires one.

## Firmware

The firmware subscribes to the MQTT topic `heater/target` with the target status for the relay (which can be 0 for OFF and 1 for ON). It will apply some rules to protect the heater:

- Changes to the relay state can only happen after a certain amount of time (to avoid fast state changes that might damage the heater).
- If the target status is not received for a certain amount of time, switch off the heater. The thermostat could be down, and keeping the heater on forever would be dangerous and/or inefficient.

The heater status will be published to the following MQTT topics:
- `heater/status/on`: boolean for the relay status, false = OFF, true = ON.
- `heater/status/value`: value for the relay status, 0 = OFF, 1 = ON.
- `heater/status/switchAllowed`: whether the heater can change the relay or not yet.
- `heater/status/all`: JSON representation of all the internal status.

### RPC calls

- `Heater.Set <value>`: Set the heater status. `off` or `0` for OFF, `on` or `1` for ON.
- `Heater.On`: Switch on the heater.
- `Heater.Off`: Switch off the heater.
- `Heater.Status`: Return the heater internal status.

## Roadmap

- [x] Heater controller hardware
- [x] Initial firmware for controlling the relay
- [ ] Advanced firmware including sensor for water temperature
