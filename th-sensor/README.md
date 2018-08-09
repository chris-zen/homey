# Temperature and Humidity sensor

## Overview

This is a portable device that will allow:

- to monitor the temperature and humidity wherever it is positioned and report to an MQTT broker
- to show the parameters through an OLED screen (stretch goal)
- to intercept other sensors parameters and show them on the screen (like an external temperature and humidity sensor) (stretch goal)
- to configure the heater controller (stretch goal)

## Hardware

I am just doing the research for the components that will be used for the hardware design:

- [Bosch BME280](https://www.bosch-sensortec.com/bst/products/all_products/bme280): Temperature, relative humidity and barometric pressure.
- [Bosch BME680](https://www.bosch-sensortec.com/bst/products/all_products/bme680): Temperature, relative humidity, barometric pressure and volatile organic componds to measure air quality.

## Firmware

*Comming soon*

## Mozilla Thing

*Comming soon*

## Roadmap

- [ ] Install an MQTT broker in the base station
- [ ] TH sensing and MQTT publishing (hardware and firmware)
- [ ] Mozilla Thing (TH parameters and actions to control the target temperature for the heater)
- [ ] OLED screen integration and TH visualization
- [ ] Touch controls to adjust target temperature
- [ ] Advanced heater programs configuration
