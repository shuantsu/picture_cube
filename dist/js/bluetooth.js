(function() {
  'use strict';

class BluetoothCube {
  constructor() {
    this.callbacks = {
      onMove: null,
      onConnect: null,
      onDisconnect: null,
      onError: null
    };
    this.giiker = null;
  }

  onMove(callback) {
    this.callbacks.onMove = callback;
  }

  onConnect(callback) {
    this.callbacks.onConnect = callback;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  async connect() {
    try {
      this.giiker = new Giiker();
      await this.giiker.connect();
      
      this.giiker.on('move', (move) => {
        if (this.callbacks.onMove) {
          this.callbacks.onMove(move.notation);
        }
      });

      this.giiker.on('disconnected', () => {
        if (this.callbacks.onDisconnect) {
          this.callbacks.onDisconnect();
        }
      });

      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  disconnect() {
    if (this.giiker) {
      this.giiker.disconnect();
    }
  }

  isConnected() {
    return this.giiker && this.giiker._device && this.giiker._device.gatt.connected;
  }
}

// Giiker class implementation
const SERVICE_UUID = '0000aadb-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000aadc-0000-1000-8000-00805f9b34fb';
const SYSTEM_SERVICE_UUID = '0000aaaa-0000-1000-8000-00805f9b34fb';
const SYSTEM_READ_UUID = '0000aaab-0000-1000-8000-00805f9b34fb';
const SYSTEM_WRITE_UUID = '0000aaac-0000-1000-8000-00805f9b34fb';

const B = 0, D = 1, L = 2, U = 3, R = 4, F = 5;
const cubeFaces = ['B', 'D', 'L', 'U', 'R', 'F'];
const b = 0, y = 1, o = 2, w = 3, r = 4, g = 5;
const colors = ['blue', 'yellow', 'orange', 'white', 'red', 'green'];
const turns = { 0: 1, 1: 2, 2: -1, 8: -2 };

const cornerColors = [[y, r, g], [r, w, g], [w, o, g], [o, y, g], [r, y, b], [w, r, b], [o, w, b], [y, o, b]];
const cornerLocations = [[D, R, F], [R, U, F], [U, L, F], [L, D, F], [R, D, B], [U, R, B], [L, U, B], [D, L, B]];
const edgeLocations = [[F, D], [F, R], [F, U], [F, L], [D, R], [U, R], [U, L], [D, L], [B, D], [B, R], [B, U], [B, L]];
const edgeColors = [[g, y], [g, r], [g, w], [g, o], [y, r], [w, r], [w, o], [y, o], [b, y], [b, r], [b, w], [b, o]];

class EventEmitter {
  constructor() { this.listeners = {}; }
  on(label, callback) { if (!this.listeners[label]) this.listeners[label] = []; this.listeners[label].push(callback); }
  emit(label, ...args) { if (this.listeners[label]) this.listeners[label].forEach(listener => listener(...args)); }
}

class Giiker extends EventEmitter {
  constructor() {
    super();
    this._onCharacteristicValueChanged = this._onCharacteristicValueChanged.bind(this);
    this._onDisconnected = this._onDisconnected.bind(this);
  }

  async connect() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Gi' }],
      optionalServices: [SERVICE_UUID, SYSTEM_SERVICE_UUID]
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
    await characteristic.startNotifications();
    const value = await characteristic.readValue();
    this._state = this._parseCubeValue(value).state;
    characteristic.addEventListener('characteristicvaluechanged', this._onCharacteristicValueChanged);
    this._systemService = await server.getPrimaryService(SYSTEM_SERVICE_UUID);
    device.addEventListener('gattserverdisconnected', this._onDisconnected);
    this._device = device;
  }

  disconnect() {
    if (this._device) this._device.gatt.disconnect();
  }

  _onDisconnected() {
    this._device = null;
    this.emit('disconnected');
  }

  _onCharacteristicValueChanged(event) {
    const value = event.target.value;
    const {state, moves} = this._parseCubeValue(value);
    this._state = state;
    this.emit('move', moves[0]);
  }

  _parseCubeValue(value) {
    const state = { cornerPositions: [], cornerOrientations: [], edgePositions: [], edgeOrientations: [] };
    const moves = [];
    
    if (value.getUint8(18) == 0xa7) {
      var key = [176, 81, 104, 224, 86, 137, 237, 119, 38, 26, 193, 161, 210, 126, 150, 81, 93, 13, 236, 249, 89, 235, 88, 24, 113, 81, 214, 131, 130, 199, 2, 169, 39, 165, 171, 41];
      var k = value.getUint8(19);
      var k1 = k >> 4 & 0xf;
      var k2 = k & 0xf;
      for (let i = 0; i < value.byteLength; i++) {
        const move = (value.getUint8(i) + key[i + k1] + key[i + k2]) & 0xff;
        const highNibble = move >> 4;
        const lowNibble = move & 0b1111;
        if (i < 4) {
          state.cornerPositions.push(highNibble, lowNibble);
        } else if (i < 8) {
          state.cornerOrientations.push(highNibble, lowNibble);
        } else if (i < 14) {
          state.edgePositions.push(highNibble, lowNibble);
        } else if (i < 16) {
          state.edgeOrientations.push(!!(move & 0b10000000), !!(move & 0b01000000), !!(move & 0b00100000), !!(move & 0b00010000));
          if (i === 14) {
            state.edgeOrientations.push(!!(move & 0b00001000), !!(move & 0b00000100), !!(move & 0b00000010), !!(move & 0b00000001));
          }
        } else {
          moves.push(this._parseMove(highNibble, lowNibble));
        }
      }
    } else {
      for (let i = 0; i < value.byteLength; i++) {
        const move = value.getUint8(i);
        const highNibble = move >> 4;
        const lowNibble = move & 0b1111;
        if (i < 4) {
          state.cornerPositions.push(highNibble, lowNibble);
        } else if (i < 8) {
          state.cornerOrientations.push(highNibble, lowNibble);
        } else if (i < 14) {
          state.edgePositions.push(highNibble, lowNibble);
        } else if (i < 16) {
          state.edgeOrientations.push(!!(move & 0b10000000), !!(move & 0b01000000), !!(move & 0b00100000), !!(move & 0b00010000));
          if (i === 14) {
            state.edgeOrientations.push(!!(move & 0b00001000), !!(move & 0b00000100), !!(move & 0b00000010), !!(move & 0b00000001));
          }
        } else {
          moves.push(this._parseMove(highNibble, lowNibble));
        }
      }
    }
    return {state, moves};
  }

  _parseMove(faceIndex, turnIndex) {
    const face = cubeFaces[faceIndex - 1];
    const amount = turns[turnIndex - 1];
    let notation = face;
    switch (amount) {
      case 2: notation = `${face}2`; break;
      case -1: notation = `${face}'`; break;
      case -2: notation = `${face}2'`; break;
    }
    return {face, amount, notation};
  }
}

// Expose BluetoothCube globally
window.BluetoothCube = BluetoothCube;

})();