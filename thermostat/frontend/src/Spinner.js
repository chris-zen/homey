import React, { Component } from 'react';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareUp, faCaretSquareDown } from '@fortawesome/free-solid-svg-icons'

library.add(faCaretSquareUp, faCaretSquareDown);

class Spinner extends Component {
  
  handleClick = (step) => {
    if (this.props.onValueStep !== undefined) {
      this.props.onValueStep(step);
    }
  }

  getFormatedValue() {
    if (this.props.value === undefined) {
      return '---'
    }
    else {
      let digits = this.props.digits || 0;
      return this.props.value.toFixed(digits);
    }
  }

  render() {
    return (
      <div className="Spinner" style={{
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
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch'}}>
          <div style={{height: '3.1em'}}>
            <span style={{fontSize: '28pt', fontWeight: 'bold'}}>{this.getFormatedValue()}</span>
            <span style={{fontSize: '16pt', marginLeft: '0.5em'}}>{this.props.unit}</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'stretch', fontWeight: 'bold', fontSize: '14pt'}}>
            <div onClick={this.handleClick.bind(this, this.props.step || 1.0)}>
              <FontAwesomeIcon icon="caret-square-up" size="lg" />
            </div>
            <div onClick={this.handleClick.bind(this, -this.props.step || -1.0)}>
              <FontAwesomeIcon icon="caret-square-down" size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Spinner;
