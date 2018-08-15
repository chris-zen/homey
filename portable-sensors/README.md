# Portable sensors

## Overview

This is a portable device that will allow:

- to monitor environmental sensors (temperature, humidity, barometric pressure, VOC, light) wherever it is positioned and report to an MQTT broker
- to show the parameters through an OLED screen (stretch goal)
- to intercept other sensors parameters and show them on the screen (like an external temperature and humidity sensor) (stretch goal)
- to configure the heater controller (stretch goal)

## Hardware

I am just doing the research for the components that will be used for the hardware design:

- [Bosch BME280](https://www.bosch-sensortec.com/bst/products/all_products/bme280): Temperature, relative humidity and barometric pressure.
- [Bosch BME680](https://www.bosch-sensortec.com/bst/products/all_products/bme680): Temperature, relative humidity, barometric pressure and volatile organic componds to measure air quality.
- [BH1750FVI](http://datasheet.octopart.com/BH1750FVI-TR-Rohm-datasheet-25365051.pdf) very cheap light sensor
- [Aliexpress BME680](https://es.aliexpress.com/store/product/BME680-temperature-and-humidity-temperature-pressure-high-altitude-sensor/1965526_32847670390.html?spm=a219c.search0104.3.1.39502b21HgJUIA&ws_ab_test=searchweb0_0,searchweb201602_4_10152_10151_10065_10344_10068_10342_10547_10343_10340_10548_10341_10696_10084_10083_5011815_10618_10307_10820_10301_10821_10303_5723615_5011715_10059_100031_309_10103_10624_10623_10622_10621_10620_525,searchweb201603_56,ppcSwitch_5&algo_expid=6f708819-fd03-48b5-99d1-5a51557fb7bd-0&algo_pvid=6f708819-fd03-48b5-99d1-5a51557fb7bd&transAbTest=ae803_2&priceBeautifyAB=0)
- [Amazon BME280](https://www.amazon.es/Presi%C3%B3n-Barom%C3%A9trica-Ruptura-Humedad-Temperatura/dp/B01GQ3T1A4/ref=pd_sbs_328_4?_encoding=UTF8&pd_rd_i=B01GQ3T1A4&pd_rd_r=2839f69c-9c1a-11e8-9d26-3fe4c7b0301a&pd_rd_w=ZxVSn&pd_rd_wg=UKEPA&pf_rd_i=desktop-dp-sims&pf_rd_m=A1AT7YVPFBWXBL&pf_rd_p=47a6b147-5a87-4159-99c2-b8020734f70c&pf_rd_r=ASFG9XFRMDCZMKGNCRC6&pf_rd_s=desktop-dp-sims&pf_rd_t=40701&psc=1&refRID=ASFG9XFRMDCZMKGNCRC6)
- [Aliexpress BM280](https://es.aliexpress.com/store/product/3In1-BME280-GY-BME280-Sensor-Digital-SPI-I2C-temperatura-y-humedad-barom-trica-1-8-5/334970_32847825408.html?spm=a219c.search0104.3.1.2e4d56c7cHN8Bz&ws_ab_test=searchweb0_0%2Csearchweb201602_4_10152_10151_10065_10344_10068_10342_10547_10343_10340_10548_10341_10696_10084_10083_5011815_10618_10307_10820_10301_10821_10303_5723615_5011715_10059_100031_309_10103_10624_10623_10622_10621_10620_525%2Csearchweb201603_56%2CppcSwitch_5&algo_expid=4aeb02c8-24f4-4a16-9c37-0ad82f767424-0&algo_pvid=4aeb02c8-24f4-4a16-9c37-0ad82f767424&transAbTest=ae803_2&priceBeautifyAB=0)
- [Aliexpress TSL2591](https://es.aliexpress.com/store/product/TSL2591-LIGHT-SENSOR-BREAKOUT-module-TSL2591-High-Dynamic-Range-Digital-Light-Sensor-TSL25911FN-TSL25911/1818486_32822935487.html?spm=a219c.search0104.3.1.8e343a96CwfNvR&ws_ab_test=searchweb0_0,searchweb201602_4_10152_10151_10065_10344_10068_10342_10547_10343_10340_10548_10341_10696_10084_10083_5011815_10618_10307_10820_10301_10821_10303_5723615_5011715_10059_100031_309_10103_10624_10623_10622_10621_10620_525,searchweb201603_56,ppcSwitch_5&algo_expid=84386406-6e37-4bc5-98e1-ef304bb83741-0&algo_pvid=84386406-6e37-4bc5-98e1-ef304bb83741&transAbTest=ae803_2&priceBeautifyAB=0) light sensor
- [Aliexpress CCS811](https://es.aliexpress.com/store/product/CJMCU-811-CCS811-Carbon-Monoxide-CO-VOCs-Air-Quality-Numerical-Gas-Sensors/1185416_32784803629.html?spm=a219c.search0104.3.146.711d7b7f8fg3vB&ws_ab_test=searchweb0_0,searchweb201602_4_10152_10151_10065_10344_10068_10342_10547_10343_10340_10548_10341_10696_10084_10083_5011815_10618_10307_10820_10301_10821_10303_5723615_5011715_10059_100031_309_10103_10624_10623_10622_10621_10620_525,searchweb201603_56,ppcSwitch_5&algo_expid=5597bd76-a331-4ac9-bdec-95b11653c6b6-22&algo_pvid=5597bd76-a331-4ac9-bdec-95b11653c6b6&transAbTest=ae803_2&priceBeautifyAB=0)

Board size:
- 54 x 64 mm

References:
- https://hackaday.io/project/20588-espmobe-battery-powered-esp8266-iot-sensor
- https://cdn.hackaday.io/files/20588880836992/ESPmobePCBv1.pdf

## Firmware

The initial firmware with TH sensing from a DHT chip already working on a NodeMCU. Now waiting for the BME680 board to arrive from China and start testing some of the BME680 libraries:

- [wolfeidau/bme680](https://github.com/wolfeidau/mgos-envsensors) Only I2C, JS support
- [sistar/bme680](https://github.com/sistar/bme680) I2C & SPI, no JS support

## Mozilla Thing

*Comming soon*

## Roadmap

- [x] Install an MQTT broker in the base station
- [x] Initial TH sensing and MQTT publishing (hardware and firmware)
- [ ] Mozilla Thing (TH parameters)
- [ ] More sofisticated sensors (including air-quality)
- [ ] OLED screen integration and TH visualization (stretch goal)
- [ ] Touch controls to adjust target temperature (stretch goal)
- [ ] Advanced heater programs configuration (stretch goal)
