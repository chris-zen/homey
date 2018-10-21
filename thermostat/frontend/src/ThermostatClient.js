import axios from 'axios';

import logging from './logging';

const logger = logging(__filename);


export default class ThermostatClient {
  static autoReconnectInterval = 1000;

  constructor(apiUrl, wsUrl) {
    this.apiUrl = apiUrl;
    this.wsUrl = wsUrl;
    this.listener = null;

    logger('apiUrl', apiUrl);
    logger('wsUrl', wsUrl);
  }

  _openWebsocket() {
    logger(`Opening a WebSocket to ${this.wsUrl} ...`);

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      logger('Message:', msg);
      switch (msg.messageType) {
        case 'propertyStatus':
          if (this.listener !== null && this.listener.onPropertyStatus !== undefined) {
            const status = msg.data;
            this.listener.onPropertyStatus(status);
          }
          break;

        case 'error':
          {
            const error = msg.data;
            if (error.message !== 'Read-only property' || error.status !== '403 Forbidden') {
              logger(`Error: ${JSON.stringify(error)}`);
            }
          }
          break;

        default:
          logger('undhandled ws event', event);
          break;
      }
    };

    this.ws.onopen = () => {
      logger('WebSocket open');
      if (this.listener !== null && this.listener.onPropertyStatus !== undefined) {
        logger('Retrieving initial data ...');
        this.api.get('/properties/').then((res) => {
          const properties = res.data;
          logger('HTTP request finished', properties);
          this.listener.onPropertyStatus(properties);
        });
      }
    };

    this.ws.onerror = (event) => {
      switch (event.code) {
        case 'ECONNREFUSED':
          this._reconnect(event);
          break;
        default:
          break;
      }
    };

    this.ws.onclose = (event) => {
      switch (event.code) {
        case 1000: // CLOSE_NORMAL
          logger('WebSocket: closed');
          break;
        default: // Abnormal closure
          this._reconnect(event);
          break;
      }
    };
  }

  _reconnect(event) {
    logger(`WebSocket: retry in ${ThermostatClient.autoReconnectInterval}ms`, event);

    const self = this;
    setTimeout(() => {
      logger('WebSocket: reconnecting...');
      self._openWebsocket();
    }, ThermostatClient.autoReconnectInterval);
  }

  open() {
    this.api = axios.create({ baseURL: this.apiUrl });

    this._openWebsocket();
  }

  listen(listener) {
    this.listener = listener;
  }

  close() {
    this.listener = null;
    this.api.close();
    this.ws.close();
  }

  setProperty(properties) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        messageType: 'setProperty',
        data: properties,
      }));
    }
  }
}
