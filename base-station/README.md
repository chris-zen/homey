# System setup

Starting from a [Things Gateway image](https://github.com/mozilla-iot/gateway/releases/download/0.5.0/gateway-0.5.0.img.zip) which is based on Raspbian.

## .bashrc

```
sed -i'' 's/#alias ll/alias ll/g' ~/.bashrc
```

## Install Docker

```
curl -fsSL get.docker.com | sh
sudo usermod -aG docker pi
```

## Install Docker compose

```
echo alias docker-compose="'"'docker run \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:/rootfs/$PWD" \
    -w="/rootfs/$PWD" \
    docker/compose:1.22.0'"'" >> ~/.bashrc
```

## Install Mosquitto

```
docker run -ti --detach --restart unless-stopped --name mosquitto \
           -p 1883:1883 -p 9001:9001 pascaldevink/rpi-mosquitto
```

## Start thermostat

```
docker run -ti --detach --restart unless-stopped --name thermostat \
           --net=host \
           -e MQTT_URL=mqtt://192.168.1.64:1883 \
           -e UI_HREF_URL=http://192.168.1.64:9000/index.html \
           -e "DEBUG=thermostat:*,express:*" \
           chriszen/homey-thermostat:0.1.0-armhf
```

# Web of Things notes

- Site: https://iot.mozilla.org/
- Blog: https://hacks.mozilla.org/category/web-of-things/

# MQTT notes

- http://www.steves-internet-guide.com/mosquitto-tls/
- http://www.steves-internet-guide.com/mosquitto_pub-sub-clients/
- https://mosquitto.org/man/mosquitto-tls-7.html

# DNS and mDNS notes

My attempt to enable resolving mDNS .local devices through a DNS server on the RPi have been futile. Some notes:

- https://blog.csainty.com/2016/09/running-dnsmasq-in-docker.html
- https://github.com/wisq/mdns-proxy

# Roadmap

- [x] Mozilla Things Gateway flashing
- [x] Docker installation
- [x] Basic MQTT server installation
- [ ] Create a Docker compose with all the required docker apps (MQTT, thermostat)
- [ ] Basic analytics setup (influxdb or prometheus + capturing signals)
- [ ] TLS for MQTT
