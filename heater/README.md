# Heater controller

## Overview

This is a heater controller that allows to switch on or off the heater relay.

## Hardware

For the time being, the hardware is very similar to that of the [blinds](../blinds) controller, but instead of using two relays, it only requires one.

## Firmware

The firmware subscribes to an MQTT topic with the target status for the relay. It will apply some rules to protect the heater:

- Changes to the relay state can only happen after a certain amount of time (to avoid fast state changes that might damage the heater).
- If the target status is not received for a certain amount of time, switch off the heater. The thermostat could be down, and keeping the heater on forever would be dangerous and/or inefficient.

## Roadmap

- [x] Heater controller hardware
- [ ] Firmware
