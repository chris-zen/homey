# My Smart Home

This is my second round on building devices for my Smart Home (see [this other project](https://github.com/chris-zen/energy-monitoring) for my first attempt to build an energy monitoring system).

I am currently planning to build the following controllers:
- [Blinds controller](blinds): To bring up and down the blinds remotely.
- [Portable sensors](portable-sensors): To measure internal and external sensors (such as temperature and humidity), and provide a portable user interface.
- [Heater controller](heater): To switch on/off my heater according to the desired temperature, the current internal and external temperature and humidity, and other parameters.
- [Bathroom extractor controller](air-extractor): To control the bathroom air extractor according to presence, the humidity and time restrictions.

This time I will use [ESP8266](https://www.espressif.com/en/products/hardware/esp8266ex/overview) and [Mongoose-OS](https://mongoose-os.com/) as the base for the controllers.

I was planning to have a similar setup for my [base station](base-station) as for my previous project (see [this](https://github.com/chris-zen/energy-monitoring/wiki/Base-station) for further information), but my mind changed immediately as soon as I discovered the amazing [Project of Things](https://iot.mozilla.org/) from Mozilla. So my next challenge will be to figure out how to integrate my devices into the gateway (which I already have running in my Raspberry Pi, and fully working with my other [Z-Wave](http://www.z-wave.com/learn) devices).

# Media

- [Building my blinds controller](https://photos.app.goo.gl/Czdh2BhWPQBsjujQ9)
- [How I failed to build my first blinds controller](https://aloneinthehack.wordpress.com/2018/08/08/how-did-i-fail-to-build-my-first-blinds-controller/)

# Notes

- I followed [this guide](https://jnavila.github.io/plotkicadsch/) to make Kicad projects fit nicer with git
