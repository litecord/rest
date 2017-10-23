/// <reference path="../definitions/Bridge.d.ts" />

const hat = require('hat');
const WebSocket = require('uws');
const EventEmitter = require('events').EventEmitter;

/**
  0	HELLO	Server
  1	HELLO_ACK	Client
  2	HEARTBEAT	Client
  3	HEARTBEAT_ACK	Server
  4	REQUEST	Client
  5	RESPONSE	Server
  6	DISPATCH	Client
 */

const OPCODES = {
  HELLO: {
    SENDER: 'SERVER',
    CODE: 0
  },
  HELLO_ACK: {
    SENDER: 'CLIENT',
    CODE: 1
  },
  HEARTBEAT: {
    SENDER: 'CLIENT',
    CODE: 2
  },
  HEARTBEAT_ACK: {
    SENDER: 'SERVER',
    CODE: 3
  },
  REQUEST: {
    SENDER: 'CLIENT',
    CODE: 4
  },
  RESPONSE: {
    SENDER: 'SERVER',
    CODE: 5
  },
  DISPATCH: {
    SENDER: 'CLIENT',
    CODE: 6
  }
};

const ACCEPTED_OPCODES = [];
for (const [, value] of OPCODES) {
  if (value.SENDER && value.sender === 'CLIENT') {
    if (value.CODE) {
      ACCEPTED_OPCODES.push(value.CODE);
    }
  }
}

/**
 * 
 * 
 * @class BridgeController
 */
class BridgeController extends EventEmitter {
  constructor(options = {host: 'ws://localhost:8080/Bridge', password: 'letmein'}) {
    super();
    this.requests = new Map();
    this.socket = new WebSocket(options.host);
    this.socket.onmessage = this.onMessage.bind(this);
  }

  async send(data = {}, opcode = 5, nonce = 69) {
    if (opcode.CODE) {
      opcode = opcode.CODE;
    }
    return this._send({opcode, n: nonce, r: data});
  }

  _send(data = {opcode: 5, n: 69, r: {bich: 'someone forgot to supply the data!!!!!!!'}}) {
    return new Promise((resolve, reject) => {
      if (!data.opcode || (ACCEPTED_OPCODES[data.opcode] && ACCEPTED_OPCODES[data.opcode].from !== 'CLIENT')) {
        throw new Error('Invalid payload. Did you read the docs?');
      }
      let payload = {op: data.opcode};
      if (data.n) {
        payload.n = data.n;
      }
      if (data.r) {
        payload = Object.assign(payload, data);
      }
      this.socket.send(data, (e) => {
        if (e) {
          return reject(e);
        } else {
          if (data.opcode === OPCODES.REQUEST.CODE && data.n) {
            this.requests.set(data.n, resolve);
          } else {
            resolve();
          }
        }
      });
    });
  }

  dispatch(data = {}, event) {
    data.w = event;
    return this.send(data, OPCODES.DISPATCH);
  }

  request(data = {}) {
    return this.send(data, OPCODES.REQUEST, hat());
  }

  respond(data = {}, nonce) {
    if (!nonce) {
      throw new Error('The nonce is required for responses');
    }
    return this.send(data, OPCODES.RESPONSE, nonce);
  }

  login() {
    return this.send({}, OPCODES.HELLO_ACK);
  }

  onMessage(packet = {data: {}, type: '', target: this.socket}) {
    
  }
}

module.exports = BridgeController;