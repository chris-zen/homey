import React, { Component } from 'react';

import './App.css';

import config from './config';
import logging from './logging';

import Mode from './Mode';
import Spinner from './Spinner';
import Sensor from './Sensor';

import ThermostatClient from './ThermostatClient';

const logger = logging(__filename);

class MainControl extends Component {
  constructor(props) {
    super(props);

    let host = window.location.hostname;
    let apiUrl = window.location.origin;
    var wsUrl = new URL(window.location.origin);
    wsUrl.protocol = "ws";
    wsUrl = wsUrl.origin.toString();

    this.state = {
      thermostat: new ThermostatClient(apiUrl, wsUrl)
    };
  }

  componentDidMount() {
    const thermostat = this.state.thermostat;
    thermostat.open();
    thermostat.listen(this);
  }

  componentWillUnmount() {
    this.state.thermostat.close();
  }

  onPropertyStatus(properties) {
    logger('onPropertyStatus', properties);
    this.setState(properties);
  }

  handleTargetTemperatureStep = (step) => {
    this.setState((prevState) => {
      if (prevState.targetTemperature !== undefined) {
        let targetTemperature = prevState.targetTemperature;
        let newValue = targetTemperature + step;
        let state = {targetTemperature: newValue};
        this.state.thermostat.setProperty(state);
        return state;
      }
    });
  }

  handleModeChanged = (mode) => {
    let state = {mode};
    this.state.thermostat.setProperty(state);
    this.setState(state);
  }

  render() {
    return (
      <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
        <div className="App" style={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1em'}}>
          <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Spinner title="Target" unit="˚C" step={0.5} digits={1}
                     value={this.state.targetTemperature}
                     onValueStep={this.handleTargetTemperatureStep} />
            <Sensor title="Temperature" unit="˚C" digits={1}
                    value={this.state.referenceTemperature} />
          </div>
          <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Mode value={Mode.comfort} mode={this.state.mode}
                  onModeChanged={this.handleModeChanged} />
            <Sensor title="Humidity" unit="%"
                    value={this.state.referenceHumidity} />
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <MainControl />
    );
  }
}

export default App;
