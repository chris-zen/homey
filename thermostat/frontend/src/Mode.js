import React, { Component } from 'react';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSnowflake, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

library.add(faSun, faMoon, faSnowflake);

const modeLabels = {
  comfort: 'Comfort',
  energySaving: 'Energy Saving',
  frostProtection: 'Frost Protection'
};

class ModeIcon extends Component {

  handleClick = () => {
    if (this.props.onClick !== undefined) {
      this.props.onClick(this.props.mode);
    }
  }

  handleMouseEnter = () => {
    if (this.props.onMouseEnter !== undefined) {
      this.props.onMouseEnter(this.props.mode);
    }
  }

  handleMouseLeave = () => {
    if (this.props.onMouseLeave !== undefined) {
      this.props.onMouseLeave(this.props.mode);
    }
  }

  render() {
    const highlightColor = 'steelblue';
    const highlightBgColor = 'white';
    const selected = this.props.mode === this.props.selectedMode;
    const color = selected ? highlightColor : '';
    const backgroundColor = selected ? highlightBgColor : '';
    return (
      <div onMouseEnter={this.handleMouseEnter}
           onMouseLeave={this.handleMouseLeave}
           onClick={this.handleClick}
           style={{padding: '0.4em', borderRadius: '8px', color, backgroundColor}}>
      
        <FontAwesomeIcon icon={this.props.icon} size="2x" />
      </div>
    );
  }
}

class Mode extends Component {

  static defaultTitle = 'Mode'

  static comfort = 'comfort'
  static energySaving = 'energySaving'
  static frostProtection = 'frostProtection'

  constructor(props) {
    super(props);
    this.state = {
      title: Mode.defaultTitle
    }
  }

  setTitleFromMode = (mode) => {
    let title = modeLabels[mode];
    if (title !== undefined) {
      this.setState({title});
    }
  }

  setDefaultTitle = () => {
    this.setState({title: Mode.defaultTitle});
  }

  onModeChanged = (mode) => {
    if (this.props.onModeChanged !== undefined) {
      this.props.onModeChanged(mode);
    }
  }

  render() {
    return (
      <div className="Mode" style={{
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

        <div>{this.state.title}</div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', height: '3.1em'}}>
          <ModeIcon icon="sun"
                    mode={Mode.comfort}
                    selectedMode={this.props.mode}
                    onMouseEnter={this.setTitleFromMode.bind(this)}
                    onMouseLeave={this.setDefaultTitle.bind(this)}
                    onClick={this.onModeChanged} />
          <ModeIcon icon="moon"
                    mode={Mode.energySaving}
                    selectedMode={this.props.mode}
                    onMouseEnter={this.setTitleFromMode.bind(this)}
                    onMouseLeave={this.setDefaultTitle.bind(this)}
                    onClick={this.onModeChanged} />
          <ModeIcon icon="snowflake"
                    mode={Mode.frostProtection}
                    selectedMode={this.props.mode}
                    onMouseEnter={this.setTitleFromMode.bind(this)}
                    onMouseLeave={this.setDefaultTitle.bind(this)}
                    onClick={this.onModeChanged} />
        </div>
      </div>
    );
  }
}

export default Mode;