import debug from 'debug';
import React, { Component } from 'react';

const logger = debug('thermostat:Sensor');

class Sensor extends Component {

  getFormatedValue() {
    if (this.props.value === undefined) {
      return '---';
    }
    else {
      let digits = this.props.digits || 0.0;
      return this.props.value.toFixed(digits);
    }
  }

  render() {
    return (
      <div className="Sensor" style={{
           display: 'flex',
           flexDirection: 'column',
           justifyContent: 'space-evenly',
           alignItems: 'stretch',
           borderRadius: '8px',
           backgroundColor: 'steelblue',
           margin: '2px',
           color: 'white',
           width: '10em',
           height: '5.5em'}}>

        <div>{this.props.title}</div>
        <div style={{height: '3.1em'}}>
          <span style={{fontSize: '28pt', fontWeight: 'bold'}}>{this.getFormatedValue()}</span>
          <span style={{fontSize: '16pt', marginLeft: '0.5em'}}>{this.props.unit}</span>
        </div>
      </div>
    );
  }
}

export default Sensor;
