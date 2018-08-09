# Blinds controller

## Overview

This is the firmware for the blinds controller. It allows to control the blinds' motor for going up or down, either from physical switches (up/down buttons), or remotely through RPC commands.

## Building and flashing

This is a Mongoose OS application, so for details on how to configure, build and flash you can take a look to its [documentation](https://mongoose-os.com/docs/README.md).

I typically run the following commands:

```bash
mos build --local --platform esp8266 --verbose
mos flash
mos wifi <SSID> <PWD>
mos console
```

## RPC commands

This controller provides the following RPC commands:

- **Blinds.Down**: Trigger the blinds' motor to go down.
- **Blinds.Up**: Trigger the blinds' motor to go up.
- **Blinds.Off**: Stop the blinds' motor.
- **Blinds.State**: Return the internal state as a JSON.

Examples of commands:

```bash
mos --port ws://blinds-2B8286.local/rpc call Blinds.Up
mos --port ws://blinds-2B8286.local/rpc call Blinds.Down
mos --port ws://blinds-2B8286.local/rpc call Blinds.Off
mos --port ws://blinds-2B8286.local/rpc call Blinds.State
```

To know the DNS of the device you can use the following command:

```bash
dns-sd -B
```

## Internal state

The controller deals with two different interfaces:
- The physical switches (up and down)
- The internal relays that control the motor

The software is modeled using state machines. There is the state machine that represents its state as two independent switches up and down, which output is the desired state for the relays (power and direction). Then there is another state machine to materialise the desired output state into transitions for the relays (to avoid specific cases in which both the power and the direction change at the same time, and ensure the order in which those relays change its state).

### The physical switches

Typically for blinds there are two switches, one for lifting the blinds, and another one for bringing them down. It is possible to have both of them switched on, but the controller has to guarantee that the power goes only to one of the two possible inputs for the motor at the same time. In the case of this project this is guaranteed at hardware level, because of how the realys are connected. That way, we avoid to screw up the blinds' motor if there is a failure in the software.

The internal state for the switches can also be changed remotely using RPC commands, and the controller will deal with those two sources (the physical switches and the remote commands) nicely, as it acts on events comming from them. The last one to send an event will mandate what the next output will be.

### The relays controlling the motor

There are two relays:
- The **power** relay: controls whether there is power going to the motor or not.
- The **direction** relay: controls whether the power will go into the up or down input for the motor.

The hardware design uses polarized bistable relays drived by an stepping motor. The reason to use bistable relays is that it only needs to drive power to the relays during state transitions (during a few milliseconds), lowering the consumption, and keeping the state even when the controller looses the power.

# License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
