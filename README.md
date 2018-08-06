# My Smart Home

This is my second round on building devices for my Smart Home (see [this other project](https://github.com/chris-zen/energy-monitoring) for my first attempt).

I am currently planning to build the following controllers:
- **Blinds controller**: To bring up and down the blinds remotely.
- **Thermostat controller**: To switch on/off my heater according to the desired temperature.
- **Bathroom extractor controller**: To control the air extraction from the bathroom according to the humidity and certain time restrictions.

This time I will use [ESP8266](https://www.espressif.com/en/products/hardware/esp8266ex/overview) and [Mongoose-OS](https://mongoose-os.com/) as the base for the controllers.

I was planning to have a similar setup for my base station as for my previous project (see [this](https://github.com/chris-zen/energy-monitoring/wiki/Base-station) for further information), but my mind changed immediately as soon as I discovered the [Project of Things](https://iot.mozilla.org/) from Mozilla. So my next challenge will be to figure out how to integrate my devices into the gateway (which I already have running in my Raspberry Pi, and fully working with my other [Z-Wave](http://www.z-wave.com/learn) devices).

# Media

- [Building my blinds controller](https://photos.app.goo.gl/Czdh2BhWPQBsjujQ9)

# Notes

- I followed [this guide](https://jnavila.github.io/plotkicadsch/) to make Kicad projects fit nicer with git
